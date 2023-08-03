import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response, query } from 'express';
import { HttpCodes } from '../enums/HttpCodes';
import ResponseDto from '../dto/ResponseDto';
import LsatService from '../services/LsatService';
import logger from '../utils/logger';
import { Lsat } from 'lsat-js';

class LSatController {
	async createChallenge(request: Request, response: Response) {
		const { email, amount } = request.query as unknown as {
			email: string;
			amount: number;
		};
		try {
			const paymentRequest = await LsatService.generateLSATChallenge(
				email,
				Number(amount),
				request.body,
			);

			return response
				.setHeader('WWW-Authenticate', paymentRequest.data)
				.status(HttpCodes.PAYMENT_REQUIRED)
				.json({
					success: false,
					statusCode: HttpCodes.PAYMENT_REQUIRED,
					message: 'Payment required',
					data: null,
				});
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

	async verifyLsat(request: Request, response: Response, next: NextFunction) {
		const { email, amount } = request.query as unknown as {
			email: string;
			amount: number;
		};

		try {
			const header = request?.headers?.['www-authenticate'];

			if (!header) {
				return await this.createChallenge(request, response);
			}

			const lsatToken = Lsat.fromHeader(header);

			const verifyLsatToken = LsatService.verifyLsatToken(
				lsatToken,
				request.body,
			);

			if (!verifyLsatToken) {
				return await this.createChallenge(request, response);
			}
			return next();
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
