import { Router } from 'express';
import { lndRoutes } from './lndRoutes';
import { ludRoutes } from './ludRoutes';
import { healthcheck } from './healthCheck';
import FBUtil from '../utils/FBUtil';

const router = Router();

router.use('/lnd', FBUtil.verifyKeyAndToken, lndRoutes);
router.use('/lnurl', ludRoutes);
router.use('/healthcheck', healthcheck);

export default router;
