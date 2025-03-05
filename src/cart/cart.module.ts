import { Module } from "@nestjs/common";
import { CartService } from "./service/cart.service";
import { CartController } from "./controller/cart.controller";
import { JwtLoginStrategy } from "src/auth/jwt/strategies/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "src/product/entity/product.entity";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { Store } from "src/store/entity/store.entity";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { RedisService } from "src/redis/redis.service";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Product, Buyer, Store]), JwtLoginModule],
  providers: [JwtLoginStrategy, CartService, RedisService],
  controllers: [CartController],
})
export class CartModule {}
