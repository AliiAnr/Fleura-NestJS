import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
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
  @Roles("seller", "admin")
  async createProduct(
    @Req() req: any,
    @Body() request: CreateProductDto,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const product = await this.productService.createProduct(id, request);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Product created successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin", "buyer")
  async getProducts(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const products = await this.productService.getAllProducts();
      return new ResponseWrapper(HttpStatus.OK, "Success", products);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("store/:storeId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin", "buyer")
  async getProductsByStore(
    @Req() req: any,
    @Param("storeId") storeId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const products = await this.productService.getProductsByStoreId(storeId);
      return new ResponseWrapper(HttpStatus.OK, "Success", products);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("detail/:productId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin", "buyer")
  async getProductDetail(
    @Req() req: any,
    @Param("productId") productId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const product =
        await this.productService.getProductByProductId(productId);
      return new ResponseWrapper(HttpStatus.OK, "Success", product);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async updateProduct(
    @Req() req: any,
    @Body() request: UpdateProductDto,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const product = await this.productService.updateProduct(
        id,
        req.body.productId,
        request
      );
      return new ResponseWrapper(HttpStatus.OK, "Product updated successfully");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Delete("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller","admin")
  async deletePicture(
    @Body() request: DeletePictureDto,
    @Query("sellerId") sellerId: string
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
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Post("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: memoryStorage(), // Menggunakan memoryStorage untuk menyimpan file sementara di memori
    })
  )
  async uploadPicture(
    @Req() req: any,
    @UploadedFiles() files: Multer.File[],
    @Body() request: { productId: string },
    @Query("sellerId") sellerId: string
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
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const uploadPicture = await this.productService.uploadManyPicture(
        id,
        request.productId,
        files
      );
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Product picture upload successful"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("category")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async updateProductCategory(
    @Req() req: any,
    @Body() request: UpdateProductCategoryDto,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const product = await this.productService.updateProductCategory(
        id,
        request.product_id,
        request.category_id
      );
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Product category updated successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Delete("category")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async deleteProductCategory(
    @Req() req: any,
    @Body() request: { product_id: string },
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const product = await this.productService.deleteProductCategory(
        id,
        request.product_id
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product category deleted successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
