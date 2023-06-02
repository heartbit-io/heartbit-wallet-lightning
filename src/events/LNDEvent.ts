import { AuthenticatedLnd } from 'lightning';
import { TxTypes } from '../enums/TxTypes';
import logger from '../utils/logger';
import { TxRequestStatus } from '../enums/TxRequestStatus';
import LNDUtil from '../utils/LNDUtil';
import { CustomError } from '../libs/CustomError';
import { HttpCodes } from '../enums/HttpCodes';
import {
	userRepository,
	btcTransactionRepository,
	txRequestRepository,
} from '../domains/repo';

async function onLNDDeposit(lnd: AuthenticatedLnd): Promise<boolean> {
	await LNDUtil.depositEventOn(lnd, async (event: any) => {
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
		} catch (err) {
			console.log(err);
			logger.error(err);
		}
	});

	return true;
}

async function onLNDWithdrawal(lnd: AuthenticatedLnd): Promise<boolean> {
	await LNDUtil.withdrawalEventOn(
		lnd,
		async (event: any) => {
			try {
				const { confirmed_at, tokens, description, secret } = event;
				// secret
				console.log(event);
				if (!confirmed_at) return;

				const amount = Number(tokens) / 1000;

				let email = description ? description : null;

				if (!email) {
					const userWithWithdrawRequest = await txRequestRepository.findOneBy({
						secret,
						status: TxRequestStatus.CREATED,
					});

					if (userWithWithdrawRequest) {
						const userId = userWithWithdrawRequest.userId;
						const user = await userRepository.findOneBy({ id: userId });

						if (user) {
							email = user.email;
						}
					}
				}

				const user = await userRepository.findOneBy({ email: email });
				if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

				await userRepository.update(user.id, {
					btcBalance: user.btcBalance - amount,
				});

				await btcTransactionRepository.save({
					amount,
					fromUserPubkey: email,
					toUserPubkey: 'user_withdraw',
					fee: 0,
					type: TxTypes.WITHDRAW,
				});
			} catch (err) {
				console.log(err);
				logger.error(err);
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
