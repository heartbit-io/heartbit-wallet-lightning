const lnurl = require('lnurl');

import env from '../../config/env';
import logger from '../logger';

const host =
	env.NODE_ENV === 'development'
		? `localhost`
		: 'https://dev-wallet-lnd-api.heartbit.io';

const lnurlServer = lnurl.createServer({
	host,
	url: `${host}:${env.SERVER_PORT}`,
	port: env.SERVER_PORT,
	endpoint: '/api/V1/lnurl/withdraw',
	auth: {
		apiKeys: [],
	},
	lightning: {
		backend: 'lnd',
		config: {
			hostname: env.LND_HOST,
			cert: env.LND_TLS_PATH,
			macaroon: env.LND_MACAROON_PATH,
		},
	},
	store: {
		backend: 'knex',
		config: {
			client: 'postgres',
			connection: {
				host: env.DB_HOST,
				user: env.DB_USER,
				password: env.DB_PASSWORD,
				database: env.DB_NAME,
			},
		},
	},
});
/*
lnurlServer.on(
	'withdrawRequest:action:processed',
	async (event: { secret: any; params: any; result: any }) => {
		logger.info(event);
		console.log(event);
		const { params, result } = event;

		const { id, amount, fee, tag } = result;

		const { email } = params;

		const feePercent = 0.01;

		const userBalance = await UserBalanceService.getUserBtcBalance(email);

		let userBtcBalance = 0;
		if (userBalance) {
			userBtcBalance = userBalance.get('btcBalance') as number;
		}

		const localTxFee = feePercent * Number(amount);
		const totalFee = Number(fee) + localTxFee;

		const totalAmount = Number(amount) + totalFee;

		const newBalance = userBtcBalance - totalAmount;

		await UserBalanceService.updateUserBtcBalance(email, newBalance);

		//save transaction
		await TransactionService.createTransaction({
			id,
			amount: totalAmount,
			fromUserPubkey: tag,
			toUserPubkey: email,
			fee: totalFee,
			type: TxTypes.WITHDRAW,
		});

		//send email to user
	},
);
*/
lnurlServer.on('withdrawRequest:action:failed', (event: any) => {
	logger.error(event);
	console.log(event);
});

export default lnurlServer;
