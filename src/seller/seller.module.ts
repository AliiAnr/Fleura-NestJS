import { Module } from '@nestjs/common';
import { SellerController } from './controller/seller.controller';
import { SellerService } from './service/seller.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entity/seller.entity';
import { OtpSeller } from 'src/auth/entity/otp.seller.entity';

@Module({
  imports: [
      ConfigModule,
      TypeOrmModule.forFeature([
        Seller,
        OtpSeller,
      ]),
      // MailerModule,
    ],
  controllers: [SellerController],
  providers: [SellerService]
})
export class SellerModule {}
