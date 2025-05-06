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


@Entity("admin_seller_review")
export class AdminSellerReview {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  description: string;

  @Column({ type: "enum", enum: AdminReviewStatus, default: AdminReviewStatus.NEED_REVIEW})
  status: AdminReviewStatus;

  @ManyToOne(() => Seller, (seller) => seller.admin_review, {
    onDelete: "CASCADE",
  })
  seller: Seller;
}
