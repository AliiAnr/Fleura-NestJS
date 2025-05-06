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
import { Store } from "../entity/store.entity";

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

  @Get("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("buyer","seller", "admin")
  async getStoreAddress(
    @Req() req: any,
    @Query("storeId") storeId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      let storeAddress;

      if (req.user.role === "admin" || req.user.role === "buyer") {
        // Jika admin atau buyer, gunakan storeId dari query
        if (!storeId) {
          throw new HttpException(
            new ResponseWrapper(HttpStatus.BAD_REQUEST, "storeId is required"),
            HttpStatus.BAD_REQUEST
          );
        }
        storeAddress = await this.storeService.getStoreAddress(storeId);
      } else if (req.user.role === "seller") {
        // Jika seller, gunakan id dari req.user.id
        storeAddress = await this.storeService.getStoreAddressBySellerId(req.user.id);
      } else {
        throw new UnauthorizedException("Unauthorized role");
      }

      return new ResponseWrapper(HttpStatus.OK, "Store address details", storeAddress);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error.message
        ),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  @Get("detail")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "buyer", "admin")
  async getStore(
    @Req() req: any,
    @Query("storeId") storeId?: string
  ): Promise<ResponseWrapper<any>> {
    try {
      let store;

      if (req.user.role === "admin" || req.user.role === "buyer") {
        // Jika admin atau buyer, gunakan storeId dari query
        if (!storeId) {
          throw new HttpException(
            new ResponseWrapper(HttpStatus.BAD_REQUEST, "storeId is required"),
            HttpStatus.BAD_REQUEST
          );
        }
        store = await this.storeService.getStoreByStoreId(storeId);
      } else if (req.user.role === "seller") {
        // Jika seller, gunakan id dari req.user.id
        store = await this.storeService.getStore(req.user.id);
      } else {
        throw new UnauthorizedException("Unauthorized role");
      }

      return new ResponseWrapper(HttpStatus.OK, "Store details", store);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error.message
        ),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "buyer", "admin")
  async getAllStore(@Req() req: any): Promise<ResponseWrapper<any>> {
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
  @Get("verified")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "buyer", "admin")
  async getAllVerifiedStore(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const store = await this.storeService.getAllVerifiedStore();
      return new ResponseWrapper(HttpStatus.OK, "Store details", store);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status
      );
    }
  }
  @Get("unverified")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller", "buyer", "admin")
  async getAllUnverifiedStore(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const store = await this.storeService.getAllUnverifiedStore();
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
