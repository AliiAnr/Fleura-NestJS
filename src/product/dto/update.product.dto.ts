import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class UpdateProductDto {
  @Transform(({ value, obj }) => value ?? obj.product_id)
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  pre_order?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  arrange_time?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  point?: number;


}
