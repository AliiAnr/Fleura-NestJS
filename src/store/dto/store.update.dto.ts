import { IsString, IsOptional, IsNotEmpty, IsUUID } from "class-validator";

export class UpdateStoreDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  balance?: number;

  @IsOptional()
  @IsString()
  phone?: string;

//   @IsOptional()
//   updated_at?: Date;

  @IsOptional()
  @IsString()
  operational_hour?: string;

  @IsOptional()
  @IsString()
  operational_day?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;
}
