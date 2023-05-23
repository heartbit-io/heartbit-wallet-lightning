import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import ValidationHandler from '../utils/ValidationHandler';
import Validator from '../utils/Validator';

const router = Router();

router.get(
	'/withdrawals',
	Validator.validateInvoice,
	ValidationHandler.handleError,
	PaymentsController.payInvoice,
);

export { router as ludRoutes };
