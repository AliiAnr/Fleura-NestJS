import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  pre_order?: boolean;

  @IsString()
  description?: string;

  @IsString()
  arrange_time?: string;

  @Type(() => Number)
  @IsNumber()
  point: number;

  // @IsUUID()
  // storeId: string;
}
