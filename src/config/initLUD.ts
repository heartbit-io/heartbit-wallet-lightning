const lnurl = require('lnurl');

import env from './env';

const lud = lnurl.createServer({
	host: 'localhost', // should be localhost as point out local server
	// url: 'https://dev-wallet-lnd-api.heartbit.io', // url reached by external server
	url: 'localhost:8080', // for local testing
	port: env.LND_PORT,
	listen: true,
	endpoint: '/api/v1/lnurl/withdrawals',
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

export default lud;
