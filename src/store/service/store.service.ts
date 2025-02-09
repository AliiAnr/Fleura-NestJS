import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Repository } from "typeorm";
import { Store } from "../entity/store.entity";
import { UpdateStoreDto } from "../dto/store.update.dto";
import * as path from "path";
import * as fs from "fs";
import { Multer } from "multer";

@Injectable()
export class StoreService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Seller)
    private readonly userRepository: Repository<Seller>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>
  ) {}

  async updateStore(userId: string, request: UpdateStoreDto): Promise<Store> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException("User not Found");
      }
      let store = await this.storeRepository.findOneBy({ sellerId: userId });
      if (!store) {
        store = new Store();
        store.sellerId = userId;
      }
      if (request.balance) {
        store.balance = request.balance;
      }
      if (request.name) {
        store.name = request.name;
      }
      if (request.description) {
        store.description = request.description;
      }
      if (request.operational_day) {
        store.operational_day = request.operational_day;
      }
      if (request.operational_hour) {
        store.operational_hour = request.operational_hour;
      }
      if (request.phone) {
        store.phone = request.phone;
      }

      store.updated_at = new Date();
      await this.storeRepository.save(store);
      return store;
    } catch (error) {
      throw new UnauthorizedException("Failed to update store");
    }
  }
  async uploadPicture(userId: string, file: Multer.File): Promise<Store> {
    try {
      const store = await this.storeRepository.findOneBy({ sellerId: userId });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }

      const uploadDir = path.join(
        __dirname,
        "..",
        "..",
        "uploads/store/picture"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalname);
      const filename = `${store.id}${fileExtension}`;
      const uploadPath = path.join(uploadDir, filename);

      fs.writeFileSync(uploadPath, file.buffer);
      store.picture = uploadPath;
      await this.storeRepository.save(store);
      //   console.log(user);
      return store;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async uploadLogo(userId: string, file: Multer.File): Promise<Store> {
    try {
      const store = await this.storeRepository.findOneBy({ sellerId: userId });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }

      const uploadDir = path.join(
        __dirname,
        "..",
        "..",
        "uploads/store/logo"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalname);
      const filename = `${store.id}${fileExtension}`;
      const uploadPath = path.join(uploadDir, filename);

      fs.writeFileSync(uploadPath, file.buffer);
      store.logo = uploadPath;
      await this.storeRepository.save(store);
      //   console.log(user);
      return store;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
