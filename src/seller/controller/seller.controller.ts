import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { JwtForgotAuthGuard } from "src/auth/jwt/guards/jwt-forgot.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { SellerService } from "../service/seller.service";
import { RegisterSellerDto } from "../dto/register.seller.dto";
import { UpdateSellerPartialDto } from "../dto/update.seller-partial.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { Multer } from "multer";
import { UpdateSellerAddressDto } from "../dto/update.seller-address.dto";

@Controller("seller")
export class SellerController {
  constructor(private userService: SellerService) {}

  @Post("register")
  async registerUser(
    @Body() request: RegisterSellerDto
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

  //   @Put("username")
  //   @UseGuards(JwtLoginAuthGuard,RoleGuard)
  //   @Roles('seller')
  //   async updateUsername(
  //     @Req() req: any,
  //     @Body() body: { username: string },
  //   ): Promise<ResponseWrapper<any>> {
  //     await this.userService.updateUserName(req.user.id, body.username);
  //     return new ResponseWrapper(HttpStatus.OK, 'Username change Successful');
  //   }

  @Put("update")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async updateSellerPartial(
    @Req() req: any,
    @Body() updateSellerPartialDto: UpdateSellerPartialDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const updatedSeller = await this.userService.updateSellerPartial(
        req.user.id,
        updateSellerPartialDto
      );
      return new ResponseWrapper(HttpStatus.OK, "Seller update successful");
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        return new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          error.message
        );
      } else if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update seller"
        );
      }
    }
  }

  @Put("email")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async updateEmail(
    @Req() req: any,
    @Body() body: { email: string }
  ): Promise<ResponseWrapper<any>> {
    const access_token = await this.userService.updateEmail(
      req.user.id,
      body.email
    );
    return new ResponseWrapper(HttpStatus.OK, "Email change Successful", {
      access_token,
    });
  }
  @Put("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  @UseInterceptors(
    FileInterceptor("file")
  )
  async uploadPicture(
    @Req() req: any,
    @UploadedFile() file: Multer.File
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const updatedSeller = await this.userService.uploadPicture(
        req.user.id,
        file
      );
      return new ResponseWrapper(HttpStatus.OK, "Picture upload successful");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload picture"
        );
      }
    }
  }
  @Put("identity")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  @UseInterceptors(
    FileInterceptor("file")
  )
  async uploadIdentity(
    @Req() req: any,
    @UploadedFile() file: Multer.File
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const updatedSeller = await this.userService.uploadIdentityPicture(
        req.user.id,
        file
      );
      return new ResponseWrapper(HttpStatus.OK, "Identity picture upload successful");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload identity picture"
        );
      }
    }
  }

  //   @Put('phone')
  //   @UseGuards(JwtLoginAuthGuard,RoleGuard)
  //   @Roles('seller')
  //   async updatePhone(
  //     @Req() req: any,
  //     @Body() body: { phone: string},
  //   ): Promise<ResponseWrapper<any>> {
  //     await this.userService.updatePhone(req.user.id, body.phone);
  //     return new ResponseWrapper(HttpStatus.OK, 'Phone change Successful');
  //   }

  @Post("password/reset")
  @UseGuards(JwtForgotAuthGuard, RoleGuard)
  @Roles("seller")
  async resetPassword(
    @Req() req: any,
    @Body() body: { newPassword: string }
  ): Promise<ResponseWrapper<any>> {
    await this.userService.resetPassword(req.user.id, body.newPassword);
    return new ResponseWrapper(HttpStatus.OK, "Password Change Successful");
  }

  @Put('address')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('seller')
  async updateSellerAddress(
    @Req() req: any,
    @Body() updateSellerAddressDto: UpdateSellerAddressDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const updatedAddress = await this.userService.updateSellerAddress(req.user.id, updateSellerAddressDto);
      return new ResponseWrapper(HttpStatus.OK, 'Address update successful', updatedAddress);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update address');
      }
    }
  }
}
