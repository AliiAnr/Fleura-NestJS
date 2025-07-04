import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";

import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { BuyerAddress } from "src/buyer/entity/buyer.address.entity";
import { OrderItem } from "./order-item.entity";
import { Order } from "./order.entity";

// import { Address } from './address.entity';
export enum PaymentMethod {
  QRIS = "qris",
  CASH = "cash",
  POINT = "point",
}

export enum PaymentStatus {
  EXPIRE = "expire",
  UNPAID = "unpaid",
  PAID = "paid",
}

@Entity("payment")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.UNPAID })
  status: PaymentStatus;

  @Column({ type: "enum", enum: PaymentMethod })
  methode: PaymentMethod;

  @Column({ nullable: true })
  success_at: Date;

  @OneToOne(() => Order, (order) => order.payment, {
    cascade: true,
  })
  @JoinColumn({ name: "orderId" })  // <<<<<< TAMBAHKAN INI!
  order: Order;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  qris_url: string;

  @Column({ nullable: true })
  qris_expired_at: Date;
}
