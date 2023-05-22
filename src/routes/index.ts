import { Router } from 'express';
import { lndRoutes } from './lndRoutes';
import { ludRoutes } from './ludRoutes';
import { healthcheck } from './healthCheck';

const router = Router();

router.use('/lnd', lndRoutes);
router.use('/lnurl', ludRoutes);
router.use('/healthcheck', healthcheck);

export default router;
