import express, { Express, Request, Response } from 'express';
import router from './routes';
import helmet from 'helmet';
import cors from 'cors';
import env from './config/env';
import logger from './utils/logger';
import { HttpCodes } from './enums/HttpCodes';
import initLND from './config/initLND';
import { AuthenticatedLnd } from 'lightning';
import initLUD from './config/initLUD';
import { onLNDDeposit, onLNDWithdrawal } from './events/LNDEvent';
import { onLUDFail } from './events/LUDEvent';
import initDB from './domains/initDB';
import ResponseDto from './dto/ResponseDto';

const app: Express = express();
const port = Number(env.SERVER_PORT);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// handle cors errors
app.use((_req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token',
	);
	next();
});

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
	res.send('Typescript + Node.js + Express Server');
});

// UnKnown Routes
app.all('*', (req: Request, res: Response) => {
	const message = `Route ${req.originalUrl} not found`;
	logger.warn(message);
	return res
		.status(HttpCodes.NOT_FOUND)
		.json(new ResponseDto(false, HttpCodes.NOT_FOUND, message, null));
});

let lnd: AuthenticatedLnd;
let lud: any;

app.listen(port, async () => {
	try {
		// init database
		initDB.sync();
		// init lnd and lud
		lnd = await initLND();
		lud = await initLUD();
		// init event listener for lnd and lud
		await onLNDDeposit(lnd);
		await onLNDWithdrawal(lnd);
		await onLUDFail(lud);
	} catch (error) {
		console.error(error);
		logger.error(error);
	}
});

export { lnd, lud };
