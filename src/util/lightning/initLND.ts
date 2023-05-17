import env from '../../config/env';
import { authenticatedLndGrpc, AuthenticatedLnd } from 'lightning';

async function initLND(): Promise<AuthenticatedLnd> {
	const connection = async (): Promise<AuthenticatedLnd> => {
		const { lnd } = authenticatedLndGrpc({
			cert: '',
			macaroon: env.LND_MACAROON,
			socket: env.LND_GRPC_URL,
		});
		return lnd;
	};
	return connection();
}

export default initLND;
