import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TxRequestStatus } from '../../enums/TxRequestStatus';

@Entity()
export class TxRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@Column()
	amount: number;

	@Column()
	secret: string;

	@Column({ default: TxRequestStatus.CREATED })
	status: string;
}

export interface TxRequestFields {
	id?: number;
	userId: number;
	amount: number;
	secret: string;
	status?: string;
}
