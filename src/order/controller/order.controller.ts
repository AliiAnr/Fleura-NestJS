import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { OrderService } from "../service/order.service";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { CreateOrderDto } from "../dto/create-order.dto";
import { MidtransService } from "../service/mitrans.service";

@Controller("order")
export class OrderController {
  constructor(
    private orderService: OrderService,
    private midtransService: MidtransService
  ) {}

  @Post()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async createOrder(
    @Req() req: any,
    @Body() request: CreateOrderDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const order = await this.orderService.createOrder(req.user.id, request);
      return new ResponseWrapper(HttpStatus.CREATED, "Order created");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Post("qris/:orderId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async createQrisTransaction(
    @Param("orderId") orderId: string
  ): Promise<ResponseWrapper<any>> {
    // console.log("Order ID: ", orderId);
    try {
      const transaction =
        await this.midtransService.createQrisTransaction(orderId);
      // console.log("Transaction: ", transaction);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "QRIS transaction created successfully",
        transaction
      );

      // console.log("Transaction: ", transaction);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(HttpStatus.INTERNAL_SERVER_ERROR, error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
