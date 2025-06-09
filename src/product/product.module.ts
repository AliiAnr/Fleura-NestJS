import { Module } from "@nestjs/common";
import { ProductService } from "./service/product.service";
import { ProductController } from "./controller/product.controller";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";
import { Product } from "./entity/product.entity";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { ProductPicture } from "./entity/product-picture.entity";
import { ProductCategory } from "./entity/product-category.entity";
import { CategoryController } from "./controller/category.controller";
import { CategoryService } from "./service/category.service";
import { ProductReview } from "./entity/product-review.entity";
import { ReviewService } from "./service/review.service";
import { ReviewController } from "./controller/review.controller";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { OrderItem } from "src/order/entity/order-item.entity";
import { SupabaseService } from "src/supabase/supabase.service";
import { AdminProductReview } from "src/admin/entity/admin-product-review.entity";
import { SellerToken } from "src/notification/entity/seller-token.entity";
import { FCMService } from "src/notification/service/fcm.service";
import { BuyerToken } from "src/notification/entity/buyer-token.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Seller,
      Store,
      Product,
      SellerToken,
      BuyerToken,
      ProductPicture,
      ProductCategory,
      ProductReview,
      Buyer,
      OrderItem,
      AdminProductReview,
    ]),
    // MailerModule,
    JwtLoginModule,
  ],
  providers: [ProductService, CategoryService, ReviewService, SupabaseService,FCMService],
  controllers: [ProductController, CategoryController, ReviewController],
})
export class ProductModule {}
