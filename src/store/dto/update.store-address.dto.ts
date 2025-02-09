import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateStoreAddressDto {
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
    storeId?: string;
}