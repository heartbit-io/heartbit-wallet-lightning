import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import HttpValidator from '../utils/HttpValidator';
import PaymentValidator from '../utils/PaymentValidator';

const router = Router();

router.get(
	'/lnd/deposits/',
	PaymentValidator.getPaymentRequest(),
	HttpValidator.validate,
	PaymentsController.getPaymentRequest,
);

router.get(
	'/lnd/withdrawals/',
	PaymentValidator.getPaymentRequest(),
	HttpValidator.validate,
	PaymentsController.getWithdrawalRequest,
);

router.get('/lnurl/withdrawals/', PaymentsController.payInvoice);

export default router;
