import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { request } from "http";

import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { CreateProductDto } from "../dto/create.product.dto";
import { ProductService } from "../service/product.service";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";

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
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product created successfully"
      );
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
}
