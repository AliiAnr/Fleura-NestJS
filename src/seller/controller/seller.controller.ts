import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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
        return new ResponseWrapper(HttpStatus.CREATED, "Register Successful");
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
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
  @Roles("seller", "admin")
  async updateSellerPartial(
    @Req() req: any,
    @Body() updateSellerPartialDto: UpdateSellerPartialDto,
    @Query("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      console.log(id);
      const updatedSeller = await this.userService.updateSellerPartial(
        id,
        updateSellerPartialDto
      );
      return new ResponseWrapper(HttpStatus.OK, "Seller update successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async getBuyerAddress(
    @Req() req: any,
    @Query("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const addresses = await this.userService.getAddress(id);
      return new ResponseWrapper(HttpStatus.OK, "Address retrieved", addresses);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Get("address/detail/:addressId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async getBuyerAddres(
    @Req() req: any,
    @Param("addressId") addressId: string,
    @Query("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const addresses = await this.userService.getAddressByAddressId(
        id,
        addressId
      );
      return new ResponseWrapper(HttpStatus.OK, "Address retrieved", addresses);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("email")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async updateEmail(
    @Req() req: any,
    @Body() body: { email: string },
    @Query("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const access_token = await this.userService.updateEmail(id, body.email);
      if (req.user.role === "admin") {
        return new ResponseWrapper(HttpStatus.OK, "Email change Successful");
      }
      return new ResponseWrapper(HttpStatus.OK, "Email change Successful", {
        access_token,
      });
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPicture(
    @Req() req: any,
    @UploadedFile() file: Multer.File,
    @Query("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const updatedSeller = await this.userService.uploadPicture(id, file);
      return new ResponseWrapper(HttpStatus.OK, "Picture upload successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Put("identity")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(FileInterceptor("file"))
  async uploadIdentity(
    @Req() req: any,
    @UploadedFile() file: Multer.File,
    @Query("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const updatedSeller = await this.userService.uploadIdentityPicture(
        id,
        file
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        "Identity picture upload successful"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Post("password/reset")
  @UseGuards(JwtForgotAuthGuard, RoleGuard)
  @Roles("seller")
  async resetPassword(
    @Req() req: any,
    @Body() body: { newPassword: string }
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.userService.resetPassword(req.user.id, body.newPassword);
      return new ResponseWrapper(HttpStatus.OK, "Password Change Successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async updateSellerAddress(
    @Req() req: any,
    @Body() updateSellerAddressDto: UpdateSellerAddressDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const updatedAddress = await this.userService.updateSellerAddress(
        req.user.id,
        updateSellerAddressDto
      );
      return new ResponseWrapper(HttpStatus.OK, "Address update successful");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update address"
        );
      }
    }
  }

  @Get("detail/:userId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async getUserById(
    @Req() req: any,
    @Param("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.getOneSeller(userId);
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new ResponseWrapper(HttpStatus.NOT_FOUND, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to retrieve user"
        );
      }
    }
  }

  @Get("profile")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async getUserProfile(
    @Req() req: any
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.getOneSeller(req.user.id);
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", user);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async getUsers(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const users = await this.userService.getAllSellers();
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", users);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("unverified")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin", "seller", "buyer")
  async getUnverifiedUsers(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const users = await this.userService.getUnverifiedSellers();
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", users);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Get("verified")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin", "seller", "buyer")
  async getVerifiedUsers(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const users = await this.userService.getVerifiedSellers();
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", users);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
