import { config } from 'dotenv';
config();

const env = {
	LND_GRPC_URL: process.env.LND_GRPC_URL as string,
	LND_MACAROON: process.env.LND_MACAROON as string,
	LND_TLS: process.env.LND_TLS as string,
	LND_HOST: process.env.LND_HOST as string,
	LND_PORT: process.env.LND_PORT as string,
	SERVER_PORT: process.env.SERVER_PORT as string,
	BASE_SERVER_URL: process.env.BASE_SERVER_URL as string,
	DB_NAME: process.env.DB_NAME as string,
	DB_USER: process.env.DB_USER as string,
	DB_PASSWORD: process.env.DB_PASSWORD as string,
	DB_HOST: process.env.DB_HOST as string,
	DB_DRIVER: process.env.DB_DRIVER as string,
	NODE_ENV: process.env.NODE_ENV as string,
	TEST_DB_NAME: process.env.TEST_DB_NAME as string,
	LND_TLS_PATH: process.env.LND_TLS_PATH as string,
	LND_MACAROON_PATH: process.env.LND_MACAROON_PATH as string,
	LNURL_SERVER_PORT: process.env.LNURL_SERVER_PORT as string,
};

Object.entries(env).forEach(([key, value]) => {
	if (!value) {
		throw new Error(`Required environment variable '${key}' is missing!`);
	}
});

export default env;
