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
import { Product } from "./product.entity";

// import { Address } from './address.entity';

@Entity("product_picture")
export class ProductPicture {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  path: string;

  @ManyToOne(() => Product, (product) => product.picture,{
    onDelete: 'CASCADE',
  })
  product: Product;
}
