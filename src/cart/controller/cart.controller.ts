import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "../service/cart.service";
import { CreateCartDto } from "../dto/create-cart.dto";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("save")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async saveCartToRedis(
    @Req() req: any,
    @Body() cartData: CreateCartDto
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.cartService.saveCartToRedis(req.user.id, cartData);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Product added Succesfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Put("add/:productId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async increaseProduct(
    @Req() req: any,
    @Param("productId") productId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.cartService.increaseQuantity(req.user.id, productId);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product Increase Succesfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Put("reduce/:productId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async decreaseProduct(
    @Req() req: any,
    @Param("productId") productId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.cartService.decreaseQuantity(req.user.id, productId);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product decrease Succesfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }





  @Get("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async getCart(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const cart = await this.cartService.getCart(req.user.id);
      //   console.log(cart[0]);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Cart fetched Succesfully",
        cart
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Delete("delete/:productId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async deleteProductFromCart(
    @Req() req: any,
    @Param("productId") productId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.cartService.removeFromCart(req.user.id, productId);
      return new ResponseWrapper(HttpStatus.OK, "Product deleted Succesfully");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Delete("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async deleteCart(
    @Req() req: any
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.cartService.clearCart(req.user.id);
      return new ResponseWrapper(HttpStatus.OK, "Cart deleted Succesfully");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
