import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import Validation from '../utils/Validator';
import PaymentValidator from '../libs/PaymentValidator';

const router = Router();

router.get(
	'/lnd/deposits/',
	PaymentValidator.getPaymentRequest(),
	Validation.validate,
	PaymentsController.getPaymentRequest,
);

router.get(
	'/lnd/withdrawals/',
	PaymentValidator.getPaymentRequest(),
	Validation.validate,
	PaymentsController.getWithdrawalRequest,
);

router.get('/lnurl/withdraw/', PaymentsController.payInvoice);

export default router;
