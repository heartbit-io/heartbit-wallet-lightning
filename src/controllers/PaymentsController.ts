import LightningService from '../services/LightningService';
import { Request, Response } from 'express';
import FormatResponse from '../util/FormatResponse';
import { HttpCodes } from '../util/HttpCodes';
import DatabaseService from '../services/UserBalanceService';

export interface ResponseDto<T> {
	success: boolean;
	statusCode: number;
	message: string;
	data?: T;
}

class PaymentsController {
	async getPaymentRequest(
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

	async getWithdrawalRequest(
		request: Request,
		response: Response,
	): Promise<Response<FormatResponse>> {
		const { amount } = request.query;

		const email = request.query.email as string;

		try {
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

			if (userBalance < Number(amount)) {
				return response
					.status(HttpCodes.UNPROCESSED_CONTENT)
					.json(
						new FormatResponse(
							false,
							HttpCodes.UNPROCESSED_CONTENT,
							'Insufficient balance',
							null,
						),
					);
			}

			// TODO: implement withdrawal url using lnurl
			// const payment = await LightningService.makePayment(invoice);

			// if (!payment.is_confirmed) {
			// 	return response
			// 		.status(HttpCodes.UNPROCESSED_CONTENT)
			// 		.json(
			// 			new FormatResponse(
			// 				false,
			// 				HttpCodes.UNPROCESSED_CONTENT,
			// 				'Payment failed',
			// 				null,
			// 			),
			// 		);
			// }
			// //update user balance

			// const newBalance = userBalance - amount;
			// await DatabaseService.updateUserBtcBalance(email, newBalance);

			return response
				.status(HttpCodes.OK)
				.json(
					new FormatResponse(true, HttpCodes.OK, 'Withdrawal successful', user),
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
