import { DataSource } from 'typeorm';
import env from '../../config/env';
import { User } from '.././entities/User';
import { BtcTransaction } from '.././entities/BtcTransaction';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TxRequest } from '.././entities/TxRequest';

const dataSource = new DataSource({
	type: env.DB_DRIVER as 'postgres',
	host: env.DB_HOST,
	username: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.NODE_ENV === 'production' ? env.DB_NAME : env.TEST_DB_NAME,
	logging: true,
	synchronize: env.NODE_ENV === 'production' ? false : true,
	entities: [User, BtcTransaction, TxRequest],
	namingStrategy: new SnakeNamingStrategy(),
});

export const userRepository = dataSource.getRepository(User);
export const btcTransactionRepository =
	dataSource.getRepository(BtcTransaction);
export const txRequestRepository = dataSource.getRepository(TxRequest);

export default dataSource;
