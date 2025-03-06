import { IsString, IsNumber, IsDate, IsUUID } from "class-validator";

export class CreateNotifDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  deviceId: string;
}
