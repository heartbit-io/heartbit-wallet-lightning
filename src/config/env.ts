import { config } from 'dotenv';
config();

const env = {
	LND_GRPC_URL: process.env.LND_GRPC_URL as string,
	LND_MACAROON: process.env.LND_MACAROON as string,
	LND_TLS: process.env.LND_TLS as string,
	LND_HOST: process.env.LND_HOST as string,
	LND_PORT: process.env.LND_PORT as string,
	LUD_PORT: process.env.LUD_PORT as string,
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
	SENTRY_DSN: process.env.SENTRY_DSN as string,
	BASE_SERVER_DOMAIN: process.env.BASE_SERVER_DOMAIN as string,
	API_KEY: process.env.API_KEY as string,
	FB_SERVICE_ACCOUNT: process.env.FB_SERVICE_ACCOUNT as string,
	FB_PROJECT_ID: process.env.FB_PROJECT_ID as string,
	FB_PRIVATE_KEY_ID: process.env.FB_PRIVATE_KEY_ID as string,
	FB_PRIVATE_KEY: process.env.FB_PRIVATE_KEY as string,
	FB_CLIENT_EMAIL: process.env.FB_CLIENT_EMAIL as string,
	FB_CLIENT_ID: process.env.FB_CLIENT_ID as string,
	FB_AUTH_URI: process.env.FB_AUTH_URI as string,
	FB_TOKEN_URI: process.env.FB_TOKEN_URI as string,
	FB_AUTH_PROVIDER_X509_CERT_URL: process.env
		.FB_AUTH_PROVIDER_X509_CERT_URL as string,
	FB_CLIENT_X509_CERT_URL: process.env.FB_CLIENT_X509_CERT_URL as string,
	FB_API_KEY: process.env.FB_API_KEY as string,
	FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN as string,
	FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET as string,
	FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID as string,
	FB_APP_ID: process.env.FB_APP_ID as string,
	FB_MEASUREMENT_ID: process.env.FB_MEASUREMENT_ID as string,
	SESSION_STRING: process.env.SESSION_SECRET as string,
};

Object.entries(env).forEach(([key, value]) => {
	if (!value) {
		throw new Error(`Required environment variable '${key}' is missing!`);
	}
});

export default env;
