import { IsString, IsOptional } from 'class-validator';

export class UpdateBuyerDto {
  @IsOptional()
  @IsString()
  name?: string;
}
