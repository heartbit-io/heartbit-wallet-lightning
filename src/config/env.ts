import { config } from 'dotenv';
config();

const env = {
	LND_GRPC_URL: process.env.LND_GRPC_URL as string,
	LND_MACAROON: process.env.LND_MACAROON as string,
	LND_TLS: process.env.LND_TLS as string,
	DB_NAME: process.env.DB_NAME as string,
	DB_USER: process.env.DB_USER as string,
	DB_PASSWORD: process.env.DB_PASSWORD as string,
	DB_HOST: process.env.DB_HOST as string,
	DB_DRIVER: process.env.DB_DRIVER as string,
	NODE_ENV: process.env.NODE_ENV as string,
	TEST_DB_NAME: process.env.TEST_DB_NAME as string,
};

Object.entries(env).forEach(([key, value]) => {
	if (!value) {
		throw new Error(`Required environment variable '${key}' is missing!`);
	}
});

export default env;
