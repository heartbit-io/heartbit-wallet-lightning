import {
	TransactionAttributes,
	TransactionInstance,
} from '../models/TransactionModel';

class TransactionService {
	async createTransaction(transaction: TransactionAttributes) {
		return await TransactionInstance.create(transaction);
	}
}

export default new TransactionService();
