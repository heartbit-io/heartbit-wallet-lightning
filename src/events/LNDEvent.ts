import { AuthenticatedLnd } from 'lightning';
import { TxTypes } from '../enums/TxTypes';
import logger from '../utils/logger';
import LNDUtil from '../utils/LNDUtil';
import { CustomError } from '../libs/CustomError';
import { HttpCodes } from '../enums/HttpCodes';
import dataSource from '../domains/repo';
import { User } from '../domains/entities/User';
import { BtcTransaction } from '../domains/entities/BtcTransaction';
import FBUtil from '../utils/FBUtil';
import * as Sentry from '@sentry/node';

async function onLNDDeposit(lnd: AuthenticatedLnd): Promise<boolean> {
	await LNDUtil.depositEventOn(lnd, async (event: any) => {
		const { description, is_confirmed, received } = event;
		if (!is_confirmed) return;
		logger.log(event);

		const queryRunner = dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction('REPEATABLE READ');

		try {
			const amount = Number(received);

			const email = description ? description : null;
			if (!email)
				throw new CustomError(
					HttpCodes.BAD_REQUEST,
					'Email not found in description',
				);

			const user = await queryRunner.manager
				.getRepository(User)
				.createQueryBuilder('user')
				.useTransaction(true)
				.setLock('pessimistic_write')
				.where('user.email = :email', { email: email })
				.getOne();
			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			await queryRunner.manager.insert(BtcTransaction, {
				amount: amount,
				fee: 0,
				type: TxTypes.DEPOSIT,
				fromUserPubkey: email,
				toUserPubkey: email,
				createdAt: () => 'CURRENT_TIMESTAMP',
				updatedAt: () => 'CURRENT_TIMESTAMP',
			});

			await queryRunner.manager.update(User, user.id, {
				btcBalance: () => `btc_balance + ${amount}`,
			});

			await queryRunner.commitTransaction();

			/*
				Don't rollback even when push noti fail(not a big deal)
				Don't await for asynchronous performance
			*/
			FBUtil.sendNotification(
				user.fcmToken,
				'HeartBit',
				`You have successfully deposited ${amount.toLocaleString()} sats.`,
				{ type: 'TRANSACTION' },
			);
		} catch (error: any) {
			logger.error(error);
			Sentry.captureMessage(
				`[${error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR}] ${
					error.message
				}`,
			);
			await queryRunner.rollbackTransaction();
		} finally {
			await queryRunner.release();
		}
	});

	return true;
}

async function onLNDWithdrawal(lnd: AuthenticatedLnd): Promise<boolean> {
	await LNDUtil.withdrawalEventOn(
		lnd,
		async (event: any) => {
			try {
				console.log(event);
			} catch (error: any) {
				logger.error(error);
			}
		},
		(err: any) => {
			console.log(err);
			logger.error(err);
		},
	);
	return true;
}

export { onLNDDeposit, onLNDWithdrawal };
