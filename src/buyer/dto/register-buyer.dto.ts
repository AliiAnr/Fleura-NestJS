import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterBuyerDto {
  // @IsString()
  // @IsNotEmpty()
  // name: string;

  @IsEmail()
  email: string;

  // @IsString()
  // // @IsOptional()
  // // @IsNotEmpty()
  // phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
