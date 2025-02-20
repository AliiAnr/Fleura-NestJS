import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
// import { Address } from './address.entity';
import { OtpSeller } from "src/auth/entity/otp.seller.entity";
import { Buyer } from "./buyer.entity";
import { Order } from "src/order/entity/order.entity";

@Entity("buyer_address")
export class BuyerAddress {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  postcode: string;

  @Column()
  road: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column()
  detail: string;

  @Column()
  district: string;

  // @OneToOne(() => Buyer, (buyer) => buyer.address, {
  //   onDelete: 'CASCADE', // Jika user dihapus, OTP juga akan dihapus
  // })
  // buyer: Buyer;

  // @Column('uuid') // Foreign key untuk user disimpan sebagai UUID
  // buyerId: string;

  @ManyToOne(() => Buyer, (buyer) => buyer.address, {
    onDelete: "CASCADE",
  })
  buyer: Buyer;

  @OneToOne(() => Order, (order) => order.address, {
    onDelete: "CASCADE",
  })
  order: Order;
}
