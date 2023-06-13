import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
} from 'typeorm';
import { TxTypes } from '../../enums/TxTypes';
import { User } from './User';

@Entity('btc_transactions')
export class BtcTransaction {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	amount: number;

	@Column({
		type: 'enum',
		enum: TxTypes,
	})
	type: TxTypes;

	@Column()
	fee: number;

	@Column()
	fromUserPubkey: string;

	@Column()
	toUserPubkey: string;

	@ManyToOne(() => User, {
		createForeignKeyConstraints: false,
	})
	@JoinColumn({
		name: 'from_user_pubkey',
		referencedColumnName: 'pubkey',
	})
	FromUser: User;

	@ManyToOne(() => User, {
		createForeignKeyConstraints: false,
	})
	@JoinColumn({
		name: 'to_user_pubkey',
		referencedColumnName: 'pubkey',
	})
	ToUser: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	//soft delete
	@DeleteDateColumn()
	deletedAt: Date | null;
}

export interface BtcTransactionFields {
	id?: number;
	amount: number;
	type: TxTypes;
	fee: number;
	fromUserPubkey: string;
	toUserPubkey: string;
}
