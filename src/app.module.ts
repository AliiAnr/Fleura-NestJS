import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BuyerModule } from "./buyer/buyer.module";
import { SellerModule } from "./seller/seller.module";
import { OtpBuyer } from "./auth/entity/otp.buyer.entity";
import { OtpSeller } from "./auth/entity/otp.seller.entity";
import { Buyer } from "./buyer/entity/buyer.entity";
import { Seller } from "./seller/entity/seller.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import * as path from "path";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";
import { ProductModule } from "./product/product.module";
import { StoreModule } from "./store/store.module";
import { SellerAddress } from "./seller/entity/seller.address.entity";
import { Store } from "./store/entity/store.entity";
import { StoreAddress } from "./store/entity/seller.address.entity";
import { Product } from "./product/entity/product.entity";
import { ProductPicture } from "./product/entity/product-picture.entity";
import { ProductCategory } from "./product/entity/product-category.entity";
import { BuyerAddress } from "./buyer/entity/buyer.address.entity";
import { ProductReview } from "./product/entity/product-review.entity";
import { OrderModule } from './order/order.module';
import { Order } from "./order/entity/order.entity";
import { OrderItem } from "./order/entity/order-item.entity";
import { Payment } from "./order/entity/payment.entity";
import { AdminModule } from './admin/admin.module';
import { Admin } from "./admin/entity/admin.entity";
import { RedisModule } from './redis/redis.module';
import { CartModule } from './cart/cart.module';
import { SupabaseModule } from './supabase/supabase.module';

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
          entities: [
            Admin,
            OtpBuyer,
            OtpSeller,
            Buyer,
            Seller,
            SellerAddress,
            Store,
            StoreAddress,
            Product,
            ProductPicture,
            ProductCategory,
            BuyerAddress,
            ProductReview,
            Order,
            OrderItem,
            Payment,
          ],
          synchronize: true, // Sesuaikan dengan kebutuhan Anda
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.get<string>("SMTP_SERVICE"),
          host: configService.get<string>("SMTP_HOST"),
          port: configService.get<number>("SMTP_PORT"),
          secure: configService.get<boolean>("SMTP_SECURE"),
          auth: {
            user: configService.get<string>("SMTP_USER"),
            pass: configService.get<string>("SMTP_PASS"),
          },
          debug: true,
        },
        defaults: {
          from: configService.get<string>("DEFAULT_FROM"),
        },
        template: {
          dir: path.join(__dirname, "../src/auth/template"),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BuyerModule,
    SellerModule,
    ProductModule,
    StoreModule,
    OrderModule,
    AdminModule,
    RedisModule,
    CartModule,
    SupabaseModule,
  ],
})
export class AppModule {}