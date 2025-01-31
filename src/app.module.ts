import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BuyerModule } from './buyer/buyer.module';
import { SellerModule } from './seller/seller.module';
import { OtpBuyer } from "./auth/entity/otp.buyer.entity";
import { OtpSeller } from "./auth/entity/otp.seller.entity";
import { Buyer } from "./buyer/entity/buyer.entity";
import { Seller } from "./seller/entity/seller.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: "postgres",
          host: configService.get<string>("DATABASE_HOST"),
          port: configService.get<number>("DATABASE_PORT"),
          username: configService.get<string>("DATABASE_USERNAME"),
          password: configService.get<string>("DATABASE_PASSWORD"),
          database: configService.get<string>("DATABASE_NAME"),
          entities: [OtpBuyer,OtpSeller,Buyer,Seller],
          synchronize: true, // Sesuaikan dengan kebutuhan Anda
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    BuyerModule,
    SellerModule,
  ],
})
export class AppModule {}
