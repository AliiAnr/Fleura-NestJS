import { Module } from "@nestjs/common";
import { AdminController } from "./controller/admin.controller";
import { AdminService } from "./service/admin.service";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { BuyerService } from "src/buyer/service/buyer.service";
import { JwtLoginStrategy } from "src/auth/jwt/strategies/jwt.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { Admin } from "./entity/admin.entity";
import { AdminSeeder } from "./seed/admin.seed";
import { AdminProductReview } from "./entity/admin-product-review.entity";
import { AdminSellerReview } from "./entity/admin-seller-review.entity";
import { AdminStoreReview } from "./entity/admin-store-review.entity";
import { Product } from "src/product/entity/product.entity";
import { Store } from "src/store/entity/store.entity";
import { Seller } from "src/seller/entity/seller.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Admin,
      AdminProductReview,
      AdminSellerReview,
      AdminStoreReview,
      Product,
      Store,
      Seller,
    ]),
    JwtLoginModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtLoginStrategy, AdminSeeder],
})
export class AdminModule {}
