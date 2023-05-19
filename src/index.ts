import express, { Express, Request, Response } from 'express';
import router from './routes';
import helmet from 'helmet';
import cors from 'cors';
import env from './config/env';
import logger from './utils/logger';

import initLND from './config/initLND';
import { AuthenticatedLnd } from 'lightning';
import initLUD from './config/initLUD';
import { onLNDDeposit, onLNDWithdrawal } from './events/LNDEvent';
import { onLUDFail } from './events/LUDEvent';

const app: Express = express();
const port = Number(env.SERVER_PORT);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
	res.send('Typescript + Node.js + Express Server');
});

let lnd: AuthenticatedLnd;
let lud: any;

app.listen(port, async () => {
	try {
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
