import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { LoginAuthDto } from '../dto/login-auth.dto';
import { LoginGoogleDto } from '../dto/login-google.dto';
import { Buyer } from 'src/buyer/entity/buyer.entity';

@Injectable()
export class AuthBuyerService {
  constructor(
    @InjectRepository(Buyer) private readonly userRepository: Repository<Buyer>,
    @Inject('JwtLoginService') private jwtLoginService: JwtService,
    @Inject('JwtForgotService') private jwtForgotService: JwtService,
  ) {}

  async validateUser({ email, password }: LoginAuthDto): Promise<string> {
    const findUser = await this.userRepository.findOne({
      where: { email },
    });
    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong Password');
    }
    const { id, email: userEmail } = findUser;
    const accessToken = this.jwtLoginService.sign({ id, email: userEmail });

    return accessToken;
  }

  // async generateForgotPasswordToken(email: string): Promise<string> {
  //   const findUser = await this.userRepository.findOne({
  //     where: { email },
  //   });
  //   if (!findUser) {
  //     throw new UnauthorizedException('User not found');
  //   }
  //   const accessToken = this.jwtForgotService.sign({ id: findUser.id });
  // }

  async validateGoogleUser(details: LoginGoogleDto): Promise<string> {
    try {
      let user = await this.userRepository.findOneBy({ email: details.email });
      if (user) {
        user.verified_at = new Date();
        await this.userRepository.save(user);
        console.log('User found and verified:', user.email);
      } else {
        console.log('User not found. Creating new user...');
        // console.log('Details:', details);
        user = this.userRepository.create({
          email: details.email,
          name: details.name,
          verified_at: new Date(),
        });
        console.log(user)
        user = await this.userRepository.save(user);
        console.log('New user created and verified:', user.email);
      }
      const access_token = this.jwtLoginService.sign({
        id: user.id,
        email: user.email,
      });
      return access_token;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to validate Google user');
    }
  }
}
