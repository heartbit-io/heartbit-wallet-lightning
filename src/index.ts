import express, { Express, Request, Response } from 'express';
import router from './routes';
import initNode from './util/connectLnd';
// import LightningService from './services/LightningService';

const app: Express = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
	res.send('Typescript + Node.js + Express Server');
});

app.listen(port, async () => {
	console.log(`[server]: Server is running at <https://localhost>:${port}`);
	await initNode();
	// LightningService.getLNDAdmin();
});
