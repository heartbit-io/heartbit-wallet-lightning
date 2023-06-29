import * as Sentry from '@sentry/node';

import { NextFunction, Request, Response } from 'express';
import { HttpCodes } from '../enums/HttpCodes';
import ResponseDto from '../dto/ResponseDto';
import env from '../config/env';
import admin from '../config/initFB';
import { logger } from '@sentry/utils';

class AuthUtil {
	static async verifyKeyAndToken(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		const key = req?.headers?.apikey as string;
		const token = req?.headers?.authorization?.split(' ')[1] as string;
		try {
			const user = await admin.auth().verifyIdToken(token);
			if (key === env.API_KEY && user.email_verified) return next();

			// if not authorized, check who he is
			console.log(user.email);
			logger.log(user.email);

			Sentry.captureMessage(`[${HttpCodes.UNAUTHORIZED}] Unauthorized`);

			return res
				.status(HttpCodes.UNAUTHORIZED)
				.json(
					new ResponseDto(false, HttpCodes.UNAUTHORIZED, 'Unauthorized', null),
				);
		} catch (err) {
			console.error(err);
			logger.error(err);

			Sentry.captureMessage(`[${HttpCodes.INTERNAL_SERVER_ERROR}] ${err}`);

			return res
				.status(HttpCodes.INTERNAL_SERVER_ERROR)
				.json(
					new ResponseDto(false, HttpCodes.INTERNAL_SERVER_ERROR, err, null),
				);
		}
	}
}

export default AuthUtil;
