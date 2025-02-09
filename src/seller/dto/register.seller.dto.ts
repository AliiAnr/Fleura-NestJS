import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterSellerDto {
  // @IsString()
  // @IsNotEmpty()
  // name: string;

  @IsEmail()
  email: string;


  @IsString()
  @IsNotEmpty()
  password: string;
}
