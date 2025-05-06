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
import { SellerAddress } from "./seller.address.entity";
import { Store } from "src/store/entity/store.entity";
import { AdminSellerReview } from "src/admin/entity/admin-seller-review.entity";

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

  @OneToOne(() => SellerAddress, (address) => address.seller, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  address: SellerAddress;

  @OneToOne(() => Store, (store) => store.seller, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  store: Store;

  @Column({ type: "timestamp", nullable: true })
  admin_verified_at: Date;

  @OneToMany(() => AdminSellerReview, (admin_review) => admin_review.seller, {
    cascade: true,
  })
  admin_review: AdminSellerReview[];
}
