import { Dialect, Sequelize } from 'sequelize';
import env from '../config/env';

const db = env.NODE_ENV === 'test' ? env.TEST_DB_NAME : env.DB_NAME;

const dbconnection = new Sequelize(db, env.DB_USER, env.DB_PASSWORD, {
	host: env.DB_HOST,
	dialect: env.DB_DRIVER as Dialect,
	logging: false,
});

export default dbconnection;
