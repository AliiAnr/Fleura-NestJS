import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Admin } from 'typeorm';
import { AdminReviewStatus } from '../entity/admin.entity';

export class AdminProductReviewDto {
  
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  description?: string;


  @IsEnum(AdminReviewStatus, {
    message: 'status harus berupa "ACCEPTED" atau "NEED_REVIEW" atau "REJECTED"',
  })
  status: AdminReviewStatus;
}
