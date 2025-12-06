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
import { wrapAndThrowHttpException } from "src/common/filters/wrap-throw-exception";
import { CreateProductWithCategoryDto } from "../dto/create.product.with-category.dto";

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
      wrapAndThrowHttpException(error);
    }
  }

  @Post("with-category")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowed = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
        ];
        const ok = allowed.includes(file.mimetype);
        if (!ok) {
          (req as any).invalidFileType = true;
        }
        cb(null, ok);
      },
    })
  )
  async createProductWithCategory(
    @Req() req: any,
    @Body() request: CreateProductWithCategoryDto,
    @UploadedFiles() files: Multer.File[],
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    if ((req as any).invalidFileType) {
      throw new HttpException(
        new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Only image files are allowed (jpeg, jpg, png, webp, gif)"
        ),
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    if (files && files.length > 0) {
      const maxSize = 1 * 1024 * 1024;
      for (const f of files) {
        if (f.size > maxSize) {
          throw new HttpException(
            new ResponseWrapper(
              HttpStatus.UNPROCESSABLE_ENTITY,
              "File size exceeds the 1 MB limit"
            ),
            HttpStatus.UNPROCESSABLE_ENTITY
          );
        }
      }
    }

    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      await this.productService.createProductWithCategory(id, request, files);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Product created successfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
    }
  }
  @Get("verified")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin", "buyer")
  async getVerifiedProducts(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const products = await this.productService.getAllVerifiedProducts();
      return new ResponseWrapper(HttpStatus.OK, "Success", products);
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }
  @Get("unverified")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin", "buyer")
  async getUnverifiedProducts(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const products = await this.productService.getAllUnverifiedProducts();
      return new ResponseWrapper(HttpStatus.OK, "Success", products);
    } catch (error) {
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
    }
  }

  @Delete("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
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
      wrapAndThrowHttpException(error);
    }
  }

  @Post("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowed = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
        ];
        const ok = allowed.includes(file.mimetype);
        if (!ok) {
          (req as any).invalidFileType = true;
        }
        cb(null, ok);
      },
    })
  )
  async uploadPicture(
    @Req() req: any,
    @UploadedFiles() files: Multer.File[],
    @Body() request: { productId: string },
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    // If any non-image was sent, reject the whole request
    if ((req as any).invalidFileType) {
      throw new HttpException(
        new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Only image files are allowed (jpeg, jpg, png, webp, gif)"
        ),
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    if (!files || files.length === 0) {
      throw new HttpException(
        new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "No image files uploaded"
        ),
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    const maxSize = 1 * 1024 * 1024; // 500 KB
    for (const f of files) {
      if (f.size > maxSize) {
        throw new HttpException(
          new ResponseWrapper(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "File size exceeds the 1 MB limit"
          ),
          HttpStatus.UNPROCESSABLE_ENTITY
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
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
    }
  }
}
