import { Body, Controller, HttpStatus, Post, Req, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { BuyerService } from "../service/buyer.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { JwtForgotAuthGuard } from "src/auth/jwt/guards/jwt-forgot.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";

@Controller("buyer")
export class BuyerController {
  constructor(private userService: BuyerService) {}

  @Post("register")
  async registerUser(
    @Body() request: RegisterUserDto
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
