import { body, param, query } from 'express-validator';

class Validator {
	static validateEmaliAndAmount() {
		return [
			query('email')
				.isString()
				.trim() // trim should be in advance of notEmpty
				.notEmpty()
				.isEmail()
				.escape()
				.withMessage('provide a valid email'),
			query('amount')
				.isNumeric()
				.notEmpty()
				.escape()
				.withMessage(
					'indicate invoice amount in satoshis, e.g. 1000 for 0.00001000 BTC',
				),
		];
	}

	static validateInvoice() {
		return [
			query('invoice')
				.isString()
				.trim()
				.notEmpty()
				.escape()
				.withMessage('provide a valid invoice'),
		];
	}
}

export default Validator;
