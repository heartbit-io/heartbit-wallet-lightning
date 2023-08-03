import * as Sentry from '@sentry/node';
import express, { Express, Request, Response } from 'express';
import { onLNDDeposit, onLNDWithdrawal } from './events/LNDEvent';
import { AuthenticatedLnd } from 'lightning';
import { HttpCodes } from './enums/HttpCodes';
import ResponseDto from './dto/ResponseDto';
import cors from 'cors';
import env from './config/env';
import helmet from 'helmet';
import initLND from './config/initLND';
import initLUD from './config/initLUD';
import logger from './utils/logger';
import { onLUDFail } from './events/LUDEvent';
import dataSource from './domains/repo';
import router from './routes';
import NodeCache from 'node-cache';
import { ORIGIN_CAVEAT_CONFIGS, TIME_CAVEAT_CONFIGS, boltwall } from 'boltwall';
import { lsatRoutes } from './routes/lsatRoutes';
import { BoltwallConfig } from 'boltwall/dist/typings';

const app: Express = express();
const port = Number(env.SERVER_PORT);

Sentry.init({
	dsn: env.SENTRY_DSN,
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Sentry.Integrations.Express({ app }),
		// Automatically instrument Node.js libraries and frameworks
		...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
	],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,

	// Don't capture local error
	enabled:
		process.env.NODE_ENV === 'production' ||
		process.env.NODE_ENV === 'development',
});

// RequestHandler creates a separate execution context, so that all
// transactions/spans/breadcrumbs are isolated across requests
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', router);

const {
	TIME_CAVEAT,
	ORIGIN_CAVEAT,
	ROUTE_CAVEAT,
	BOLTWALL_OAUTH,
	BOLTWALL_HODL,
	BOLTWALL_MIN_AMOUNT,
	BOLTWALL_RATE,
} = process.env;
let options: BoltwallConfig = {};
options.LND_SOCKET = initLND();
if (TIME_CAVEAT) options = TIME_CAVEAT_CONFIGS;
if (ORIGIN_CAVEAT) options = ORIGIN_CAVEAT_CONFIGS;
if (ROUTE_CAVEAT) options = TIME_CAVEAT_CONFIGS;
if (BOLTWALL_OAUTH) options.oauth = false;
if (BOLTWALL_HODL) options.hodl = false;
if (BOLTWALL_RATE) options.rate = BOLTWALL_RATE;
if (BOLTWALL_MIN_AMOUNT) options.minAmount = BOLTWALL_MIN_AMOUNT;
// eslint-disable-next-line
// @ts-ignore
app.use(boltwall(options));

app.use('/api/v1/lsat/', lsatRoutes);

// UnKnown Routes
app.all('*', (req: Request, res: Response) => {
	const message = `Route ${req.originalUrl} not found`;
	logger.warn(message);
	return res
		.status(HttpCodes.NOT_FOUND)
		.json(new ResponseDto(false, HttpCodes.NOT_FOUND, message, null));
});

const cache = new NodeCache({
	stdTTL: 60 * 60 * 24 * 1,
	checkperiod: 60 * 60 * 24 * 1,
});

let lnd: AuthenticatedLnd;
let lud: any;

app.listen(port, async () => {
	try {
		// init database
		await dataSource.initialize();
		// init lnd and lud
		lnd = await initLND();
		lud = await initLUD();
		// init event listener for lnd and lud
		await onLNDDeposit(lnd);
		// await onLNDWithdrawal(lnd);
		await onLUDFail(lud);
	} catch (error) {
		console.error(error);
		Sentry.captureMessage(`Server initialization error: ${error}`);
		logger.error(error);
	}
});

export { lnd, lud, cache };
