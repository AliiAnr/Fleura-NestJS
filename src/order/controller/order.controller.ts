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
import { PaymentService } from "../service/payment.service";


@Controller("order")
export class OrderController {
  constructor(
    private orderService: OrderService,
    private midtransService: PaymentService
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

  
}
