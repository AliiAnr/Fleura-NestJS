
import { Buyer } from 'src/buyer/entity/buyer.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';


@Entity('otp_buyer')
export class OtpBuyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  otp: string; // Store hashed OTP

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @OneToOne(() => Buyer, (buyer) => buyer.otp, {
    onDelete: 'CASCADE', // Jika user dihapus, OTP juga akan dihapus
  })
  buyer: Buyer;

  @Column('uuid') // Foreign key untuk user disimpan sebagai UUID
  buyerId: string;
}
