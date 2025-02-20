import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateReviewDto {
    @IsUUID()
    @IsString()
    productId: string;
    
    @IsString()
    message: string;
    
    @IsNumber()
    rate: number;
}