import * as Sentry from '@sentry/node';

import { NextFunction, Request, Response } from 'express';
import { HttpCodes } from '../enums/HttpCodes';
import ResponseDto from '../dto/ResponseDto';
import env from '../config/env';

class AuthUtil {
	static async verifyKey(req: Request, res: Response, next: NextFunction) {
		const key = req?.headers?.authorization;
		try {
			if (key === env.API_KEY) return next();
			Sentry.captureMessage(`[${HttpCodes.UNAUTHORIZED}] Unauthorized`);
			return res
				.status(HttpCodes.UNAUTHORIZED)
				.json(
					new ResponseDto(false, HttpCodes.UNAUTHORIZED, 'Unauthorized', null),
				);
		} catch (error) {
			Sentry.captureMessage(`[${HttpCodes.INTERNAL_SERVER_ERROR}] ${error}`);
			return res
				.status(HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(false, HttpCodes.INTERNAL_SERVER_ERROR, error, null),
				);
		}
	}
}

export default AuthUtil;
