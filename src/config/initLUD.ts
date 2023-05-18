const lnurl = require('lnurl');

import env from './env';
import logger from '../utils/logger';

const host =
	env.NODE_ENV === 'development'
		? `localhost`
		: 'https://dev-wallet-lnd-api.heartbit.io';

async function initLUD(): Promise<any> {
	const lud: any = lnurl.createServer({
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

	lud.on('withdrawRequest:action:failed', (event: any) => {
		logger.error(event);
		console.log(event);
	});

	return lud;
}

export default initLUD;
