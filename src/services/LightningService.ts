import * as dotenv from 'dotenv';
import { once } from 'events';
import * as lightning from 'lightning';
import { EventEmitter } from 'stream';

dotenv.config();

const LND_TLS = process.env.LND_TLS as string;
const LND_MACAROON = process.env.LND_MACAROON as string;
const LND_SOCKET = process.env.LND_SOCKET as string;

class LightningService {
	static getLNDAdmin = async (): Promise<lightning.AuthenticatedLnd> => {
		const { lnd } = lightning.authenticatedLndGrpc({
			cert: LND_TLS,
			macaroon: LND_MACAROON,
			socket: LND_SOCKET,
		});
		// lnd is necessry arg for most of methods
		return lnd as lightning.AuthenticatedLnd;
	};

	static getLNDWalletInfo = async (
		lnd: lightning.AuthenticatedLnd,
	): Promise<lightning.GetWalletInfoResult> => {
		const wallet: lightning.GetWalletInfoResult = await lightning.getWalletInfo(
			{ lnd },
		);
		// wallet of lnd
		return wallet;
	};

	static connectToPeer = async (
		lnd: lightning.AuthenticatedLnd,
		socket: string,
		publicKey: string,
	): Promise<void> => {
		const peer: void = await lightning.addPeer({
			lnd,
			socket,
			public_key: publicKey,
		});
	};

	static createChannel = async (
		lnd: lightning.AuthenticatedLnd,
		publicKey: string,
		channelSize: number,
	): Promise<lightning.OpenChannelResult> => {
		// channelSize must be >= 1000000;
		const channel: lightning.OpenChannelResult = await lightning.openChannel({
			lnd,
			local_tokens: channelSize,
			partner_public_key: publicKey,
		});

		return channel;
	};

	static closeChannel = async (
		lnd: lightning.AuthenticatedLnd,
		channel: lightning.OpenChannelResult,
	): Promise<lightning.CloseChannelResult> => {
		const closedChannel: lightning.CloseChannelResult =
			await lightning.closeChannel({
				lnd,
				...channel,
			});

		return closedChannel;
	};

	static requestPayment = async (
		lnd: lightning.AuthenticatedLnd,
		amount: number,
		description?: string,
	): Promise<lightning.CreateInvoiceResult> => {
		/*
            there's no "address" in lightning network
            only way to transfer is by creating invoice,
            which expires in 72 hours
        */
		const invoice: lightning.CreateInvoiceResult =
			await lightning.createInvoice({
				lnd,
				tokens: amount,
				description: description,
			});
		// invoice to show client
		return invoice;
	};

	static makePayment = async (
		lnd: lightning.AuthenticatedLnd,
		invoiceRequest: string,
	): Promise<lightning.PayResult> => {
		const paymentReceipt: lightning.PayResult = await lightning.pay({
			lnd,
			request: invoiceRequest,
		});

		return paymentReceipt;
	};

	static getBtcAddressList = async (
		lnd: lightning.AuthenticatedLnd,
	): Promise<lightning.GetChainAddressesResult> => {
		const btcAddressList: lightning.GetChainAddressesResult =
			await lightning.getChainAddresses({ lnd });

		return btcAddressList;
	};

	static getBtcBalance = async (
		lnd: lightning.AuthenticatedLnd,
	): Promise<number> => {
		const { chain_balance } = await lightning.getChainBalance({ lnd });
		return chain_balance;
	};

	static withdrawalEventOn = async (
		lnd: lightning.AuthenticatedLnd,
		onConfirm: Function,
		onFail: Function,
		onPaying?: Function,
	): Promise<void> => {
		const eventSubscriber: EventEmitter = lightning.subscribeToPayments({
			lnd,
		});
		eventSubscriber.on('confirmed', event => onConfirm(event));
		eventSubscriber.on('failed', event => onFail(event));
		onPaying === undefined
			? ''
			: eventSubscriber.on('paying', event => onPaying(event));
	};

	static depositEventOn = async (
		lnd: lightning.AuthenticatedLnd,
		onReceive: Function,
	): Promise<void> => {
		const eventSubscriber: EventEmitter = lightning.subscribeToInvoices({
			lnd,
		});
		eventSubscriber.on('invoice_updated', event => onReceive(event));
	};
}

export default LightningService;
