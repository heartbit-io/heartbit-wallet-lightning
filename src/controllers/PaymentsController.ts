import * as Sentry from '@sentry/node';

import { Request, Response } from 'express';

import { HttpCodes } from '../enums/HttpCodes';
import PaymentService from '../services/PaymentService';
import ResponseDto from '../dto/ResponseDto';
import logger from '../utils/logger';
import WithdrawalInfoDto from '../dto/WithdrawalInfoDto';

class PaymentsController {
	async getPaymentRequest(
		request: Request,
		response: Response<ResponseDto<string | null>>,
	): Promise<Response<ResponseDto<string>>> {
		// type request first
		const { email, amount } = request.query as unknown as {
			email: string;
			amount: number;
		};
		try {
			const paymentRequest: string = await PaymentService.getPaymentRequest(
				email,
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
			Sentry.captureMessage(
				`[${HttpCodes.INTERNAL_SERVER_ERROR}] ${error.message}`,
			);
			return response
				.status(error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(
						false,
						error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR,
						error.message ? error.message : 'HTTP error',
						null,
					),
				);
		}
	}

	async getWithdrawalRequest(
		request: Request,
		response: Response<ResponseDto<string | null>>,
	): Promise<Response<ResponseDto<string>>> {
		// type request first
		const { email, amount } = request.query as unknown as {
			email: string;
			amount: number;
		};
		try {
			const withdrawalRequest: string =
				await PaymentService.getWithdrawalRequest(email, Number(amount));
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
			Sentry.captureMessage(
				`[${HttpCodes.INTERNAL_SERVER_ERROR}] ${error.message}`,
			);
			return response
				.status(error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(
						false,
						error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR,
						error.message ? error.message : 'HTTP error',
						null,
					),
				);
		}
	}

	async getWithdrawalInfo(
		request: Request,
		response: Response<WithdrawalInfoDto | string>,
	): Promise<Response<WithdrawalInfoDto | string>> {
		// type request first
		const { q } = request.query as unknown as { q: string };
		const secret = q;
		try {
			const withdrawalInfo: WithdrawalInfoDto =
				await PaymentService.getWithdrawalInfo(secret);
			return response.status(HttpCodes.OK).json(withdrawalInfo);
		} catch (error: any) {
			logger.error(error);
			Sentry.captureMessage(
				`[${HttpCodes.INTERNAL_SERVER_ERROR}] ${error.message}`,
			);
			return response
				.status(error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR)
				.json(error.message ? error.message : 'HTTP error');
		}
	}

	async payWithdrawalInvoice(
		request: Request,
		// lud spec return type
	): Promise<{ status: string; reason?: string }> {
		// type request first
		const { k1, pr } = request.query as unknown as { k1: string; pr: string };
		const secret = k1;
		const invoice = pr;
		try {
			await PaymentService.payWithdrawalInvoice(secret, invoice);
			return { status: 'OK' };
		} catch (error: any) {
			logger.error(error);
			Sentry.captureMessage(
				`[${HttpCodes.INTERNAL_SERVER_ERROR}] ${error.message}`,
			);
			return {
				status: 'ERROR',
				reason: error.message ? error.message : 'HTTP error',
			};
		}
	}
}

export default new PaymentsController();
