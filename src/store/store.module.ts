import { Module } from "@nestjs/common";
import { StoreController } from "./controller/store.controller";
import { StoreService } from "./service/store.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { SellerAddress } from "src/seller/entity/seller.address.entity";
import { Store } from "./entity/store.entity";
import { JwtLoginStrategy } from "src/auth/jwt/strategies/jwt.strategy";
import { SellerService } from "src/seller/service/seller.service";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { StoreAddress } from "./entity/seller.address.entity";
import { Product } from "src/product/entity/product.entity";
import { Order } from "src/order/entity/order.entity";
import { SupabaseService } from "src/supabase/supabase.service";
import { AdminStoreReview } from "src/admin/entity/admin-store-review.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Seller, Store, StoreAddress, Product, Order, AdminStoreReview]),
    // MailerModule,
    JwtLoginModule,
  ],
  controllers: [StoreController],
  providers: [JwtLoginStrategy, StoreService,SupabaseService],
})
export class StoreModule {}
