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

// import { Address } from './address.entity';

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true, default: false })
  pre_order: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  arrange_time: string;

  @Column({ nullable: true })
  point: number;

  @ManyToOne(() => Store, (store) => store.products)
  store: Store;
}
