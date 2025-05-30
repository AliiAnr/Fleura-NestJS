import { IsString, IsOptional, IsNotEmpty, IsUUID, IsNumber } from "class-validator";

export class UpdateBuyerAddressDto {
  // @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  addressId: string;

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
}
