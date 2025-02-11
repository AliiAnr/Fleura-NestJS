import {
  Body,
  Controller,
  Delete,
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
import { UpdateProductCategoryDto } from "../dto/update-product-category.dto";

@Controller("product")
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async createProduct(
    @Req() req: any,
    @Body() request: CreateProductDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const product = await this.productService.createProduct(
        req.user.id,
        request
      );
      return new ResponseWrapper(HttpStatus.OK, "Product created successfully");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to create product"
        );
      }
    }
  }

  @Put()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async updateProduct(
    @Req() req: any,
    @Body() request: UpdateProductDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const product = await this.productService.updateProduct(
        req.user.id,
        req.body.productId,
        request
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product updated successfully",
        product
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update product"
        );
      }
    }
  }

  @Delete("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async deletePicture(
    @Body() request: DeletePictureDto
  ): Promise<ResponseWrapper<any>> {

    try {
      const deletePicture = await this.productService.DeletePictureById(
        request.product_id,
        request.picture_id
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product picture delete successful"
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to delete product picture"
        );
      }
    }
  }

  @Post("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: memoryStorage(), // Menggunakan memoryStorage untuk menyimpan file sementara di memori
    })
  )
  async uploadPicture(
    @Req() req: any,
    @UploadedFiles() files: Multer.File[],
    @Body() request: { productId: string }
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    for (const f of files) {
      if (f.size > maxSize) {
        return new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "File size exceeds the 500 KB limit"
        );
      }
    }
    // console.log(files);
    // console.log(request.productId);

    if (!request.productId) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "Product ID is required"
      );
    }

    try {
      const uploadPicture = await this.productService.uploadManyPicture(
        req.user.id,
        request.productId,
        files
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        "Store picture upload successful"
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload store picture"
        );
      }
    }
  }

  @Put('category')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('seller')
  async updateProductCategory(
    @Req() req: any,
    @Body() request: UpdateProductCategoryDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const product = await this.productService.updateProductCategory(
        req.user.id,
        request.product_id,
        request.category_id
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Product category updated successfully'
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update product category'
        );
      }
    }
  }
  @Delete('category')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('seller')
  async deleteProductCategory(
    @Req() req: any,
    @Body() request: { product_id: string }
  ): Promise<ResponseWrapper<any>> {
    try {
      const product = await this.productService.deleteProductCategory(
        req.user.id,
        request.product_id
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Product category deleted successfully'
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to delete product category'
        );
      }
    }
  }
}
