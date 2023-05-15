import LightningService from '../services/LightningService';
import { Request, Response } from 'express';
import FormatResponse from '../util/FormatResponse';
import { HttpCodes } from '../util/HttpCodes';
import UserBalanceService from '../services/UserBalanceService';
import { lnd } from '..';
import lnurlServer from '../util/lnurlServer';
import logger from '../util/logger';

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
				lnd,
				Number(amount),
				userEmail,
			);
			return response
				.status(200)
				.json(
					new FormatResponse(
						true,
						HttpCodes.OK,
						'Payment request created successfully',
						paymentRequest.request,
					),
				);
		} catch (error) {
			logger.error(error);
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

		const requestAmount = Number(amount);
		try {
			//check that user has enough balance
			const user = await UserBalanceService.getUserBtcBalance(email);

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

			if (userBalance < requestAmount) {
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

			const tag = 'withdrawRequest';
			const amountInmsat = requestAmount * 1000;
			const params = {
				minWithdrawable: 1000,
				maxWithdrawable: amountInmsat,
				defaultDescription: email,
			};
			const options = {
				uses: 1,
			};

			const withdrawRequest = await lnurlServer.generateNewUrl(
				tag,
				params,
				options,
			);
			logger.info(withdrawRequest);
			console.log(withdrawRequest);
			return response
				.status(HttpCodes.OK)
				.json(
					new FormatResponse(
						true,
						HttpCodes.OK,
						'Withdrawal created successfully',
						withdrawRequest.encoded,
					),
				);
		} catch (error) {
			logger.error(error);
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

	async payInvoice(request: Request, response: Response) {
		let { invoice } = request.query;
		if (!invoice) {
			return response
				.status(HttpCodes.BAD_REQUEST)
				.json(
					new FormatResponse(
						false,
						HttpCodes.BAD_REQUEST,
						'Invoice not provided',
						null,
					),
				);
		}
		try {
			invoice = invoice as string;
			const payment = await LightningService.makePayment(lnd, invoice);
			if (!payment.is_confirmed) {
				return response
					.status(HttpCodes.UNPROCESSED_CONTENT)
					.json(
						new FormatResponse(
							false,
							HttpCodes.UNPROCESSED_CONTENT,
							'Payment failed',
							null,
						),
					);
			}
			return response
				.status(HttpCodes.OK)
				.json(
					new FormatResponse(true, HttpCodes.OK, 'Payment successful', payment),
				);
		} catch (error) {
			logger.error(error);
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
