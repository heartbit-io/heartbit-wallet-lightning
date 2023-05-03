import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import Validation from '../util/Validator';
import PaymentValidator from '../lib/PaymentValidator';

const router = Router();

router.get(
	'/requestpayment',
	PaymentValidator.requestPayment(),
	Validation.validate,
	PaymentsController.requestPayment,
);

router.post(
	'/payinvoice',
	PaymentValidator.payInvoice(),
	Validation.validate,
	PaymentsController.payInvoice,
);

export default router;
