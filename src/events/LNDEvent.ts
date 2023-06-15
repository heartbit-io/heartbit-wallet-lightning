import { AuthenticatedLnd } from 'lightning';
import { TxTypes } from '../enums/TxTypes';
import logger from '../utils/logger';
import LNDUtil from '../utils/LNDUtil';
import { CustomError } from '../libs/CustomError';
import { HttpCodes } from '../enums/HttpCodes';
import dataSource from '../domains/repo';
import { User } from '../domains/entities/User';
import { BtcTransaction } from '../domains/entities/BtcTransaction';

async function onLNDDeposit(lnd: AuthenticatedLnd): Promise<boolean> {
	await LNDUtil.depositEventOn(lnd, async (event: any) => {
		const queryRunner = dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction('REPEATABLE READ');

		try {
			const { description, is_confirmed, received } = event;

			if (!is_confirmed) return;

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
		} catch (error: any) {
			logger.error(error);
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
