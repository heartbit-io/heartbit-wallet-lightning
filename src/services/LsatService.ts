import LNDUtil from '../utils/LNDUtil';
import { Lsat } from 'lsat-js';
import { HttpCodes } from '../enums/HttpCodes';
import { lnd } from '..';
import logger from '../utils/logger';
import { CustomError } from '../libs/CustomError';
import env from '../config/env';

class LSatServices {
	async generateLSATRequest(email: string, amount: number) {
		try {
			const lsatRequest = await this.generateLSAT(email, amount);
			return lsatRequest.toChallenge();
		} catch (error: any) {
			logger.error(error);
			throw error.code && error.message
				? error
				: new CustomError(
						HttpCodes.INTERNAL_SERVER_ERROR,
						'Internal Server Error',
				  );
		}
	}

	async generateLSAT(email: string, amount: number) {
		const macaroon = env.LND_MACAROON;
		const paymentRequest = await LNDUtil.requestPayment(
			lnd,
			Number(amount),
			email,
		);
		const lsat = Lsat.fromMacaroon(macaroon);
		const result = Lsat.fromMacaroon(macaroon, paymentRequest.request);
		return result;
	}
}

export default new LSatServices();
