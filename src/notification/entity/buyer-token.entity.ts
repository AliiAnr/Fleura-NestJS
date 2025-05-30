import { Buyer } from "src/buyer/entity/buyer.entity";
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

// import { Address } from './address.entity';

@Entity("buyer_token")
export class BuyerToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => Buyer, (buyer) => buyer.token)
  buyer: Buyer;
}
