import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from "@nestjs/common";
import { BuyerService } from "../service/buyer.service";
import { RegisterBuyerDto } from "../dto/register-buyer.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { JwtForgotAuthGuard } from "src/auth/jwt/guards/jwt-forgot.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { UpdateBuyerAddressDto } from "../dto/update.buyer-address.dto";
import { CreateBuyerAddressDto } from "../dto/create.buyer-address.dto";

@Controller("buyer")
export class BuyerController {
  constructor(private userService: BuyerService) {}

  @Post("register")
  async registerUser(
    @Body() request: RegisterBuyerDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.createUser(request);
      if (user) {
        return new ResponseWrapper(HttpStatus.CREATED, "Register Successful");
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("detail/:userId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin","seller")
  async getUserById(
    @Req() req: any,
    @Param("userId") userId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.getUserById(userId);
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", user);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("profile")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer")
  async getUserProfile(
    @Req() req: any
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.getUserById(req.user.id);
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", user);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  

  @Get("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("admin")
  async getUsers(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const users = await this.userService.getAllUsers();
      return new ResponseWrapper(HttpStatus.OK, "User retrieved", users);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async getBuyerAddress(
    @Req() req: any,
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const addresses = await this.userService.getAddress(id);
      return new ResponseWrapper(HttpStatus.OK, "Address retrieved", addresses);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("address/detail/:addressId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async getBuyerAddres(
    @Req() req: any,
    @Param("addressId") addressId: string,
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const addresses = await this.userService.getAddressByAddressId(
        id,
        addressId
      );
      return new ResponseWrapper(HttpStatus.OK, "Address retrieved", addresses);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("username")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async updateUsername(
    @Req() req: any,
    @Body() body: { username: string },
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      await this.userService.updateUserName(id, body.username);
      return new ResponseWrapper(HttpStatus.OK, "Username change Successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("email")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async updateEmail(
    @Req() req: any,
    @Body() body: { email: string },
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const access_token = await this.userService.updateEmail(id, body.email);
      if (req.user.role === "admin") {
        return new ResponseWrapper(HttpStatus.OK, "Email change Successful");
      }
      return new ResponseWrapper(HttpStatus.OK, "Email change Successful", {
        access_token,
      });
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("phone")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async updatePhone(
    @Req() req: any,
    @Body() body: { phone: string },
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      await this.userService.updatePhone(id, body.phone);
      return new ResponseWrapper(HttpStatus.OK, "Phone change Successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Post("password/reset")
  @UseGuards(JwtForgotAuthGuard, RoleGuard)
  @Roles("buyer")
  async resetPassword(
    @Req() req: any,
    @Body() body: { newPassword: string }
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.userService.resetPassword(req.user.id, body.newPassword);
      return new ResponseWrapper(HttpStatus.OK, "Password Change Successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async updateBuyerAddress(
    @Req() req: any,
    @Body() request: UpdateBuyerAddressDto,
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    // console.log(request.addressId);
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const updatedAddress = await this.userService.updateBuyerAddress(
        id,
        request
      );
      return new ResponseWrapper(HttpStatus.OK, "Address update successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Post("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async addBuyerAddress(
    @Req() req: any,
    @Body() request: CreateBuyerAddressDto,
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      const updatedAddress = await this.userService.addAddress(id, request);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Address created successfully"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Delete("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer", "admin")
  async deleteAddress(
    @Req() req: any,
    @Query("addressId") addressId: string,
    @Query("userId") userId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && userId ? userId : req.user.id;
      await this.userService.deleteAddress(id, addressId);
      return new ResponseWrapper(HttpStatus.OK, "Address deleted successfully");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
