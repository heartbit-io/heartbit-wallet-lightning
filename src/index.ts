import express, { Express, Request, Response } from 'express';
import router from './routes';
import helmet from 'helmet';
import cors from 'cors';
import { initNode } from './util/lndConnection';
import LightningService from './services/LightningService';
import { AuthenticatedLnd } from 'lightning';

const app: Express = express();
const port = 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
	res.send('Typescript + Node.js + Express Server');
});

let lnd: AuthenticatedLnd;

try {
	app.listen(port, async () => {
		console.log(`[server]: Server is running at <https://localhost>:${port}`);
		lnd = await initNode();
		const status = await LightningService.connectionStatus(lnd);
		if (status) {
			console.log('[server]: LND node connection successful');
		} else {
			throw new Error('[server]: LND node connection failed');
		}
	});
} catch (error) {
	console.log(error);
}

export { lnd };
