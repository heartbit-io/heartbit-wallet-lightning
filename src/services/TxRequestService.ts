import { TxRequestStatus } from '../enums/TxRequestStatus';
import {
	TxRequestAttributes,
	TxRequestInstance,
} from '../models/TxRequestModel';

class TxRequestService {
	async createTxRequest(txRequest: TxRequestAttributes) {
		return await TxRequestInstance.create(txRequest);
	}

	async getTxRequestBySecret(secret: string) {
		return await TxRequestInstance.findOne({
			where: { secret, status: TxRequestStatus.CREATED },
		});
	}

	async updateRequestStatus(secret: string) {
		const txRequest = await TxRequestInstance.findOne({
			where: { secret },
		});
		if (txRequest) {
			txRequest.set('status', TxRequestStatus.USED);
			await txRequest.save();
		}
	}
}

export default new TxRequestService();
