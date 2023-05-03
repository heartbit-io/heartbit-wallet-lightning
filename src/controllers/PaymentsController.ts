import LightningService from '../services/LightningService';
import { Request, Response } from 'express';
import FormatResponse from '../util/FormatResponse';
import { HttpCodes } from '../util/HttpCodes';
import DatabaseService from '../services/DatabaseService';

export interface ResponseDto<T> {
	success: boolean;
	statusCode: number;
	message: string;
	data?: T;
}

class PaymentsController {
	async requestPayment(
		request: Request,
		response: Response,
	): Promise<Response<FormatResponse>> {
		const { email, amount } = request.query;

		const userEmail = email as string;

		try {
			const paymentRequest = await LightningService.requestPayment(
				Number(amount),
				userEmail,
			);

			return response
				.status(200)
				.json(
					new FormatResponse(
						true,
						HttpCodes.OK,
						'Payment request generated successfully',
						paymentRequest,
					),
				);
		} catch (error) {
			return response
				.status(HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new FormatResponse(
						false,
						HttpCodes.INTERNAL_SERVER_ERROR,
						error,
						null,
					),
				);
		}
	}

	async payInvoice(
		request: Request,
		response: Response,
	): Promise<Response<FormatResponse>> {
		const { invoice } = request.body;

		try {
			const { email } = request.body;
			//check that user has enough balance
			const user = await DatabaseService.getUserBtcBalance(email);

			if (!user) {
				return response
					.status(HttpCodes.NOT_FOUND)
					.json(
						new FormatResponse(
							false,
							HttpCodes.NOT_FOUND,
							'User not found',
							null,
						),
					);
			}

			const userBalance = user.get('btcBalance') as number;

			//decode invoice and check that the user sufficient balance
			// const invoiceAmount = await LightningService.decodeInvoice(invoice);

			const payment = await LightningService.makePayment(invoice);

			if (!payment.is_confirmed) {
				return response
					.status(HttpCodes.INTERNAL_SERVER_ERROR)
					.json(
						new FormatResponse(
							false,
							HttpCodes.INTERNAL_SERVER_ERROR,
							'Payment failed',
							null,
						),
					);
			}

			//update user balance
			// const updatedUser = await DatabaseService.updateUserBtcBalance(email, amount)

			return response
				.status(200)
				.json(
					new FormatResponse(true, HttpCodes.OK, 'Payment successful', payment),
				);
		} catch (error) {
			return response
				.status(HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new FormatResponse(
						false,
						HttpCodes.INTERNAL_SERVER_ERROR,
						error,
						null,
					),
				);
		}
	}
}

export default new PaymentsController();
