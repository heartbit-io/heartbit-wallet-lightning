import env from '../config/env';
import { authenticatedLndGrpc, AuthenticatedLnd } from 'lightning';

async function initNode(): Promise<AuthenticatedLnd> {
	const connection = async (): Promise<AuthenticatedLnd> => {
		const { lnd } = authenticatedLndGrpc({
			cert: env.LND_TLS,
			macaroon: env.LND_MACAROON,
			socket: env.LND_GRPC_URL,
		});
		return lnd;
	};
	return connection();
}

export { initNode };
