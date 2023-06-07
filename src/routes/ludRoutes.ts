import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import ValidationHandler from '../utils/ValidationHandler';
import Validator from '../utils/Validator';

const router = Router();

router.get(
	'/withdrawals',
	Validator.validateSecret(),
	ValidationHandler.handleError,
	PaymentsController.getWithdrawalInfo,
);

router.get(
	'/withdrawals/payments',
	Validator.validateSecretAndInvoice(),
	ValidationHandler.handleError,
	PaymentsController.payWithdrawalInvoice,
);

export { router as ludRoutes };
