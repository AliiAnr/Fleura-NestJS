import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Seller } from "../entity/seller.entity";
import { OtpSellerService } from "src/auth/service/otp.seller.service";
import { RegisterSellerDto } from "../dto/register.seller.dto";
import { UpdateSellerPartialDto } from "../dto/update.seller-partial.dto";

@Injectable()
export class SellerService {
  constructor(
    private otpService: OtpSellerService,
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Seller)
    private readonly userRepository: Repository<Seller>
  ) {}

  async createUser(request: RegisterSellerDto): Promise<Seller> {
    try {
      await this.validateCreateUserRequest(request);
      const user = this.userRepository.create({
        ...request,
        password: await bcrypt.hash(request.password, 10),
      });
      const savedUser = await this.userRepository.save(user);
      console.log(savedUser);
      return savedUser;
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new Error("Failed to create user.");
    }
  }

  async updateUserName(userId, name): Promise<Seller> {
    try {
      const userSameName = await this.userRepository.findOne({
        where: { name: name },
      });
      if (userSameName) {
        throw new UnprocessableEntityException("Username already exists.");
      }
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }
      user.name = name;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateEmail(userId, email): Promise<String> {
    try {
      const userSameEmail = await this.userRepository.findOne({
        where: { email: email },
      });
      if (userSameEmail) {
        throw new UnprocessableEntityException("Email already exists.");
      }
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }
      user.email = email;
      await this.userRepository.save(user);
      const access_token = await this.jwtLoginService.sign({
        id: user.id,
        email: user.email,
        role: "seller",
      });
      return access_token;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePhone(userId, phone): Promise<Seller> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }
      user.phone = phone;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async validateCreateUserRequest(request: RegisterSellerDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: request.email },
      });

      if (user) {
        console.log("error");
        throw new UnprocessableEntityException("Email already exists.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      if (err instanceof UnprocessableEntityException) {
        throw err;
      }

      console.log("error: Unexpected error");
      throw new Error("Error validating user request.");
    }
  }
  async resetPassword(userId, newPassword): Promise<Seller> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateSellerPartial(
    userId: string,
    updateSellerPartialDto: UpdateSellerPartialDto
  ): Promise<Seller> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }

      if (updateSellerPartialDto.name) {
        const userSameName = await this.userRepository.findOne({
          where: { name: updateSellerPartialDto.name },
        });
        if (userSameName) {
          throw new UnprocessableEntityException("Username already exists.");
        }
        user.name = updateSellerPartialDto.name;
      }

      if (updateSellerPartialDto.identity_number) {
        user.identity_number = updateSellerPartialDto.identity_number;
      }

      if (updateSellerPartialDto.phone) {
        user.phone = updateSellerPartialDto.phone;
      }

      if (updateSellerPartialDto.account) {
        user.account = updateSellerPartialDto.account;
      }

      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
