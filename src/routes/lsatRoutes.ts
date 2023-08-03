import { Router } from 'express';
import LSatController from '../controllers/LSatController';

const router = Router();

router.get('/verifylsat', LSatController.verifyLsat);

export { router as lsatRoutes };
