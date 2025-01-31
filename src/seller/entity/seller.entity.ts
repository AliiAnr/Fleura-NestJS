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
import { OtpSeller } from "src/auth/entity/otp.seller.entity";

@Entity("seller")
export class Seller {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  picture: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  account: string;

  @Column({ unique: true })
  identity_number: string;

  @Column()
  identity_picture: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => OtpSeller, (otp) => otp.seller, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true, // OTP bisa null
  })
  otp: OtpBuyer;

  // @Column({ type: 'timestamp', nullable: true })
  // verified_at: Date;
}
