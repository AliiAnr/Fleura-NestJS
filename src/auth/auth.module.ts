import { Module } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
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
      provide: "AUTH_SERVICE",
      useClass: AuthService,
    },
    // OtpService,
    LocalStrategy,
    JwtLoginStrategy,
    JwtForgotStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthBuyerController, AuthSellerController],
})
export class AuthModule {}
