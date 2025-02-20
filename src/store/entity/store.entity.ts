import { Seller } from "src/seller/entity/seller.entity";
import {
  Column,
  Entity,
  OneToMany,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StoreAddress } from "./seller.address.entity";
import { Product } from "src/product/entity/product.entity";
import { Order } from "src/order/entity/order.entity";
// import { Address } from './address.entity';

@Entity("store")
export class Store {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @Column({ nullable: true })
  operational_hour: string;

  @Column({ nullable: true })
  operational_day: string;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => Seller, (seller) => seller.store, {
    onDelete: "CASCADE", // Jika user dihapus, OTP juga akan dihapus
  })
  seller: Seller;

  @Column("uuid") // Foreign key untuk user disimpan sebagai UUID
  sellerId: string;

  @OneToOne(() => StoreAddress, (address) => address.store, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  address: Store;

  @OneToMany(() => Product, (product) => product.store, {
    cascade: true,
    onDelete: "CASCADE",
  })
  products: Product[];

  @OneToMany(()=> Order, (order) => order.store, {
    cascade: true,
    onDelete: "CASCADE",
  })
  order: Order[];
}
