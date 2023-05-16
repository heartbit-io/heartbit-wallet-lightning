import { DataTypes, Model } from 'sequelize';
import dbconnection from '../util/dbconnection';
import { TxRequestStatus } from '../enums/TxRequestStatus';

export interface TxRequestAttributes {
	id?: number;
	user_id: number;
	amount: number;
	secret: string;
	status?: string;
}

export class TxRequestInstance extends Model<TxRequestAttributes> {
	declare id: number;
	declare user_id: number;
	declare amount: number;
	declare secret: string;
	declare status: string;

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	static associate(models: any) {}
}

TxRequestInstance.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
		},
		amount: {
			type: DataTypes.DOUBLE,
		},
		secret: {
			type: DataTypes.STRING,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: TxRequestStatus.CREATED,
		},
	},
	{
		sequelize: dbconnection,
		tableName: 'txRequests',
		timestamps: true,
		paranoid: true,
	},
);
