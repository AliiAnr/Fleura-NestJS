import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
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
  @Roles("seller")
  async updateSellerAddress(
    @Req() req: any,
    @Body() updateStoreDto: UpdateStoreDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const updatedAddress = await this.storeService.updateStore(
        req.user.id,
        updateStoreDto
      );
      return new ResponseWrapper(HttpStatus.OK, "Store update successful");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update address"
        );
      }
    }
  }

  @Put("picture")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPicture(
    @Req() req: any,
    @UploadedFile() file: Multer.File
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const updatedSeller = await this.storeService.uploadPicture(
        req.user.id,
        file
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        "Store picture upload successful"
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload store picture"
        );
      }
    }
  }
  @Put("logo")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  @UseInterceptors(FileInterceptor("file"))
  async uploadLogo(
    @Req() req: any,
    @UploadedFile() file: Multer.File
  ): Promise<ResponseWrapper<any>> {
    const maxSize = 500 * 1024; // 500 KB
    if (file.size > maxSize) {
      return new ResponseWrapper(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "File size exceeds the 500 KB limit"
      );
    }

    try {
      const updatedSeller = await this.storeService.uploadLogo(
        req.user.id,
        file
      );
      return new ResponseWrapper(HttpStatus.OK, "Store logo upload successful");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload store logo"
        );
      }
    }
  }
  @Get()
  @UseGuards(JwtLoginAuthGuard)
  // @UseGuards(JwtLoginAuthGuard, RoleGuard)
  // @Roles("seller")
  async getStore(@Req() req: any): Promise<ResponseWrapper<any>> {
    try {
      const store = await this.storeService.getStore(req.user.id);
      return new ResponseWrapper(HttpStatus.OK, "Store details", store);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to get store details"
        );
      }
    }
  }
  @Put("address")
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles("seller")
  async updateStoreAddress(
    @Req() req: any,
    @Body() updateStoreAddressDto: UpdateStoreAddressDto
  ): Promise<ResponseWrapper<any>> {
    try {
      const updatedAddress = await this.storeService.updateStoreAddress(
        req.user.id,
        updateStoreAddressDto
      );
      return new ResponseWrapper(HttpStatus.OK, "Address update successful");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return new ResponseWrapper(HttpStatus.UNAUTHORIZED, error.message);
      } else {
        return new ResponseWrapper(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update address"
        );
      }
    }
  }
}
