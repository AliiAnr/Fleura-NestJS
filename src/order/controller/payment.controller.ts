import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { PaymentStatus } from "../entity/payment.entity";
import { wrapAndThrowHttpException } from "src/common/filters/wrap-throw-exception";

@Controller("payment")
export class PaymentController {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}


  @Get("detail/:orderId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer","admin")
  async getPaymentDetail(
    @Req() req: any,
    @Param("orderId") orderId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const payment = await this.paymentService.getPaymentByOrderId(orderId);
      return new ResponseWrapper(HttpStatus.OK, "Payment detail retrieved", payment);
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }


  @Post("point/:orderId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer","admin")
  async createPointTransaction(
    @Req() req: any,
    @Param("orderId") orderId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const transaction =
        await this.paymentService.createPointTransaction(orderId);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Point transaction created successfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }

  @Post("cash/:orderId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer","admin")
  async createCashTransaction(
    @Req() req: any,
    @Param("orderId") orderId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const transaction =
        await this.paymentService.createCashTransaction(orderId);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Cash transaction created successfully"
      );
    } catch (error) {
      wrapAndThrowHttpException(error);
    }
  }

  @Post("qris/:orderId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer","admin")
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
      wrapAndThrowHttpException(error);
    }
  }
  @Post("notification")
  async handleNotification(@Body() body: any) {
    return this.paymentService.processNotification(body);
  }

  @Put("status/:id")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller","admin")
  async updateOrderStatus(
    @Req() req: any,
    @Param("id") orderId: string,
    @Body("status") status: PaymentStatus
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.paymentService.updatePaymentStatus(orderId, status);
      return new ResponseWrapper(HttpStatus.OK, "Payment status updated");
    } catch (error) {
     wrapAndThrowHttpException(error);
    }
  }
}
