import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterAdminDto {
  // @IsString()
  // @IsNotEmpty()
  // name: string;

  @IsNotEmpty()
  name: string;

  // @IsString()
  // // @IsOptional()
  // // @IsNotEmpty()
  // phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
