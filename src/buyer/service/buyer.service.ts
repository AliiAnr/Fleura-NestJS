import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OtpBuyerService } from "src/auth/service/otp.buyer.service";
import { Buyer } from "../entity/buyer.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { RegisterBuyerDto } from "../dto/register-buyer.dto";

@Injectable()
export class BuyerService {
  constructor(
    private otpService: OtpBuyerService,
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Buyer) private readonly userRepository: Repository<Buyer>
  ) {}

  async createUser(request: RegisterBuyerDto): Promise<Buyer> {
    try {
      await this.validateCreateUserRequest(request);
      const user = this.userRepository.create({
        ...request,
        password: await bcrypt.hash(request.password, 10),
      });
      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new Error("Failed to create user.");
    }
  }

  async updateUserName(userId, name): Promise<Buyer> {
    try {
      const userSameName = await this.userRepository.findOne({
        where: { name: name },
      });
      if(userSameName){
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
  private async validateCreateUserRequest(request: RegisterBuyerDto) {
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
  async resetPassword(userId, newPassword): Promise<Buyer> {
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
}
