import { DataTypes, Model } from 'sequelize';

import { TxTypes } from '../../enums/TxTypes';
import initDB from '../initDB';

export interface BtcTransactionFields {
	id?: number;
	fromUserPubkey: string;
	toUserPubkey: string;
	amount: number;
	type: TxTypes;
	fee: number;
}
export class BtcTransaction extends Model<BtcTransactionFields> {
	declare id: number;
	declare fromUserPubkey: string;
	declare toUserPubkey: string;
	declare amount: number;
	declare type: TxTypes;
	declare fee: number;

	static associate(models: any) {
		// define association here
	}
}

BtcTransaction.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		fromUserPubkey: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'users',
				key: 'pubkey',
			},
		},
		toUserPubkey: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'users',
				key: 'pubkey',
			},
		},
		amount: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		type: {
			type: DataTypes.ENUM(...Object.values(TxTypes)),
			allowNull: false,
			defaultValue: TxTypes.DEPOSIT,
		},
		fee: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		sequelize: initDB,
		tableName: 'transactions',
		timestamps: true,
		paranoid: true,
	},
);
