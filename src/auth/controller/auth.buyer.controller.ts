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

@Controller("buyer/auth")
export class AuthBuyerController {
  jwtService: any;
  constructor(
    @Inject("AUTH_BUYER_SERVICE")
    private readonly authService: AuthBuyerService,
    private otpService: OtpBuyerService
  ) {}

  @Post("login")
  @UseGuards(LocalGuard)
  async login(@Req() req: any): Promise<ResponseWrapper<any>> {
    // console.log(req.originalUrl)
    // console.log(req.user)
    // console.log(req.baseUrl)
    // console.log(req.url)
    const access_token = await this.authService.login(req.user);
    return new ResponseWrapper(HttpStatus.OK, "Login Successful", {
      access_token
    });
  }

  // @Get("tesRole")
  // @UseGuards(JwtLoginAuthGuard,RoleGuard)
  // @Roles('buyer')
  // async tesRole(@Req() req: any): Promise<ResponseWrapper<any>> {
  //   // console.log(req.originalUrl)
  //   // console.log(req.user)
  //   // console.log(req.baseUrl)
  //   // console.log(req.url)

  //   return new ResponseWrapper(HttpStatus.OK, "Login Successful", {
  //     role: req.user.role
  //   });
  // }

  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: "Google Authentication" };
  }

  @Post("otp/forgot")
  async verifyOtpForgot(
    @Body() body: { otpCode: string; email: string }
  ): Promise<ResponseWrapper<any>> {
    const access_token = await this.otpService.verifyOtpForgot(
      body.otpCode,
      body.email
    );
    return new ResponseWrapper(
      HttpStatus.OK,
      "OTP has been generated successfully.",
      {
        access_token,
      }
    );
  }

  @Get("google/redirect")
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req): Promise<ResponseWrapper<any>> {
    // After successful authentication, Google redirects to this route
    const access_token = req.user;
    return new ResponseWrapper(HttpStatus.OK, "Login Successful", {
      access_token,
    });
  }

  @Post("otp/verify")
  async verifyOtp(
    @Body() body: { otpCode: string; email: string }
  ): Promise<ResponseWrapper<any>> {
    const isValid = await this.otpService.validateOtpVerification(
      body.otpCode,
      body.email
    );
    if (isValid) {
      return new ResponseWrapper(
        HttpStatus.OK,
        "OTP verified successfully. User is now verified."
      );
    }
  }
  @Post("otp/generate")
  async regenerateOtp(@Body() body: { email: string }) {
    const otp = await this.otpService.generateOtp(body.email);
    if (otp) {
      return new ResponseWrapper(
        HttpStatus.OK,
        "OTP has been generated successfully."
      );
    }
  }
}
