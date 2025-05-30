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
import { BuyerAddress } from "./buyer.address.entity";
import { ProductReview } from "src/product/entity/product-review.entity";
import { Order } from "src/order/entity/order.entity";
import { BuyerToken } from "src/notification/entity/buyer-token.entity";

@Entity("buyer")
export class Buyer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
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

  @Column({ type: "timestamp", nullable: true })
  verified_at: Date;

  // @OneToOne(() => BuyerAddress, (address) => address.buyer, {
  //   cascade: true,
  //   onDelete: "CASCADE",
  //   nullable: true,
  // })
  // address: BuyerAddress;

  @OneToMany(() => BuyerAddress, (address) => address.buyer, {
    cascade: true,
  })
  address: BuyerAddress[];

  @OneToOne(() => ProductReview, (review) => review.buyer, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  review: ProductReview;

  @OneToMany(() => Order, (order) => order.buyer, {
    cascade: true,
  })
  order: Order[];

  @OneToMany(() => BuyerToken, (buyerToken) => buyerToken.buyer, {
    cascade: true,
  })
  token: BuyerToken[];
}
