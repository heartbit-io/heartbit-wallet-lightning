import { Router } from 'express';
import PaymentsController from '../controllers/PaymentsController';
import Validation from '../util/Validator';
import PaymentValidator from '../lib/PaymentValidator';

const router = Router();

router.get(
	'/paymentrequest',
	PaymentValidator.paymentRequest(),
	Validation.validate,
	PaymentsController.getPaymentRequest,
);

export default router;
