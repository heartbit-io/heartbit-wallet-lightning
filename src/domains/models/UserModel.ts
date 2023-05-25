import { DataTypes, Model } from 'sequelize';

import { UserRoles } from '../../enums/UserRoles';
import initDB from '../initDB';

export interface UserFields {
	id?: number;
	pubkey: string;
	email: string;
	role: UserRoles;
	btcBalance: number;
}

export class User extends Model<UserFields> {
	declare id: number;
	declare pubkey: string;
	declare email: string;
	declare role: UserRoles;
	declare btcBalance: number;

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	static associate(models: any) {}

	isDoctor() {
		return this.role === UserRoles.DOCTOR;
	}
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		pubkey: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		role: {
			type: DataTypes.ENUM(...Object.values(UserRoles)),
			allowNull: false,
		},
		btcBalance: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
	},
	{
		sequelize: initDB,
		tableName: 'users',
		timestamps: true,
		paranoid: true,
		underscored: true,
	},
);
