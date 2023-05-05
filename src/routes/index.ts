import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import Validation from '../util/Validator';
import PaymentValidator from '../lib/PaymentValidator';

const router = Router();

// router.get(
// 	'/lnd/deposits/',
// 	PaymentValidator.getPaymentRequest(),
// 	Validation.validate,
// 	PaymentsController.getPaymentRequest,
// );

router.get(
	'/lnd/withdrawals/',
	PaymentValidator.getPaymentRequest(),
	Validation.validate,
	PaymentsController.getWithdrawalRequest,
);

export default router;
