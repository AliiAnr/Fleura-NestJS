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


@Controller("payment")
export class PaymentController {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  @Post("qris/:orderId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async createQrisTransaction(
    @Param("orderId") orderId: string
  ): Promise<ResponseWrapper<any>> {
    // console.log("Order ID: ", orderId);
    try {
      const transaction =
        await this.paymentService.createQrisTransaction(orderId);
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
