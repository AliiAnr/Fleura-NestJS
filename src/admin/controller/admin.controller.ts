import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "../service/admin.service";
import { RegisterAdminDto } from "../dto/register-admin.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { AdminSellerReviewDto } from "../dto/seller-review.dto";
import { AdminProductReviewDto } from "../dto/product-review.dto";
import { AdminStoreReviewDto } from "../dto/store-review.dto";

@Controller("admin")
export class AdminController {
  constructor(private userService: AdminService) {}

  //   @Post("register")
  //   @UseGuards(JwtLoginAuthGuard, RoleGuard)
  //   @Roles("super")
  //   async registerUser(
  //     @Req() req: any,
  //     @Body() request: RegisterAdminDto
  //   ): Promise<ResponseWrapper<any>> {
  //     try {
  //         console.log(req.user)
  //     //   const user = await this.userService.createUser(request);
  //     //   if (user) {
  //     //     return new ResponseWrapper(HttpStatus.CREATED, "Register Successful");
  //     //   }
  //     } catch (error) {
  //       // Mengembalikan error dalam format ResponseWrapper
  //       console.log(error);
  //       if (error instanceof UnprocessableEntityException) {
  //         return new ResponseWrapper(
  //           HttpStatus.UNPROCESSABLE_ENTITY,
  //           error.message
  //         );
  //       }
  //       // Tangani jenis error lain jika diperlukan
  //       return new ResponseWrapper(
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //         "Registration failed"
  //       );
  //     }
  //   }
  @Post("review/seller")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async reviewSeller(
    @Req() req: any,
    @Body() request: AdminSellerReviewDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const review = await this.userService.reviewSeller(request);
      if (review) {
        return new ResponseWrapper(
          HttpStatus.CREATED,
          "Seller review successful"
        );
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Post("review/product")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async reviewProduct(
    @Req() req: any,
    @Body() request: AdminProductReviewDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const review = await this.userService.reviewProduct(request);
      if (review) {
        return new ResponseWrapper(
          HttpStatus.CREATED,
          "Product review successful"
        );
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Post("review/store")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async reviewStore(
    @Req() req: any,
    @Body() request: AdminStoreReviewDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const review = await this.userService.reviewStore(request);
      if (review) {
        return new ResponseWrapper(
          HttpStatus.CREATED,
          "Store review successful"
        );
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
