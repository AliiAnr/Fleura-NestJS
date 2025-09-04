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
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "../service/cart.service";
import { CreateCartDto } from "../dto/create-cart.dto";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { wrapAndThrowHttpException } from "src/common/filters/wrap-throw-exception";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("save")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async saveCartToRedis(
    @Req() req: any,
    @Body() cartData: CreateCartDto,
    @Query("buyerId") buyerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && buyerId ? buyerId : req.user.id;
      await this.cartService.saveCartToRedis(id, cartData);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Product added Succesfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }
  @Put("add/:productId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async increaseProduct(
    @Req() req: any,
    @Param("productId") productId: string,
    @Query("buyerId") buyerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && buyerId ? buyerId : req.user.id;
      await this.cartService.increaseQuantity(id, productId);
      return new ResponseWrapper(HttpStatus.OK, "Product Increase Succesfully");
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }
  @Put("reduce/:productId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async decreaseProduct(
    @Req() req: any,
    @Param("productId") productId: string,
    @Query("buyerId") buyerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && buyerId ? buyerId : req.user.id;
      await this.cartService.decreaseQuantity(id, productId);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Product quantity decrease Succesfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }

  @Get("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async getCart(
    @Req() req: any,
    @Query("buyerId") buyerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && buyerId ? buyerId : req.user.id;
      const cart = await this.cartService.getCart(id);
      //   console.log(cart[0]);
      return new ResponseWrapper(
        HttpStatus.OK,
        "Cart fetched Succesfully",
        cart
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
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
      wrapAndThrowHttpException(error);
    }
  }
  @Delete("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async deleteCart(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      await this.cartService.clearCart(req.user.id);
      return new ResponseWrapper(HttpStatus.OK, "Cart deleted Succesfully");
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }
}
