import {
  Column,
  Entity,
  OneToMany,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
// import { Address } from './address.entity';
import { OtpSeller } from "src/auth/entity/otp.seller.entity";
import { Seller } from "./seller.entity";

@Entity("seller_address")
export class SellerAddress {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  postcode: string;

  @Column()
  road: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column()
  detail: string;

  @Column()
  district: string;

  @OneToOne(() => Seller, (seller) => seller.address, {
    onDelete: 'CASCADE', // Jika user dihapus, OTP juga akan dihapus
  })
  seller: Seller;

  @Column('uuid') // Foreign key untuk user disimpan sebagai UUID
  sellerId: string;
}
