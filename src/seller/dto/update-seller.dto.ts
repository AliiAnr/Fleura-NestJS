import { IsString, IsOptional } from 'class-validator';

export class UpdateSellerDto {
  @IsOptional()
  @IsString()
  name?: string;
}
