import LNDUtil from '../utils/LNDUtil';
import { HttpCodes } from '../enums/HttpCodes';
import { lnd, lud } from '..';
import logger from '../utils/logger';
import { CustomError } from '../libs/CustomError';
import { pay, PayResult } from 'lightning';
import dataSource, {
	userRepository,
	btcTransactionRepository,
} from '../domains/repo';
import NodeCache from 'node-cache';
import { TxTypes } from '../enums/TxTypes';

const nodeCache = new NodeCache({
	stdTTL: 60 * 60 * 24 * 3,
	checkperiod: 60 * 60 * 24 * 3,
});

class PaymentsService {
	async getPaymentRequest(email: string, amount: number): Promise<string> {
		try {
			const paymentRequest = await LNDUtil.requestPayment(
				lnd,
				Number(amount),
				email,
			);
			return paymentRequest.request;
		} catch (error: any) {
			logger.error(error);
			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		}
	}

	async getWithdrawalRequest(email: string, amount: number): Promise<string> {
		try {
			//check that user has enough balance
			const user = await userRepository.findOneBy({ email: email });

			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			if (user.btcBalance < Number(amount))
				throw new CustomError(
					HttpCodes.UNPROCESSED_CONTENT,
					'Insufficient balance',
				);

			const tag = 'withdrawRequest';
			const amountInmsat = Number(amount) * 1000;
			const params = {
				minWithdrawable: 1000,
				maxWithdrawable: amountInmsat,
				defaultDescription: email,
			};
			const options = {
				uses: 1,
			};

			const withdrawRequest = await lud.generateNewUrl(tag, params, options);

			if (!nodeCache.set(withdrawRequest.secret, user.email))
				throw new CustomError(
					HttpCodes.INTERNAL_SERVER_ERROR,
					'Cache unavailable',
				);

			return withdrawRequest.encoded;
		} catch (error: any) {
			logger.error(error);
			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		}
	}

	async payInvoice(secret: string, invoice: string): Promise<void> {
		const queryRunner = dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction('REPEATABLE READ');

		try {
			secret = secret as string;
			invoice = invoice as string;

			const email = nodeCache.get(secret);
			if (email === undefined)
				throw new CustomError(HttpCodes.BAD_REQUEST, 'Invalid k1 value');

			const user = await userRepository.findOneBy({ email: email as string });
			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			const payment: PayResult = await LNDUtil.makePayment(lnd, invoice);
			if (!payment.is_confirmed)
				throw new CustomError(HttpCodes.UNPROCESSED_CONTENT, 'Payment failed');

			await userRepository.update(user.id, {
				btcBalance: user.btcBalance - payment.tokens,
			});

			await btcTransactionRepository.save({
				amount: payment.tokens,
				fromUserPubkey: email as string,
				toUserPubkey: 'user_withdraw',
				fee: 0,
				type: TxTypes.WITHDRAW,
			});

			nodeCache.del(secret);
		} catch (error: any) {
			logger.error(error);

			await queryRunner.rollbackTransaction();

			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		} finally {
			await queryRunner.release();
		}
	}
}

export default new PaymentsService();
