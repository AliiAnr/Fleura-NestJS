import { Module } from "@nestjs/common";
import { SellerController } from "./controller/seller.controller";
import { SellerService } from "./service/seller.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "./entity/seller.entity";
import { OtpSeller } from "src/auth/entity/otp.seller.entity";
import { JwtLoginStrategy } from "src/auth/jwt/strategies/jwt.strategy";
import { JwtForgotStrategy } from "src/auth/jwt/strategies/jwt-forgot.strategy";
import { OtpSellerService } from "src/auth/service/otp.seller.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { JwtForgotModule } from "src/auth/jwt/module/jwt-forgot.module";
import { SellerAddress } from "./entity/seller.address.entity";
import { Store } from "src/store/entity/store.entity";
import { SupabaseService } from "src/supabase/supabase.service";
import { AdminSellerReview } from "src/admin/entity/admin-seller-review.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Seller, OtpSeller,SellerAddress,Store, AdminSellerReview]),
    // MailerModule,
    MailerModule,
    JwtLoginModule,
    JwtForgotModule,
  ],
  controllers: [SellerController],
  providers: [
    SellerService,
    JwtLoginStrategy,
    JwtForgotStrategy,
    OtpSellerService,
    SupabaseService
  ],
})
export class SellerModule {}
