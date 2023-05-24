import express, { Express, Request, Response } from 'express';
import router from './routes';
import helmet from 'helmet';
import cors from 'cors';
import env from './config/env';
import logger from './utils/logger';
import { HttpCodes } from './enums/HttpCodes';
import initLND from './config/initLND';
import { AuthenticatedLnd } from 'lightning';
import { onLNDDeposit, onLNDWithdrawal } from './events/LNDEvent';
import { onLUDFail } from './events/LUDEvent';
import lud from './config/initLUD';
import initDB from './domains/initDB';
import ResponseDto from './dto/ResponseDto';

const app: Express = express();
const port = Number(env.SERVER_PORT);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', router);

// UnKnown Routes
app.all('*', (req: Request, res: Response) => {
	const message = `Route ${req.originalUrl} not found`;
	logger.warn(message);
	return res
		.status(HttpCodes.NOT_FOUND)
		.json(new ResponseDto(false, HttpCodes.NOT_FOUND, message, null));
});

let lnd: AuthenticatedLnd;

app.listen(port, async () => {
	try {
		// init database
		initDB.sync();
		// init lnd and lud
		lnd = await initLND();
		// init event listener for lnd and lud
		await onLNDDeposit(lnd);
		await onLNDWithdrawal(lnd);
		await onLUDFail(lud);
	} catch (error) {
		console.error(error);
		logger.error(error);
	}
});

export { lnd };
