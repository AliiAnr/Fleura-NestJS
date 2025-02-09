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

import { Store } from "./store.entity";

@Entity("store_address")
export class StoreAddress {
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

  @OneToOne(() => Store, (store) => store.address, {
    onDelete: 'CASCADE', // Jika user dihapus, OTP juga akan dihapus
  })
  store: Store;

  @Column('uuid') // Foreign key untuk user disimpan sebagai UUID
  storeId: string;
}
