import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller("category")
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async createCategory(
    @Body() request: CreateCategoryDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const category = await this.categoryService.createCategory(request);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Category created successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Delete()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async deleteCategory(
    @Body() request: { category_id: string }
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.categoryService.deleteCategory(request.category_id);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Category deleted successfully"
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
  @Roles("buyer", "seller", "admin")
  async getAllCategory(): Promise<ResponseWrapper<any>> {
    try {
      const categories = await this.categoryService.getAllCategory();
      return new ResponseWrapper(
        HttpStatus.OK,
        "Get all category successfully",
        categories
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
