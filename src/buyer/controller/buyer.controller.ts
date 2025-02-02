import { Body, Controller, HttpStatus, Post, UnprocessableEntityException } from "@nestjs/common";
import { BuyerService } from "../service/buyer.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";

@Controller("buyer")
export class BuyerController {
  constructor(private userService: BuyerService) {}

  @Post("register")
  async registerUser(
    @Body() request: RegisterUserDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.createUser(request);
      if (user) {
        return new ResponseWrapper(HttpStatus.OK, "Register Successful");
      }
    } catch (error) {
      // Mengembalikan error dalam format ResponseWrapper
      console.log(error);
      if (error instanceof UnprocessableEntityException) {
        return new ResponseWrapper(
          HttpStatus.UNPROCESSABLE_ENTITY,
          error.message
        );
      }
      // Tangani jenis error lain jika diperlukan
      return new ResponseWrapper(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Registration failed"
      );
    }
  }
}
