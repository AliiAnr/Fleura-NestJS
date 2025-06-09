import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { OrderItem } from "./entity/order-item.entity";
import { JwtLoginModule } from "src/auth/jwt/module/jwt.module";
import { Order } from "./entity/order.entity";
import { OrderService } from "./service/order.service";
import { OrderController } from "./controller/order.controller";
import { Product } from "src/product/entity/product.entity";
import { HttpModule } from "@nestjs/axios";
import { BuyerAddress } from "src/buyer/entity/buyer.address.entity";
import { Payment } from "./entity/payment.entity";

import { PaymentController } from "./controller/payment.controller";
import { PaymentService } from "./service/payment.service";
import { FCMService } from "src/notification/service/fcm.service";
import { BuyerToken } from "src/notification/entity/buyer-token.entity";
import { SellerToken } from "src/notification/entity/seller-token.entity";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Store,
      Buyer,
      Order,
      OrderItem,
      BuyerToken,
      SellerToken,
      Product,
      BuyerAddress,
      Payment,
      Seller,
    ]),
    // MailerModule,
    HttpModule,
    JwtLoginModule,
  ],
  providers: [OrderService, PaymentService, FCMService],
  controllers: [OrderController, PaymentController],
})
export class OrderModule {}
