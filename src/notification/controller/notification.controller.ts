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
import { wrapAndThrowHttpException } from "src/common/filters/wrap-throw-exception";

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
      wrapAndThrowHttpException(error);
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
     wrapAndThrowHttpException(error);
    }
  }

  @Post("buyer/send")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async sendNotif(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      await this.fcmService.sendNotificationByBuyerId(
        "TES NOTIF",
        "HOHOH",
        req.user.id
      );
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Notification sended successfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }

  @Post("buyer/test-send")
  async sendNotifTest(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {


      await this.fcmService.sendNotifTest();
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Notification sended successfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }
}
