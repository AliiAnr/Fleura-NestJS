import { IsString, IsOptional, IsNotEmpty, IsUUID, IsNumber } from "class-validator";

export class UpdateSellerAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  longitude?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  postcode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  road?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  province?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  detail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  district?: string;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  sellerId?: string;
}
