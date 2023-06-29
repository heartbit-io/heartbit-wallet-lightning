import { Router } from 'express';
import { lndRoutes } from './lndRoutes';
import { ludRoutes } from './ludRoutes';
import { healthcheck } from './healthCheck';
import AuthUtil from '../utils/AuthUtil';

const router = Router();

router.use('/lnd', AuthUtil.verifyKeyAndToken, lndRoutes);
router.use('/lnurl', ludRoutes);
router.use('/healthcheck', healthcheck);

export default router;
