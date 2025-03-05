import { IsString, IsNumber, IsDate, IsUUID } from "class-validator";

export class CreateCartDto {
//   @IsUUID()
//   buyerId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;
}
