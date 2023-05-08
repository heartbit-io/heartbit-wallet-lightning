import lnurl from 'lnurl';
import env from '../config/env';

const lnurlServer = lnurl.createServer({
	host: 'localhost',
	url: 'api/v1/',
	port: env.SERVER_PORT,
	endpoint: 'lnd/withdraw',
	auth: {
		apiKeys: [],
	},
	lightning: {
		backend: 'lnd',
		config: {
			hostname: env.LND_GRPC_URL,
			cert: env.LND_TLS,
			macaroon: env.LND_MACAROON,
		},
	},
	store: {
		backend: 'memory',
	},
});

export default lnurlServer;
