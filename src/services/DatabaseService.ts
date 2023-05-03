import { UserInstance } from '../models/UserModel';

class DatabaseService {
	async getUserBtcBalance(userEmail: string) {
		return await UserInstance.findOne({ where: { email: userEmail } });
	}
}

export default new DatabaseService();
