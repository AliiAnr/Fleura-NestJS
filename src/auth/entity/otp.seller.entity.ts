
import { Buyer } from 'src/buyer/entity/buyer.entity';
import { Seller } from 'src/seller/entity/seller.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';


@Entity('otp_seller')
export class OtpSeller {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  otp: string; // Store hashed OTP

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @OneToOne(() => Seller, (seller) => seller.otp, {
    onDelete: 'CASCADE', // Jika user dihapus, OTP juga akan dihapus
  })
  seller: Seller;

  @Column('uuid') // Foreign key untuk user disimpan sebagai UUID
  sellerId: string;
}
