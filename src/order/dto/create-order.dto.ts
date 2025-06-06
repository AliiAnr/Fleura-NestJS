import { IsString, IsOptional, IsNotEmpty, IsUUID, IsEnum, IsDate } from "class-validator";
import { TakenMethod } from "../entity/order.entity";
import { PaymentMethod } from "../entity/payment.entity";

// export enum TakenMethod {
//   PICKUP = "pickup",
//   DELIVERY = "delivery",
// }
export class CreateOrderDto {
  @IsNotEmpty()
  items: { productId: string; quantity: number }[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  taken_date?: string;

  @IsOptional()
  @IsEnum(TakenMethod, {
    message: 'taken_method harus berupa "pickup" atau "delivery"',
  })
  taken_method?: TakenMethod;

  @IsUUID()
  @IsOptional()
  addressId: string;

  @IsEnum(PaymentMethod,{
    message: 'payment_method harus berupa "QRIS", "CASH" atau "POINT"',
  })
  payment_method: PaymentMethod;
}
