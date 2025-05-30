import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FCMService } from "../service/fcm.service";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";

@Controller("notification")
export class NotificationController {
  constructor(private readonly fcmService: FCMService) {}

  @Post("buyer/save-token")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async saveBuyerToken(
    @Req() req: any,
    @Body("token") token: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const buyerId = req.user.id;
      await this.fcmService.saveBuyerToken(buyerId, token);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Token saved successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Post("seller/save-token")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async saveSellerToken(
    @Req() req: any,
    @Body("token") token: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const sellerId = req.user.id;
      await this.fcmService.saveSellerToken(sellerId, token);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Token saved successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
