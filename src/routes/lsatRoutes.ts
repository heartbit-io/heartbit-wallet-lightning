import { Router } from 'express';
import LSatController from '../controllers/LSatController';

const router = Router();

router.get('/deposits', LSatController.createChallenge);

export { router as lsatRoutes };
