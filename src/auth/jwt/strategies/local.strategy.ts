import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import {
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthBuyerService } from "src/auth/service/auth.buyer.service";
import { Request } from "express";
import { AuthSellerService } from "src/auth/service/auth.seller.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject("AUTH_BUYER_SERVICE")
    private readonly authBuyerService: AuthBuyerService
    @Inject("AUTH_SELLER_SERVICE")
    private readonly authSellerService: AuthSellerService
  ) {
    super({
      usernameField: "email",
      passReqToCallback: true,
      passwordField: "password",
    });
  }
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

    if (req.originalUrl.includes("seller")) {
      const seller = await this.authSellerService.validateUser(
        {email,
        password,}
      );
      if (!seller) {
        throw new UnauthorizedException("Invalid credentials for seller");
      }
      return { ...seller, role: "seller" };
    }

    throw new UnauthorizedException("Invalid login route");
  }
}
