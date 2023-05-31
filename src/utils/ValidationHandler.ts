import * as Sentry from '@sentry/node';

import { NextFunction, Request, Response } from 'express';

import { HttpCodes } from '../enums/HttpCodes';
import ResponseDto from '../dto/ResponseDto';
import { validationResult } from 'express-validator';

class ValidationHandler {
	static handleError(req: Request, res: Response, next: NextFunction) {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			Sentry.captureMessage(
				`Validation error: ${error
					.array()
					.map(e => e.msg)
					.join(', ')}
				`,
			);
			return res
				.status(HttpCodes.BAD_REQUEST)
				.json(
					new ResponseDto(false, HttpCodes.BAD_REQUEST, error.array(), null),
				);
		}
		next();
	}
}
export default ValidationHandler;
