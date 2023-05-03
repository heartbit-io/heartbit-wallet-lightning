import createLnRpc from '@radar/lnrpc';
import env from '../config/env';

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';

const initNode = async () => {
	const lnRpcClient = await createLnRpc({
		server: env.LND_GRPC_URL,

		/*
		 * By default  lnrpc looks for your tls certificate at:
		 * `~/.lnd/tls.cert`, unless it detects you're using macOS and
		 * defaults to `~/Library/Application\ Support/Lnd/tls.cert`
		 * however you can configure your own SSL certificate path like:
		 */

		tls: '',

		/*
		 * You can also provide a TLS certificate directly as a string
		 * (Just make sure you don't commit this to git).
		 * Overwrites: `tls`
		 */

		// tls: Buffer.from(env.LND_TLS_CERT, 'base64').toString('ascii'),
		/*
		 * Optional path to configure macaroon authentication
		 * from LND generated macaroon file.
		 */

		// macaroonPath: './admin.macaroon',
		/*
		 * Optional way to configure macaroon authentication by
		 * passing a hex encoded string of your macaroon file.
		 * Encoding: `xxd -ps -u -c 1000 ./path/to/data/admin.macaroon`
		 * Details: https://github.com/lightningnetwork/lnd/blob/dc3db4b/docs/macaroons.md#using-macaroons-with-grpc-clients
		 */
		macaroon: Buffer.from(env.LND_MACAROON, 'base64').toString('hex'),
	});

	try {
		const getInfoResponse = await lnRpcClient.getInfo();
		console.log(getInfoResponse);
	} catch (error) {
		console.error(error);
		throw new Error('Failed to connect to LND node');
	}
};

export default initNode;
