import { Module } from "@nestjs/common";
import { AuthBuyerService } from "./service/auth.buyer.service";
import { AuthBuyerController } from "./controller/auth.buyer.controller";
import { AuthSellerController } from "./controller/auth.seller.controller";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { BuyerModule } from "src/buyer/buyer.module";
import { SellerModule } from "src/seller/seller.module";
import { JwtLoginModule } from "./jwt/module/jwt.module";
import { JwtForgotModule } from "./jwt/module/jwt-forgot.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { Seller } from "src/seller/entity/seller.entity";
import { OtpBuyer } from "./entity/otp.buyer.entity";
import { OtpSeller } from "./entity/otp.seller.entity";
import { LocalStrategy } from "./jwt/strategies/local.strategy";
import { JwtLoginStrategy } from "./jwt/strategies/jwt.strategy";
import { JwtForgotStrategy } from "./jwt/strategies/jwt-forgot.strategy";
import { GoogleStrategy } from "./google/google.strategy";
import { OtpBuyerService } from "./service/otp.buyer.service";
import { AuthSellerService } from "./service/auth.seller.service";
import { OtpSellerService } from "./service/otp.seller.service";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    BuyerModule,
    SellerModule,
    JwtLoginModule,
    JwtForgotModule,
    TypeOrmModule.forFeature([Buyer, Seller, OtpBuyer, OtpSeller]),
  ],
  providers: [
    {
      provide: "AUTH_BUYER_SERVICE",
      useClass: AuthBuyerService,
    },
    {
      provide: "AUTH_SELLER_SERVICE",
      useClass: AuthSellerService,
    },
    OtpBuyerService,
    OtpSellerService,
    LocalStrategy,
    JwtLoginStrategy,
    JwtForgotStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthBuyerController, AuthSellerController],
})
export class AuthModule {}
