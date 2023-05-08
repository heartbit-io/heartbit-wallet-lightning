import { body, param, query } from 'express-validator';
import DatabaseService from '../services/UserBalanceService';
import { Request } from 'express';

class PaymentValidator {
	getPaymentRequest() {
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
}

export default new PaymentValidator();
