import { body, param, query } from 'express-validator';

class Validator {
	static validateEmaliAndAmount() {
		return [
			query('email')
				.isString()
				.notEmpty()
				.isEmail()
				.rtrim()
				.escape()
				.withMessage('provide a valid email'),
			query('amount')
				.isNumeric()
				.notEmpty()
				.withMessage(
					'indicate invoice amount in satoshis, e.g. 1000 for 0.00001000 BTC',
				),
		];
	}

	static validateInvoice() {
		return [
			query('invoice')
				.isString()
				.notEmpty()
				.withMessage('provide a valid invoice'),
		];
	}
}

export default Validator;
