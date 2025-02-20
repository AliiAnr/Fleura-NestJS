import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";

import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { ProductPicture } from "./product-picture.entity";
import { ProductCategory } from "./product-category.entity";
import { Product } from "./product.entity";
import { Buyer } from "src/buyer/entity/buyer.entity";

// import { Address } from './address.entity';

@Entity("product_review")
export class ProductReview {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  rate: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  message: string;

  @OneToOne(() => Buyer, (buyer) => buyer.review, {
    onDelete: "CASCADE", // Jika user dihapus, OTP juga akan dihapus
  })
  buyer: Buyer;

  @Column("uuid") // Foreign key untuk user disimpan sebagai UUID
  buyerId: string;

  @ManyToOne(() => Product, (product) => product.review, {
    onDelete: "CASCADE",
  })
  product: Product;
}
