import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;
}