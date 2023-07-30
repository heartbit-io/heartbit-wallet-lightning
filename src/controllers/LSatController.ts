import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { HttpCodes } from '../enums/HttpCodes';
import ResponseDto from '../dto/ResponseDto';
import LsatService from '../services/LsatService';
import logger from '../utils/logger';

class LSatController {
	async makeDeposit(
		request: Request,
		response: Response<ResponseDto<string | null>>,
	) {
		const { email, amount } = request.query as unknown as {
			email: string;
			amount: number;
		};
		try {
			const paymentRequest = await LsatService.generateLSATRequest(
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
				`[${error.code ? error.code : HttpCodes.INTERNAL_SERVER_ERROR}] ${
					error.message
				}`,
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
}

export default new LSatController();
