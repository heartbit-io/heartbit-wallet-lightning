import env from './env';
import { authenticatedLndGrpc, AuthenticatedLnd } from 'lightning';
import logger from '../utils/logger';
import LNDUtil from '../utils/LNDUtil';

async function initLND(): Promise<AuthenticatedLnd> {
	const { lnd } = authenticatedLndGrpc({
		cert: '',
		macaroon: env.LND_MACAROON,
		socket: env.LND_GRPC_URL,
	});
	const status = await LNDUtil.connectionStatus(lnd);
	if (status) {
		console.log('[server]: LND node connection successful');
	} else {
		logger.error('[server]: LND node connection failed');
		throw new Error('[server]: LND node connection failed');
	}

	return lnd;
}

export default initLND;
