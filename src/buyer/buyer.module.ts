import { Module } from "@nestjs/common";
import { BuyerController } from "./controller/buyer.controller";
import { BuyerService } from "./service/buyer.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Buyer } from "./entity/buyer.entity";
import { OtpBuyer } from "src/auth/entity/otp.buyer.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { JwtForgotModule } from "src/auth/jwt/module/jwt-forgot.module";
import { JwtLoginStrategy } from "src/auth/jwt/strategies/jwt.strategy";
import { JwtForgotStrategy } from "src/auth/jwt/strategies/jwt-forgot.strategy";
import { OtpBuyerService } from "src/auth/service/otp.buyer.service";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Buyer,
      OtpBuyer,
    ]),
    MailerModule,
    JwtLoginModule,
    JwtForgotModule,
  ],
  controllers: [BuyerController],
  providers: [BuyerService, JwtLoginStrategy, JwtForgotStrategy, OtpBuyerService],
})
export class BuyerModule {}
