import LNDUtil from '../utils/LNDUtil';
import { HttpCodes } from '../enums/HttpCodes';
import { User } from '../domains/models/UserModel';
import { lnd, lud } from '..';
import logger from '../utils/logger';
import { TxRequest } from '../domains/models/TxRequestModel';
import { CustomError } from '../libs/CustomError';
import { PayResult } from 'lightning';

class PaymentsService {
	async getPaymentRequest(email: string, amount: number): Promise<string> {
		try {
			const paymentRequest = await LNDUtil.requestPayment(
				lnd,
				Number(amount),
				email,
			);
			return paymentRequest.request;
		} catch (error: any) {
			logger.error(error);
			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		}
	}

	async getWithdrawalRequest(email: string, amount: number): Promise<string> {
		try {
			/*
			//check that user has enough balance
			const user = await User.findOne({ where: { email: email } });

			if (!user) throw new CustomError(HttpCodes.NOT_FOUND, 'User not found');

			const userBalance = user.get('btcBalance') as number;

			if (userBalance < Number(amount))
				throw new CustomError(
					HttpCodes.UNPROCESSED_CONTENT,
					'Insufficient balance',
				);
*/
			const tag = 'withdrawRequest';
			const amountInmsat = Number(amount) * 1000;
			const params = {
				minWithdrawable: 1000,
				maxWithdrawable: amountInmsat,
				defaultDescription: email,
			};
			const options = {
				uses: 1,
			};

			const withdrawRequest = await lud.generateNewUrl(tag, params, options);
			/*
			await TxRequest.create({
				amount: Number(amount),
				userId: user.get('id') as number,
				secret: withdrawRequest.secret,
			});
*/

			return withdrawRequest.encoded;
		} catch (error: any) {
			logger.error(error);
			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		}
	}

	async payInvoice(invoice: string): Promise<PayResult> {
		try {
			invoice = invoice as string;
			const payment = await LNDUtil.makePayment(lnd, invoice);
			if (!payment.is_confirmed)
				throw new CustomError(HttpCodes.UNPROCESSED_CONTENT, 'Payment failed');
			return payment;
		} catch (error: any) {
			logger.error(error);
			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		}
	}
}

export default new PaymentsService();
