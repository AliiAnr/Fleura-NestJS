import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { request } from "http";

import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { CreateProductDto } from "../dto/create.product.dto";
import { ProductService } from "../service/product.service";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { UpdateProductDto } from "../dto/update.product.dto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { Multer, memoryStorage } from "multer";
import { DeletePictureDto } from "../dto/delete.picture.dto";
import { CategoryService } from "../service/category.service";
import { CreateCategoryDto } from "../dto/create.category.dto";
import { CreateReviewDto } from "../dto/create.review.dto";
import { ReviewService } from "../service/review.service";

@Controller("product/review")
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async createReview(
    @Req() req: any,
    @Body() request: CreateReviewDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const review = await this.reviewService.createReview(
        req.user.id,
        request
      );
      return new ResponseWrapper(HttpStatus.CREATED, "Review created successfully");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  // @Delete()
  // async deleteCategory(
  //   @Body() request: { category_id: string }
  // ): Promise<ResponseWrapper<any>> {
  //   try {
  //     await this.categoryService.deleteCategory(request.category_id);
  //     return new ResponseWrapper(
  //       HttpStatus.OK,
  //       "Category deleted successfully"
  //     );
  //   } catch (error) {
  //     return new ResponseWrapper(
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       "Failed to delete category"
  //     );
  //   }
  // }
}
