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

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Admin]), JwtLoginModule],
  controllers: [AdminController],
  providers: [AdminService, JwtLoginStrategy, AdminSeeder],
})
export class AdminModule {}
