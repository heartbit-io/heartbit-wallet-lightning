import { AuthenticatedLnd } from 'lightning';
import { TxTypes } from '../enums/TxTypes';
import logger from '../utils/logger';
import LNDUtil from '../utils/LNDUtil';
import { CustomError } from '../libs/CustomError';
import { HttpCodes } from '../enums/HttpCodes';
import dataSource, {
	userRepository,
	btcTransactionRepository,
} from '../domains/repo';

async function onLNDDeposit(lnd: AuthenticatedLnd): Promise<boolean> {
	await LNDUtil.depositEventOn(lnd, async (event: any) => {
		const queryRunner = dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction('REPEATABLE READ');

		try {
			const { description, is_confirmed, received } = event;
			logger.info({ ...event });
			console.log({ ...event });
			if (!is_confirmed) return;

			const amount = Number(received);

			const email = description ? description : null;
			if (!email)
				throw new CustomError(
					HttpCodes.BAD_REQUEST,
					'Email not found in description',
				);

			const user = await userRepository.findOneBy({ email: email });
			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			await userRepository.update(user.id, {
				btcBalance: user.btcBalance + amount,
			});

			await btcTransactionRepository.save({
				amount: amount,
				fee: 0,
				type: TxTypes.DEPOSIT,
				fromUserPubkey: 'user_deposit',
				toUserPubkey: email,
			});
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
