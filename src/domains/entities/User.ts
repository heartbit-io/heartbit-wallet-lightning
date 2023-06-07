import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserRoles } from '../../enums/UserRoles';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	pubkey: string;

	@Column({ unique: true })
	email: string;

	@Column({
		type: 'enum',
		enum: UserRoles,
		default: UserRoles.USER,
	})
	role: UserRoles;

	@Column()
	btcBalance: number;
}

export interface UserFields {
	id?: number;
	pubkey: string;
	email: string;
	role: UserRoles;
	btcBalance: number;
}
