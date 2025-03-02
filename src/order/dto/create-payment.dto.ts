import { IsString, IsOptional, IsNotEmpty, IsUUID, IsEnum } from "class-validator";
import { PaymentMethod } from "../entity/payment.entity";

// export enum TakenMethod {
//   PICKUP = "pickup",
//   DELIVERY = "delivery",
// }
export class CreatePaymentDto {

  // @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'payment_method harus berupa "QRIS" atau "CASH"',
  })
  methode: PaymentMethod;

  @IsUUID()
  orderId: string;
}
