const lnurl = require('lnurl');
import env from '../config/env';

const lnurlServer = lnurl.createServer({
	host: 'localhost',
	url: `http://localhost:${env.SERVER_PORT}`,
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

export default lnurlServer;
