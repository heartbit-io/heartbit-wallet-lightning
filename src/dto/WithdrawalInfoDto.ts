class WithdrawalInfoDto {
	tag: string;

	callback: string;

	k1: string;

	defaultDescription: string;

	minWithdrawable: number;

	maxWithdrawable: number;

	constructor(
		tag: string,
		callback: string,
		k1: string,
		defaultDescription: string,
		minWithdrawable: number,
		maxWithdrawable: number,
	) {
		this.tag = tag;
		this.callback = callback;
		this.k1 = k1;
		this.defaultDescription = defaultDescription;
		this.minWithdrawable = minWithdrawable;
		this.maxWithdrawable = maxWithdrawable;
	}
}

export default WithdrawalInfoDto;
