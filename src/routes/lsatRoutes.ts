import { Router } from 'express';
import LSatController from '../controllers/LSatController';

const router = Router();

router.get('/deposits', LSatController.makeDeposit);

export { router as lsatRoutes };
