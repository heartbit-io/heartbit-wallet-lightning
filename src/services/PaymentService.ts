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
			const amountInMsat = Number(amount) * 1000;
			// Let's not count the floating point for fee
			const feeInMsat = Math.floor(amount * 0.01) * 1000;
			const params = {
				defaultDescription: email,
				minWithdrawable: 1000,
				maxWithdrawable: amountInMsat - feeInMsat,
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

			const user = await queryRunner.manager
				.getRepository(User)
				.createQueryBuilder('user')
				.useTransaction(true)
				.setLock('pessimistic_write')
				.where('user.email = :email', {
					email: withdrawalInfo.defaultDescription as string,
				})
				.getOne();
			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			const withdrawalSat = (withdrawalInfo.maxWithdrawable / 1000) as number;

			const btcTx = await queryRunner.manager.insert(BtcTransaction, {
				amount: withdrawalSat,
				fromUserPubkey: withdrawalInfo.defaultDescription as string,
				toUserPubkey: withdrawalInfo.defaultDescription as string,
				fee: Math.floor(withdrawalSat / 99),
				type: TxTypes.WITHDRAW,
				createdAt: () => 'CURRENT_TIMESTAMP',
				updatedAt: () => 'CURRENT_TIMESTAMP',
			});

			await queryRunner.manager.update(User, user.id, {
				btcBalance: () => `btc_balance - ${withdrawalSat}`,
			});

			await queryRunner.commitTransaction();

			const payment: PayResult = await LNDUtil.makePayment(lnd, invoice);
			if (!payment.is_confirmed) {
				await queryRunner.startTransaction('REPEATABLE READ');
				/*
				If payment is not confirmed, rollback committed transaction
				As committed one cannot be rolled back automatically,
				Need to roll back manually
				*/

				// delete last btc transaction inserted
				await queryRunner.manager.delete(
					BtcTransaction,
					btcTx.identifiers[0].id,
				);

				// recover user balance
				await queryRunner.manager
					.getRepository(User)
					.createQueryBuilder('user')
					.useTransaction(true)
					.setLock('pessimistic_write')
					.update(User)
					.set({
						btcBalance: () => `btc_balance + ${withdrawalSat}`,
					})
					.where('id = :id', { id: user.id })
					.execute();

				await queryRunner.commitTransaction();

				throw new CustomError(HttpCodes.UNPROCESSED_CONTENT, 'Payment failed');
			} else {
				try {
					nodeCache.del(secret);
				} catch (error) {
					throw new CustomError(
						HttpCodes.SERVICE_UNAVAILABLE,
						'Cache delete failed',
					);
				}
			}
		} catch (error: any) {
			console.log(error);
			logger.error(error);
			// automatic rollback except lightning payment or cache delete failure
			error.message != 'Payment failed' ||
			error.message != 'Cache delete failed'
				? await queryRunner.rollbackTransaction()
				: '';

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
