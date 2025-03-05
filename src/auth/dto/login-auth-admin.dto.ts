import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthAdminDto {
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
