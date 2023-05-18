import { Request, Response } from 'express';
import ResponseDto from '../dto/ResponseDto';
import { HttpCodes } from '../enums/HttpCodes';
import logger from '../utils/logger';
import PaymentService from '../services/PaymentService';
import { PayResult } from 'lightning';

class PaymentsController {
	async getPaymentRequest(
		request: Request,
		response: Response,
	): Promise<Response<ResponseDto<string>>> {
		try {
			const { email, amount } = request.query;

			const paymentRequest: string = await PaymentService.getPaymentRequest(
				email as string,
				Number(amount),
			);

			return response
				.status(200)
				.json(
					new ResponseDto(
						true,
						HttpCodes.OK,
						'Payment request created successfully',
						paymentRequest,
					),
				);
		} catch (error: any) {
			logger.error(error);
			return response
				.status(error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(
						false,
						error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR,
						error.message ? error.code : 'HTTP error',
						null,
					),
				);
		}
	}

	async getWithdrawalRequest(
		request: Request,
		response: Response,
	): Promise<Response<ResponseDto<string>>> {
		try {
			const { email, amount } = request.query;
			const withdrawalRequest: string =
				await PaymentService.getWithdrawalRequest(
					email as string,
					Number(amount),
				);
			return response
				.status(HttpCodes.OK)
				.json(
					new ResponseDto(
						true,
						HttpCodes.OK,
						'Withdrawal created successfully',
						withdrawalRequest,
					),
				);
		} catch (error: any) {
			logger.error(error);
			return response
				.status(error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(
						false,
						error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR,
						error.message ? error.code : 'HTTP error',
						null,
					),
				);
		}
	}

	async payInvoice(
		request: Request,
		response: Response,
	): Promise<Response<ResponseDto<string>>> {
		const { invoice } = request.query;
		if (!invoice) {
			return response
				.status(HttpCodes.BAD_REQUEST)
				.json(
					new ResponseDto(
						false,
						HttpCodes.BAD_REQUEST,
						'Invoice not provided',
						null,
					),
				);
		}
		try {
			const payment: PayResult = await PaymentService.payInvoice(
				invoice as string,
			);
			return response
				.status(HttpCodes.OK)
				.json(
					new ResponseDto(true, HttpCodes.OK, 'Payment successful', payment),
				);
		} catch (error: any) {
			logger.error(error);
			return response
				.status(error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(
						false,
						error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR,
						error.message ? error.code : 'HTTP error',
						null,
					),
				);
		}
	}
}

export default new PaymentsController();
