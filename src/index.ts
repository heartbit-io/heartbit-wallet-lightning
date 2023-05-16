import express, { Express, Request, Response } from 'express';
import router from './routes';
import helmet from 'helmet';
import cors from 'cors';
import { initNode } from './util/lndConnection';
import LightningService from './services/LightningService';
import { AuthenticatedLnd } from 'lightning';
import env from './config/env';
import { TxTypes } from './enums/TxTypes';
import TransactionService from './services/TransactionService';
import UserBalanceService from './services/UserBalanceService';
import logger from './util/logger';
import TxRequestService from './services/TxRequestService';

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
		lnd = await initNode();
		const status = await LightningService.connectionStatus(lnd);
		if (status) {
			console.log('[server]: LND node connection successful');
		} else {
			logger.error('[server]: LND node connection failed');
			throw new Error('[server]: LND node connection failed');
		}
		await LightningService.depositEventOn(lnd, async (event: any) => {
			const { description, is_confirmed, received } = event;
			logger.info({ ...event });
			console.log({ ...event });
			if (!is_confirmed) return;

			const amount = Number(received);

			const email = description ? description : null;

			if (!email) return;
			const userBalance = await UserBalanceService.getUserBtcBalance(email);

			let userBtcBalance = 0;
			if (userBalance) {
				userBtcBalance = userBalance.get('btcBalance') as number;
			}

			const newBalance = userBtcBalance + amount;

			await UserBalanceService.updateUserBtcBalance(email, newBalance);

			await TransactionService.createTransaction({
				amount,
				fromUserPubkey: 'user_deposit',
				toUserPubkey: email,
				fee: 0,
				type: TxTypes.DEPOSIT,
			});
		});

		await LightningService.withdrawalEventOn(
			lnd,
			async (event: any) => {
				const { confirmed_at, tokens, description, secret } = event;
				// secret
				console.log(event);
				if (!confirmed_at) return;

				const amount = Number(tokens) / 1000;

				const email = description ? description : null;

				if (!email) {
					const userWithWithdrawRequest =
						await TxRequestService.getTxRequestBySecret(secret);

					if (userWithWithdrawRequest) {
						const user_id = userWithWithdrawRequest.get('user_id');
						const user = await UserBalanceService.getUserDetailsById(user_id);

						if (user) {
							const userBtcBalance = user.get('btcBalance') as number;
							const newBalance = userBtcBalance - amount;
							await UserBalanceService.updateUserBtcBalance(email, newBalance);
							await TransactionService.createTransaction({
								amount,
								fromUserPubkey: email,
								toUserPubkey: 'user_withdraw',
								fee: 0,
								type: TxTypes.WITHDRAW,
							});

							await TxRequestService.updateRequestStatus(secret);
						}
					}
					return;
				} else {
					const userBalance = await UserBalanceService.getUserBtcBalance(email);

					let userBtcBalance = 0;

					if (userBalance) {
						userBtcBalance = userBalance.get('btcBalance') as number;
					}

					const newBalance = userBtcBalance - amount;

					await UserBalanceService.updateUserBtcBalance(email, newBalance);

					await TransactionService.createTransaction({
						amount,
						fromUserPubkey: email,
						toUserPubkey: 'user_withdraw',
						fee: 0,
						type: TxTypes.WITHDRAW,
					});
				}
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
