import {
	AuthenticatedLnd,
	getWalletInfo,
	CreateInvoiceResult,
	createInvoice,
	GetWalletInfoResult,
	addPeer,
	OpenChannelResult,
	openChannel,
	CloseChannelResult,
	closeChannel,
	PayResult,
	pay,
	DecodePaymentRequestResult,
	GetChainAddressesResult,
	decodePaymentRequest,
	getChainAddresses,
	getChainBalance,
	subscribeToInvoices,
	subscribeToPayments,
	createHodlInvoice,
	CreateHodlInvoiceResult,
	settleHodlInvoice,
} from 'lightning';
import { EventEmitter } from 'stream';
import logger from './logger';
import crypto from 'crypto';

class LNDUtil {
	static connectionStatus = async (lnd: AuthenticatedLnd): Promise<boolean> => {
		const walletInfo = await getWalletInfo({ lnd });
		if (walletInfo.public_key) {
			return true;
		}
		return false;
	};

	static getLNDWalletInfo = async (
		lnd: AuthenticatedLnd,
	): Promise<GetWalletInfoResult> => {
		const wallet: GetWalletInfoResult = await getWalletInfo({ lnd });
		// wallet of lnd
		return wallet;
	};

	static connectToPeer = async (
		lnd: AuthenticatedLnd,
		socket: string,
		publicKey: string,
	): Promise<void> => {
		const peer: void = await addPeer({
			lnd,
			socket,
			public_key: publicKey,
		});
	};

	static createChannel = async (
		lnd: AuthenticatedLnd,
		publicKey: string,
		channelSize: number,
	): Promise<OpenChannelResult> => {
		// channelSize must be >= 1000000;
		const channel: OpenChannelResult = await openChannel({
			lnd,
			local_tokens: channelSize,
			partner_public_key: publicKey,
		});

		return channel;
	};

	static closeChannel = async (
		lnd: AuthenticatedLnd,
		channel: OpenChannelResult,
	): Promise<CloseChannelResult> => {
		const closedChannel: CloseChannelResult = await closeChannel({
			lnd,
			...channel,
		});

		return closedChannel;
	};

	static requestPayment = async (
		lnd: AuthenticatedLnd,
		amount: number,
		description?: string,
	): Promise<CreateInvoiceResult> => {
		/*
	        there's no "address" in lightning network
	        only way to transfer is by creating invoice,
	        which expires in 72 hours
	    */
		const invoice: CreateInvoiceResult = await createInvoice({
			lnd,
			tokens: amount,
			description: description,
		});
		// invoice to show client
		return invoice;
	};

	// Hodl invoice in lightning can be settled manually
	static requestHoldingPayment = async (
		lnd: AuthenticatedLnd,
		amount: number,
		description?: string,
	): Promise<{ invoice: CreateHodlInvoiceResult; secret: string }> => {
		// need to provide this secret to settle later
		const secret = crypto.randomBytes(32).toString('hex');
		const invoice: CreateHodlInvoiceResult = await createHodlInvoice({
			id: crypto.createHash('sha256').update(secret).digest('hex'),
			lnd,
			tokens: amount,
			description: description,
		});
		// invoice to show client
		return { invoice, secret };
	};

	static settleHoldingPayment = async (
		lnd: AuthenticatedLnd,
		secret: string,
	): Promise<boolean> => {
		try {
			await settleHodlInvoice({ lnd, secret });
			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	};

	static makePayment = async (
		lnd: AuthenticatedLnd,
		invoiceRequest: string,
	): Promise<PayResult> => {
		const paymentReceipt: PayResult = await pay({
			lnd,
			request: invoiceRequest,
		});

		return paymentReceipt;
	};

	static getBtcAddressList = async (
		lnd: AuthenticatedLnd,
	): Promise<GetChainAddressesResult> => {
		const btcAddressList: GetChainAddressesResult = await getChainAddresses({
			lnd,
		});

		return btcAddressList;
	};

	static decodeInvoice = async (
		lnd: AuthenticatedLnd,
		request: string,
	): Promise<DecodePaymentRequestResult> => {
		return await decodePaymentRequest({
			lnd,
			request,
		});
	};

	static getBtcBalance = async (lnd: AuthenticatedLnd): Promise<number> => {
		const { chain_balance } = await getChainBalance({ lnd });
		return chain_balance;
	};

	static withdrawalEventOn = async (
		lnd: AuthenticatedLnd,
		onConfirm: Function,
		onFail: Function,
		onPaying?: Function,
	): Promise<void> => {
		const eventSubscriber: EventEmitter = subscribeToPayments({
			lnd,
		});
		eventSubscriber.on('confirmed', event => onConfirm(event));
		eventSubscriber.on('failed', event => {
			logger.error(event);
			console.log(event);
			onFail(event);
		});
		onPaying === undefined
			? ''
			: eventSubscriber.on('paying', event => onPaying(event));
	};

	static depositEventOn = async (
		lnd: AuthenticatedLnd,
		onReceive: Function,
	): Promise<void> => {
		const eventSubscriber: EventEmitter = subscribeToInvoices({
			lnd,
		});
		eventSubscriber.on('invoice_updated', event => onReceive(event));
	};
}

export default LNDUtil;
