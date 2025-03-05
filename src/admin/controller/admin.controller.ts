import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "../service/admin.service";
import { RegisterAdminDto } from "../dto/register-admin.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";

@Controller("admin")
export class AdminController {
  constructor(private userService: AdminService) {}

//   @Post("register")
//   @UseGuards(JwtLoginAuthGuard, RoleGuard)
//   @Roles("super")
//   async registerUser(
//     @Req() req: any,
//     @Body() request: RegisterAdminDto
//   ): Promise<ResponseWrapper<any>> {
//     try {
//         console.log(req.user)
//     //   const user = await this.userService.createUser(request);
//     //   if (user) {
//     //     return new ResponseWrapper(HttpStatus.CREATED, "Register Successful");
//     //   }
//     } catch (error) {
//       // Mengembalikan error dalam format ResponseWrapper
//       console.log(error);
//       if (error instanceof UnprocessableEntityException) {
//         return new ResponseWrapper(
//           HttpStatus.UNPROCESSABLE_ENTITY,
//           error.message
//         );
//       }
//       // Tangani jenis error lain jika diperlukan
//       return new ResponseWrapper(
//         HttpStatus.INTERNAL_SERVER_ERROR,
//         "Registration failed"
//       );
//     }
//   }
}
