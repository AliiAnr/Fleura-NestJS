import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { StoreService } from "../service/store.service";
import { JwtLoginAuthGuard } from "src/auth/jwt/guards/jwt.guard";
import { RoleGuard } from "src/auth/jwt/guards/roles.guard";
import { Roles } from "src/auth/jwt/decorators/roles.decorator";
import { UpdateStoreDto } from "../dto/store.update.dto";
import { ResponseWrapper } from "src/common/wrapper/response.wrapper";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";
import { UpdateStoreAddressDto } from "../dto/update.store-address.dto";

@Controller("store")
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Put()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async updateSellerAddress(
    @Req() req: any,
    @Body() updateStoreDto: UpdateStoreDto,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const updatedAddress = await this.storeService.updateStore(
        id,
        updateStoreDto
      );
      return new ResponseWrapper(HttpStatus.CREATED, "Store update successful");
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Put("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPicture(
    @Req() req: any,
    @UploadedFile() file: Multer.File,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const updatedSeller = await this.storeService.uploadPicture(id, file);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Store picture upload successful"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Put("logo")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  @UseInterceptors(FileInterceptor("file"))
  async uploadLogo(
    @Req() req: any,
    @UploadedFile() file: Multer.File,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const updatedSeller = await this.storeService.uploadLogo(id, file);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Store logo upload successful"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Get("detail/:storeId")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "buyer", "admin")
  async getStore(
    @Req() req: any,
    @Param("storeId") storeId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const store = await this.storeService.getStoreByStoreId(storeId);
      return new ResponseWrapper(HttpStatus.OK, "Store details", store);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }

  @Get("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "buyer", "admin")
  async getAllStore(
    @Req() req: any
  ): Promise<ResponseWrapper<any>> {
    try {
      const store = await this.storeService.getAllStore();
      return new ResponseWrapper(HttpStatus.OK, "Store details", store);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }



  @Put("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "admin")
  async updateStoreAddress(
    @Req() req: any,
    @Body() updateStoreAddressDto: UpdateStoreAddressDto,
    @Query("sellerId") sellerId: string
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === "admin" && sellerId ? sellerId : req.user.id;
      const updatedAddress = await this.storeService.updateStoreAddress(
        id,
        updateStoreAddressDto
      );
      return new ResponseWrapper(
        HttpStatus.CREATED,
        "Address update successful"
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
}
