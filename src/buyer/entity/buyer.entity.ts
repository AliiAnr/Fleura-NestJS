import {
  Column,
  Entity,
  OneToMany,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
// import { Address } from './address.entity';
import { OtpBuyer } from "src/auth/entity/otp.buyer.entity";

@Entity("buyer")
export class Buyer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => OtpBuyer, (otp) => otp.buyer, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true, // OTP bisa null
  })
  otp: OtpBuyer;

  @Column({ default: 0 })
  point: number;

  // @Column({ type: 'timestamp', nullable: true })
  // verified_at: Date;
}
