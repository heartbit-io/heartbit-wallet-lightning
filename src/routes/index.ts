import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import ValidationHandler from '../utils/ValidationHandler';
import Validator from '../utils/Validator';

const router = Router();

router.get(
	'/lnd/deposits/',
	Validator.validateEmaliAndAmount(),
	ValidationHandler.handleError,
	PaymentsController.getPaymentRequest,
);

router.get(
	'/lnd/withdrawals/',
	Validator.validateEmaliAndAmount(),
	ValidationHandler.handleError,
	PaymentsController.getWithdrawalRequest,
);

router.get(
	'/lnurl/withdrawals/',
	Validator.validateInvoice(),
	ValidationHandler.handleError,
	PaymentsController.payInvoice,
);

export default router;
