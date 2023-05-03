import { config } from 'dotenv';
config();

const env = {
	LND_PORT: process.env.LND_PORT as string,
	LND_GRPC_URL: process.env.LND_GRPC_URL as string,
	LND_MACAROON: process.env.LND_MACAROON as string,
	LND_TLS_CERT: process.env.LND_TLS_CERT as string,
};

Object.entries(env).forEach(([key, value]) => {
	if (!value) {
		throw new Error(`Required environment variable '${key}' is missing!`);
	}
});

export default env;
