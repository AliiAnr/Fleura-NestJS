import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { LocalGuard } from "../jwt/guards/local.guard";
import { GoogleAuthGuard } from "../google/google.guard";

// import { Request } from "express";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { OtpBuyerService } from "../service/otp.buyer.service";
import { AuthBuyerService } from "../service/auth.buyer.service";
import { RoleGuard } from "../jwt/guards/roles.guard";
import { Roles } from "../jwt/decorators/roles.decorator";
import { JwtForgotAuthGuard } from "../jwt/guards/jwt-forgot.guard";
import { JwtLoginAuthGuard } from "../jwt/guards/jwt.guard";
import { AuthAdminService } from "../service/auth.admin.service";

@Controller("admin/auth")
export class AuthAdminController {
  jwtService: any;
  constructor(
    @Inject("AUTH_ADMIN_SERVICE")
    private readonly authService: AuthAdminService,
  ) {}

  @Post("login")
  @UseGuards(LocalGuard)
  async login(@Req() req: any): Promise<ResponseWrapper<any>> {
    // console.log(req.originalUrl)
    // console.log(req.user)
    // console.log(req.baseUrl)
    // console.log(req.url)
    console.log(req.user)
    const access_token = await this.authService.login(req.user);
    return new ResponseWrapper(HttpStatus.OK, "Login Successful", {
      access_token
    });
  }

  @Get("tesRole")
  @UseGuards(JwtLoginAuthGuard,RoleGuard)
  @Roles('admin')
  async tesRole(@Req() req: any): Promise<ResponseWrapper<any>> {
    // console.log(req.originalUrl)
    // console.log(req.user)
    // console.log(req.baseUrl)
    // console.log(req.url)

    return new ResponseWrapper(HttpStatus.OK, "Login Successful", {
      role: req.user.role
    });
  }
}
