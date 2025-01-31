import { Module } from "@nestjs/common";
import { BuyerController } from "./controller/buyer.controller";
import { BuyerService } from "./service/buyer.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Buyer } from "./entity/buyer.entity";
import { OtpBuyer } from "src/auth/entity/otp.buyer.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Buyer,
      OtpBuyer,
    ]),
    // MailerModule,
  ],
  controllers: [BuyerController],
  providers: [BuyerService],
})
export class BuyerModule {}
