import {
  Column,
  Entity,
  OneToMany,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
// import { Address } from './address.entity';
import { OtpSeller } from "src/auth/entity/otp.seller.entity";

@Entity("seller")
export class Seller {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  account: string;

  @Column({ unique: true, nullable: true })
  identity_number: string;

  @Column({ nullable: true })
  identity_picture: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => OtpSeller, (otp) => otp.seller, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true, // OTP bisa null
  })
  otp: OtpSeller;

  @Column({ type: "timestamp", nullable: true })
  verified_at: Date;
}
