const lnurl = require('lnurl');

import logger from '../utils/logger';

async function onLUDFail(lud: any): Promise<boolean> {
	lud.on('withdrawRequest:action:failed', (event: any) => {
		logger.error(event);
		console.log(event);
	});

	return true;
}
/*
lnurlServer.on(
	'withdrawRequest:action:processed',
	async (event: { secret: any; params: any; result: any }) => {
		logger.info(event);
		console.log(event);
		const { params, result } = event;

		const { id, amount, fee, tag } = result;

		const { email } = params;

		const feePercent = 0.01;

		const userBalance = await UserBalanceService.getUserBtcBalance(email);

		let userBtcBalance = 0;
		if (userBalance) {
			userBtcBalance = userBalance.get('btcBalance') as number;
		}

		const localTxFee = feePercent * Number(amount);
		const totalFee = Number(fee) + localTxFee;

		const totalAmount = Number(amount) + totalFee;

		const newBalance = userBtcBalance - totalAmount;

		await UserBalanceService.updateUserBtcBalance(email, newBalance);

		//save transaction
		await TransactionService.createTransaction({
			id,
			amount: totalAmount,
			fromUserPubkey: tag,
			toUserPubkey: email,
			fee: totalFee,
			type: TxTypes.WITHDRAW,
		});

		//send email to user
	},
);
*/

export { onLUDFail };
