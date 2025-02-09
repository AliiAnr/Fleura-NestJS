import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsNumber()
    stock: number;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsBoolean()
    pre_order?: boolean;


    @IsString()
    description?: string;


    @IsString()
    arrange_time?: string;


    @IsNumber()
    point?: number;

    @IsUUID()
    storeId: string;
}