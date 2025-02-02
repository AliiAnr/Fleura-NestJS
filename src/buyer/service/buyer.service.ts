import { Inject, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OtpBuyerService } from "src/auth/service/otp.buyer.service";
import { Buyer } from "../entity/buyer.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from "../dto/register-user.dto";

@Injectable()
export class BuyerService {
  constructor(
    private otpService: OtpBuyerService,
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Buyer) private readonly userRepository: Repository<Buyer>
  ) {}

  async createUser(request: RegisterUserDto): Promise<Buyer> {
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
  private async validateCreateUserRequest(request: RegisterUserDto) {
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
}
