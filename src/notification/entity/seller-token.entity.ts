import { Buyer } from "src/buyer/entity/buyer.entity";
import { Seller } from "src/seller/entity/seller.entity";
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// import { Address } from './address.entity';

@Entity("seller_token")
export class SellerToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => Seller, (seller) => seller.token)
  seller: Seller;
}
