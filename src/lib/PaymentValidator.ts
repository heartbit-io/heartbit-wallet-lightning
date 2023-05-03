import { body, param, query } from 'express-validator';
import DatabaseService from '../services/DatabaseService';

class PaymentValidator {
	requestPayment() {
		return [
			query('email')
				.isString()
				.notEmpty()
				.isEmail()
				.rtrim()
				.escape()
				.withMessage('supply a valid email'),
			query('amount')
				.isNumeric()
				.notEmpty()
				.withMessage(
					'indicate invoice amount in satoshis, e.g. 1000 for 0.00001000 BTC',
				),
		];
	}
	payInvoice() {
		return [
			body('invoice')
				.isString()
				.notEmpty()
				.rtrim()
				.escape()
				.withMessage('supply a valid invoice'),
			body('email')
				.isString()
				.notEmpty()
				.isEmail()
				.rtrim()
				.escape()
				.withMessage('supply a valid email'),
		];
	}
}

export default new PaymentValidator();
