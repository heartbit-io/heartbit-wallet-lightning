import { UserInstance } from '../models/UserModel';
class UserBalanceService {
	async getUserBtcBalance(userEmail: string) {
		return await UserInstance.findOne({ where: { email: userEmail } });
	}

	async updateUserBtcBalance(userEmail: string, newBalance: number) {
		const user = await UserInstance.findOne({ where: { email: userEmail } });
		if (user) {
			user.set('btcBalance', newBalance);
			await user.save();
		}
	}

	async getUserDetailsById(userId: number) {
		return await UserInstance.findOne({ where: { id: userId } });
	}
}

export default new UserBalanceService();
