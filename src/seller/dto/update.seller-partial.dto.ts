import { IsString, IsOptional } from 'class-validator';

export class UpdateSellerPartialDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  identity_number?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  account?: string;

}
