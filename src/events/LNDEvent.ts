import { AuthenticatedLnd } from 'lightning';
import { TxTypes } from '../enums/TxTypes';
import logger from '../utils/logger';
import { User } from '../domains/models/UserModel';
import { BtcTransaction } from '../domains/models/BtcTransactionModel';
import { TxRequest } from '../domains/models/TxRequestModel';
import { TxRequestStatus } from '../enums/TxRequestStatus';
import LNDUtil from '../utils/LNDUtil';
import { CustomError } from '../libs/CustomError';
import { HttpCodes } from '../enums/HttpCodes';

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

			const user = await User.findOne({ where: { email: email } });
			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			await user.update({ btcBalance: user.get('btcBalance') + amount });

			await BtcTransaction.create({
				amount,
				fromUserPubkey: 'user_deposit',
				toUserPubkey: email,
				fee: 0,
				type: TxTypes.DEPOSIT,
			});

			await user.save();
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
					const userWithWithdrawRequest = await TxRequest.findOne({
						where: { secret, status: TxRequestStatus.CREATED },
					});

					if (userWithWithdrawRequest) {
						const userId = userWithWithdrawRequest.get('userId');
						const user = await User.findOne({ where: { id: userId } });

						if (user) {
							email = user.get('email') as string;
						}
					}
				}

				const user = await User.findOne({ where: { email: email } });
				if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

				await user.update({ btcBalance: user.get('btcBalance') - amount });

				await BtcTransaction.create({
					amount,
					fromUserPubkey: email,
					toUserPubkey: 'user_withdraw',
					fee: 0,
					type: TxTypes.WITHDRAW,
				});

				await user.save();
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
