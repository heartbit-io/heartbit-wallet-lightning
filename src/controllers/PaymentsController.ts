import LightningService from '../services/LightningService';
import { Request, Response } from 'express';
import FormatResponse from '../util/FormatResponse';
import { HttpCodes } from '../util/HttpCodes';

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
}

export default new PaymentsController();
