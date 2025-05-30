import { Module } from "@nestjs/common";
import { NotificationController } from "./controller/notification.controller";
import { FCMService } from "./service/fcm.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { BuyerToken } from "./entity/buyer-token.entity";
import { Seller } from "src/seller/entity/seller.entity";
import { SellerToken } from "./entity/seller-token.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Buyer, BuyerToken, Seller, SellerToken])],
  providers: [FCMService],
  controllers: [NotificationController],
  exports: [FCMService],
})
export class NotificationModule {}
