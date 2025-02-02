import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';
import { AuthBuyerService } from 'src/auth/service/auth.buyer.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_BUYER_SERVICE') private readonly authService: AuthBuyerService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const authDto = new LoginAuthDto();
    authDto.email = email;
    authDto.password = password;

    try {
      await validateOrReject(authDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (errors) {
      throw new BadRequestException();
    }
    try {
      const access_token = await this.authService.validateUser({
        email,
        password,
      });
      return access_token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException;
    }
  }
}
