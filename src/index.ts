import express, { Express, Request, Response } from 'express';
import router from './routes';
import helmet from 'helmet';
import cors from 'cors';
import initLND from './util/lightning/initLND';
import LNDUtil from './util/lightning/LNDUtil';
import { AuthenticatedLnd } from 'lightning';
import env from './config/env';
import { TxTypes } from './enums/TxTypes';
import logger from './util/logger';
import { User } from './models/UserModel';
import { BtcTransaction } from './models/BtcTransactionModel';
import { TxRequest } from './models/TxRequestModel';
import { TxRequestStatus } from './enums/TxRequestStatus';

const app: Express = express();
const port = Number(env.SERVER_PORT);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
	res.send('Typescript + Node.js + Express Server');
});

let lnd: AuthenticatedLnd;

app.listen(port, async () => {
	try {
		console.log(`[server]: Server is running at <https://localhost>:${port}`);
		lnd = await initLND();
		const status = await LNDUtil.connectionStatus(lnd);
		if (status) {
			console.log('[server]: LND node connection successful');
		} else {
			logger.error('[server]: LND node connection failed');
			throw new Error('[server]: LND node connection failed');
		}
		await LNDUtil.depositEventOn(lnd, async (event: any) => {
			const { description, is_confirmed, received } = event;
			logger.info({ ...event });
			console.log({ ...event });
			if (!is_confirmed) return;

			const amount = Number(received);

			const email = description ? description : null;

			if (!email) throw new Error('Email not found');
			const user = await User.findOne({ where: { email: email } });
			if (!user) throw new Error('User not found');
			const currentBalance = user.get('btcBalance') as number;

			await user.update({ btcBalance: currentBalance + amount });

			await BtcTransaction.create({
				amount,
				fromUserPubkey: 'user_deposit',
				toUserPubkey: email,
				fee: 0,
				type: TxTypes.DEPOSIT,
			});

			await user.save();
		});

		await LNDUtil.withdrawalEventOn(
			lnd,
			async (event: any) => {
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
				if (!user) throw new Error('User not found');
				const currentBalance = user.get('btcBalance') as number;

				await user.update({ btcBalance: currentBalance - amount });

				await BtcTransaction.create({
					amount,
					fromUserPubkey: email,
					toUserPubkey: 'user_withdraw',
					fee: 0,
					type: TxTypes.WITHDRAW,
				});

				await user.save();
			},
			(error: any) => {
				console.log(error);
				logger.error(error);
			},
		);
	} catch (error) {
		console.error(error);
		logger.error(error);
	}
});

export { lnd };
