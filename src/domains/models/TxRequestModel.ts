import { DataTypes, Model } from 'sequelize';
import initDB from '../initDB';
import { TxRequestStatus } from '../../enums/TxRequestStatus';

export interface TxRequestFields {
	id?: number;
	userId: number;
	amount: number;
	secret: string;
	status?: string;
}

export class TxRequest extends Model<TxRequestFields> {
	declare id: number;
	declare userId: number;
	declare amount: number;
	declare secret: string;
	declare status: string;

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	static associate(models: any) {}
}

TxRequest.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
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
		sequelize: initDB,
		tableName: 'txRequests',
		timestamps: true,
		paranoid: true,
	},
);
