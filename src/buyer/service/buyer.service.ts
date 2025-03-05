import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { BuyerAddress } from "../entity/buyer.address.entity";
import { UpdateBuyerAddressDto } from "../dto/update.buyer-address.dto";
import { CreateBuyerAddressDto } from "../dto/create.buyer-address.dto";

@Injectable()
export class BuyerService {
  constructor(
    private otpService: OtpBuyerService,
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Buyer) private readonly userRepository: Repository<Buyer>,
    @InjectRepository(BuyerAddress)
    private readonly addressRepository: Repository<BuyerAddress>
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


  async getUserById(userId: string): Promise<Buyer> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }
      const { password, ...result } = user;
      return result as Buyer;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllUsers(): Promise<Partial<Buyer>[]> {
    try {
      const users = await this.userRepository.find();
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateUserName(userId, name): Promise<Buyer> {
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
        role: "buyer",
      });
      return access_token;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePhone(userId, phone): Promise<Buyer> {
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

  async updateBuyerAddress(
    userId: string,
    updateBuyerAddressDto: UpdateBuyerAddressDto
  ): Promise<BuyerAddress> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }

      let address = await this.addressRepository.findOne({
        where: { id: updateBuyerAddressDto.addressId, buyer: { id: userId } },
      });
      if (!address) {
        throw new UnprocessableEntityException("Address not Found");
      }

      if (updateBuyerAddressDto.postcode) {
        address.postcode = updateBuyerAddressDto.postcode;
      }
      if (updateBuyerAddressDto.road) {
        address.road = updateBuyerAddressDto.road;
      }
      if (updateBuyerAddressDto.province) {
        address.province = updateBuyerAddressDto.province;
      }
      if (updateBuyerAddressDto.city) {
        address.city = updateBuyerAddressDto.city;
      }
      if (updateBuyerAddressDto.detail) {
        address.detail = updateBuyerAddressDto.detail;
      }
      if (updateBuyerAddressDto.district) {
        address.district = updateBuyerAddressDto.district;
      }

      await this.addressRepository.save(address);
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addAddress(
    userId: string,
    request: CreateBuyerAddressDto
  ): Promise<BuyerAddress> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }

      const address = new BuyerAddress();
      address.buyer = user;
      address.postcode = request.postcode;
      address.road = request.road;
      address.province = request.province;
      address.city = request.city;
      address.detail = request.detail;
      address.district = request.district;

      await this.addressRepository.save(address);
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }

      const address = await this.addressRepository.findOne({
        where: { id: addressId, buyer: { id: userId } },
      });
      if (!address) {
        throw new NotFoundException("Address not Found");
      }

      await this.addressRepository.remove(address);
    } catch (error) {
      throw new InternalServerErrorException("Failed to delete address.");
    }
  }
}
