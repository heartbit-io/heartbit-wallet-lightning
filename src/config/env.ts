import { config } from 'dotenv';
config();

const env = {
	LND_GRPC_URL: process.env.LND_GRPC_URL as string,
	LND_MACAROON: process.env.LND_MACAROON as string,
	LND_TLS: process.env.LND_TLS as string,
};

Object.entries(env).forEach(([key, value]) => {
	if (!value) {
		throw new Error(`Required environment variable '${key}' is missing!`);
	}
});

export default env;
