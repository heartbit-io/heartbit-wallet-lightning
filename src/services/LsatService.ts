import LNDUtil from '../utils/LNDUtil';
import {
	Caveat,
	Lsat,
	expirationSatisfier,
	getRawMacaroon,
	verifyMacaroonCaveats,
} from 'lsat-js';
import { HttpCodes } from '../enums/HttpCodes';
import { lnd } from '..';
import logger from '../utils/logger';
import { CustomError } from '../libs/CustomError';
import env from '../config/env';
import { sha256 } from 'js-sha256';
// eslint-disable-next-line
// @ts-ignore
import * as Macaroon from 'macaroon';
import ResponseDto from '../dto/ResponseDto';
class LSatServices {
	async generateLSATChallenge(
		email: string,
		amount: number,
		requestBody: string,
	) {
		try {
			const lsatRequest = await this.generateLSAT(email, amount, requestBody);
			return new ResponseDto(
				false,
				HttpCodes.PAYMENT_REQUIRED,
				'Payment required',
				lsatRequest,
			);
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

	async generateLSAT(email: string, amount: number, requestBody: string) {
		const macaroon = Macaroon.newMacaroon({
			version: 1,
			rootKey: env.SESSION_STRING,
			identifier: env.LND_MACAROON.toString(),
			location: env.BASE_SERVER_URL,
		});
		const invoice = await LNDUtil.requestPayment(lnd, Number(amount), email);
		const rawMacaroon = getRawMacaroon(macaroon);

		// return `L402 macaroon="${rawMacaroon}", invoice="${invoice.request}"`;

		const lsat = Lsat.fromMacaroon(rawMacaroon, invoice.request);

		const caveat = Caveat.decode(
			'bodyHash=' + sha256.update(JSON.stringify(requestBody)),
		);

		const caveatExpiry = new Caveat({
			condition: 'expiration',
			value: Date.now() + 600000,
		});

		lsat.addFirstPartyCaveat(caveat);
		lsat.addFirstPartyCaveat(caveatExpiry);

		return lsat.toToken();
	}

	verifyLsatToken(lsatToken: any, bodyHash: string): boolean {
		try {
			// const bodyhash: string = '' + sha256.update(JSON.stringify(requestBody));
			const lsat = Lsat.fromToken(lsatToken);

			if (lsat.isExpired() || !lsat.isSatisfied) return false;

			const result = verifyMacaroonCaveats(
				lsat.baseMacaroon,
				env.SESSION_STRING,
				expirationSatisfier,
			);
			// check if macaroon is not tampered
			if (!result) return false;

			const caveats = lsat.getCaveats();

			// check if the body hash matches
			for (const caveat of caveats) {
				if (caveat.condition === 'bodyHash' && caveat.value !== bodyHash) {
					return false;
				}
			}
		} catch (error) {
			return false;
		}

		return true;
	}
}

export default new LSatServices();
