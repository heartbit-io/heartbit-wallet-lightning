import LNDUtil from '../utils/LNDUtil';
import { HttpCodes } from '../enums/HttpCodes';
import { lnd, lud } from '..';
import logger from '../utils/logger';
import { CustomError } from '../libs/CustomError';
import { PayResult } from 'lightning';
import dataSource, { userRepository } from '../domains/repo';
import NodeCache from 'node-cache';
import { TxTypes } from '../enums/TxTypes';
import WithdrawalInfoDto from '../dto/WithdrawalInfoDto';
import { User } from '../domains/entities/User';
import { BtcTransaction } from '../domains/entities/BtcTransaction';
import env from '../config/env';

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
				defaultDescription: email,
				minWithdrawable: 1000,
				maxWithdrawable: amountInmsat,
			};
			const options = {
				uses: 1,
			};

			const withdrawRequest = await lud.generateNewUrl(tag, params, options);

			if (
				!nodeCache.set(
					withdrawRequest.secret,
					new WithdrawalInfoDto(
						tag,
						env.BASE_SERVER_DOMAIN + 'lnurl/withdrawals/payments',
						withdrawRequest.secret,
						params.defaultDescription,
						params.minWithdrawable,
						params.maxWithdrawable,
					),
				)
			)
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

	async getWithdrawalInfo(secret: string): Promise<WithdrawalInfoDto> {
		try {
			const withdrawalInfo: WithdrawalInfoDto | undefined =
				nodeCache.get(secret);
			if (withdrawalInfo === undefined)
				throw new CustomError(HttpCodes.BAD_REQUEST, 'Invalid q value');
			return withdrawalInfo;
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

	async payWithdrawalInvoice(secret: string, invoice: string): Promise<void> {
		const queryRunner = dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction('REPEATABLE READ');

		try {
			secret = secret as string;
			invoice = invoice as string;

			const withdrawalInfo: WithdrawalInfoDto | undefined =
				nodeCache.get(secret);
			if (withdrawalInfo === undefined)
				throw new CustomError(HttpCodes.BAD_REQUEST, 'Invalid k1 value');

			const user = await queryRunner.manager.findOneBy(User, {
				email: withdrawalInfo.defaultDescription as string,
			});
			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			const payment: PayResult = await LNDUtil.makePayment(lnd, invoice);
			if (!payment.is_confirmed)
				throw new CustomError(HttpCodes.UNPROCESSED_CONTENT, 'Payment failed');

			await queryRunner.manager.update(User, user.id, {
				btcBalance: () => `btc_balance - ${payment.tokens}`,
			});

			await queryRunner.manager.insert(BtcTransaction, {
				amount: payment.tokens,
				fromUserPubkey: withdrawalInfo.defaultDescription as string,
				toUserPubkey: 'user_withdraw',
				fee: Math.ceil(payment.tokens * 0.01),
				type: TxTypes.WITHDRAW,
			});

			await queryRunner.commitTransaction();
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
