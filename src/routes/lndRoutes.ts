import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import ValidationHandler from '../utils/ValidationHandler';
import Validator from '../utils/Validator';

const router = Router();

router.get(
	'/deposits',
	Validator.validateEmaliAndAmount(),
	ValidationHandler.handleError,
	PaymentsController.getPaymentRequest,
);

router.get(
	'/withdrawals',
	Validator.validateEmaliAndAmount(),
	ValidationHandler.handleError,
	PaymentsController.getWithdrawalRequest,
);

export { router as lndRoutes };
