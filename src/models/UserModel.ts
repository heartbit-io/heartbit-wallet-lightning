import { DataTypes, Model } from 'sequelize';

import { UserRoles } from '../enums/UserRoles';
import dbconnection from '../util/dbconnection';

export interface UserAttributes {
	id?: number;
	pubkey: string;
	email: string;
	role: UserRoles;
	btcBalance: number;
}

export class UserInstance extends Model<UserAttributes> {
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

UserInstance.init(
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
		sequelize: dbconnection,
		tableName: 'users',
		timestamps: true,
		paranoid: true,
	},
);
