import { body, param, query } from 'express-validator';

class PaymentValidator {
	paymentRequest() {
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
