import { Router, Request, Response } from 'express';
import LightningService from '../services/LightningService';

const router = Router();

router.get('/connection', (req: Request, res: Response) => {
	return res.status(200).json({ message: LightningService.getLNDAdmin() });
});

export default router;
