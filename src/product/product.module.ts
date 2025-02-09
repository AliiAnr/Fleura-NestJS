import { Module } from "@nestjs/common";
import { ProductService } from "./service/product.service";
import { ProductController } from "./controller/product.controller";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";
import { Product } from "./entity/product.entity";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Seller, Store, Product]),
    // MailerModule,
    JwtLoginModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
