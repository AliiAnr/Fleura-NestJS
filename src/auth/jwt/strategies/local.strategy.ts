import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { validateOrReject } from "class-validator";
import { LoginAuthDto } from "src/auth/dto/login-auth.dto";
import { AuthBuyerService } from "src/auth/service/auth.buyer.service";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject("AUTH_BUYER_SERVICE")
    private readonly authBuyerService: AuthBuyerService
  ) {
    super({
      usernameField: "email",
      passReqToCallback: true,
      passwordField: "password",
    });
  }

  // async validate(email: string, password: string) {
  //   const authDto = new LoginAuthDto();
  //   authDto.email = email;
  //   authDto.password = password;

  //   try {
  //     await validateOrReject(authDto);
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (errors) {
  //     throw new BadRequestException();
  //   }
  //   try {
  //     const access_token = await this.authBuyerService.validateUser({
  //       email,
  //       password,
  //     });
  //     return access_token;
  //   } catch (error) {
  //     if (error instanceof UnauthorizedException) {
  //       throw error;
  //     }
  //     throw InternalServerErrorException;
  //   }
  // }
  async validate(req: Request, email: string, password: string): Promise<any> {
    // Tentukan apakah endpoint yang digunakan adalah buyer atau seller
    // console.log(req);
    console.log(req.originalUrl);
    // console.log(req.url);
    // console.log(req.path);
    if (req.originalUrl.includes("buyer")) {
      // console.log("masuk buyer");
      const buyer = await this.authBuyerService.validateUser({
        email,
        password,
      });
      if (!buyer) {
        throw new UnauthorizedException("Invalid credentials for buyer");
      }
      return { ...buyer, role: "buyer" };
    }

    // if (req.baseUrl.includes("seller")) {
    //   const seller = await this.authSellerService.validateSeller(
    //     email,
    //     password
    //   );
    //   if (!seller) {
    //     throw new UnauthorizedException("Invalid credentials for seller");
    //   }
    //   return { ...seller, role: "seller" };
    // }

    throw new UnauthorizedException("Invalid login route");
  }
}
