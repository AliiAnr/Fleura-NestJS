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
import { OrderStatus } from "../entity/order.entity";

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

  @Get("detail/:id")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "seller")
  async getOrderById(
    @Req() req: any,
    @Param("id") orderId: string
  ): Promise<ResponseWrapper<any>> {
    // console.log(req.user);
    try {
      const order = await this.orderService.getOrder(orderId);
      return new ResponseWrapper(HttpStatus.OK, "Order retrieved", order);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("buyer")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async getOrders(@Req() req: any): Promise<ResponseWrapper<any>> {
    // console.log(req.user);
    try {
      const orders = await this.orderService.getOrdersByBuyerId(req.user.id);
      return new ResponseWrapper(HttpStatus.OK, "Orders retrieved", orders);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("store/:id")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async getOrderByStore(
    @Req() req: any,
    @Param(":id") storeId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const order = await this.orderService.getOrdersByStore(storeId);
      return new ResponseWrapper(HttpStatus.OK, "Order retrieved", order);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("status/:id")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async updateOrderStatus(
    @Req() req: any,
    @Param("id") orderId: string,
    @Body("status") status: OrderStatus
  ): Promise<ResponseWrapper<any>> {
    try {
      const order = await this.orderService.updateOrderStatus(orderId, status);
      return new ResponseWrapper(HttpStatus.OK, "Order status updated", order);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
