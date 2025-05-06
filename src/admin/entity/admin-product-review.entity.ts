import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";

import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

import { Product } from "src/product/entity/product.entity";
import { AdminReviewStatus } from "./admin.entity";


@Entity("admin_product_review")
export class AdminProductReview {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  description: string;

  @Column({ type: "enum", enum: AdminReviewStatus, default: AdminReviewStatus.NEED_REVIEW})
  status: AdminReviewStatus;

  @ManyToOne(() => Product, (product) => product.admin_review, {
    onDelete: "CASCADE",
  })
  product: Product;
}
