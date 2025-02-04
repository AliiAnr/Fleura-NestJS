import { Body, Controller, HttpStatus, Post, Put, Req, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { BuyerService } from "../service/buyer.service";
import { RegisterBuyerDto } from "../dto/register-buyer.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { JwtForgotAuthGuard } from "src/auth/jwt/guards/jwt-forgot.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";

@Controller("buyer")
export class BuyerController {
  constructor(private userService: BuyerService) {}

  @Post("register")
  async registerUser(
    @Body() request: RegisterBuyerDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.createUser(request);
      if (user) {
        return new ResponseWrapper(HttpStatus.OK, "Register Successful");
      }
    } catch (error) {
      // Mengembalikan error dalam format ResponseWrapper
      console.log(error);
      if (error instanceof UnprocessableEntityException) {
        return new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          error.message
        );
      }
      // Tangani jenis error lain jika diperlukan
      return new ResponseWrapper(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Registration failed"
      );
    }
  }

  @Put("username")
  @UseGuards(JwtLoginAuthGuard,RoleGuard)
  @Roles('buyer')
  async updateUsername(
    @Req() req: any,
    @Body() body: { username: string },
  ): Promise<ResponseWrapper<any>> {
    await this.userService.updateUserName(req.user.id, body.username);
    return new ResponseWrapper(HttpStatus.OK, 'Username change Successful');
  }

  @Put('email')
  @UseGuards(JwtLoginAuthGuard,RoleGuard)
  @Roles('buyer')
  async updateEmail(
    @Req() req: any,
    @Body() body: { email: string },
  ): Promise<ResponseWrapper<any>> {
    await this.userService.updateEmail(req.user.id, body.email);
    return new ResponseWrapper(HttpStatus.OK, 'Email change Successful');
  }

  @Put('phone')
  @UseGuards(JwtLoginAuthGuard,RoleGuard)
  @Roles('buyer')
  async updatePhone(
    @Req() req: any,
    @Body() body: { phone: string},
  ): Promise<ResponseWrapper<any>> {
    await this.userService.updatePhone(req.user.id, body.phone);
    return new ResponseWrapper(HttpStatus.OK, 'Phone change Successful');
  }



  @Post('password/reset')
  @UseGuards(JwtForgotAuthGuard,RoleGuard)
  @Roles('buyer')
  async resetPassword(
    @Req() req: any,
    @Body() body: { newPassword: string },
  ): Promise<ResponseWrapper<any>> {
    await this.userService.resetPassword(req.user.id, body.newPassword);
    return new ResponseWrapper(HttpStatus.OK, 'Password Change Successful');
  }
}
