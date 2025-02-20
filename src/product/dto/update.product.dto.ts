import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
} from "class-validator";

export class UpdateProductDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  stock: number;

  @IsOptional()
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
  @IsNumber()
  point?: number;


}
