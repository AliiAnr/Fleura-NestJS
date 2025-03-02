import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";

import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { BuyerAddress } from "src/buyer/entity/buyer.address.entity";
import { OrderItem } from "./order-item.entity";
import { Payment } from "./payment.entity";

// import { Address } from './address.entity';
export enum TakenMethod {
  PICKUP = "pickup",
  DELIVERY = "delivery",
}
export enum OrderStatus {
  CREATED = "created",
  PROCESS = "process",
  PICKUP = "pickup",
  DELIVERY = "delivery",
  COMPLETED = "completed",
}

@Entity("order")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  note: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ default: 0 })
  total: number;

  @Column({ nullable: true })
  taken_date: Date;

  @Column({ type: "enum", enum: TakenMethod, default: TakenMethod.PICKUP })
  taken_method: TakenMethod;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.CREATED })
  status: string;

  @ManyToOne(() => Store, (store) => store.order)
  store: Store;

  @ManyToOne(() => Buyer, (buyer) => buyer.order)
  buyer: Buyer;

  @OneToOne(() => BuyerAddress, (address) => address.order, {
    cascade: true,
  })
  address: BuyerAddress;

  @Column({ nullable: true })
  addressId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, {
    onDelete: "CASCADE",
  })
  payment: Payment;
}
