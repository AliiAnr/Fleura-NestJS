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
import { ProductPicture } from "./product-picture.entity";
import { ProductCategory } from "./product-category.entity";
import { ProductReview } from "./product-review.entity";
import { OrderItem } from "src/order/entity/order-item.entity";
import { AdminProductReview } from "src/admin/entity/admin-product-review.entity";

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

  @Column({default: false })
  pre_order: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  arrange_time: string;

  @Column({ nullable: true })
  point: number;

  @ManyToOne(() => Store, (store) => store.products)
  store: Store;

  @OneToMany(() => ProductPicture, (picture) => picture.product, {
    cascade: true,
  })
  picture: ProductPicture[];

  @OneToMany(() => ProductReview, (review) => review.product, {
    cascade: true,
  })
  review: ProductReview[];

  
  @ManyToOne(() => ProductCategory, (category) => category.product)
  category: ProductCategory;
  
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
  
  @Column({ type: "timestamp", nullable: true })
  admin_verified_at: Date;
  
  @OneToMany(() => AdminProductReview, (admin_review) => admin_review.product, {
    cascade: true,
  })
  admin_review: ProductReview[];
}
