import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Repository } from "typeorm";
import { Store } from "../entity/store.entity";
import { UpdateStoreDto } from "../dto/store.update.dto";
import * as path from "path";
import * as fs from "fs";
import { Multer } from "multer";
import { UpdateStoreAddressDto } from "../dto/update.store-address.dto";
import { StoreAddress } from "../entity/seller.address.entity";
import { SupabaseService } from "src/supabase/supabase.service";

@Injectable()
export class StoreService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Seller)
    private readonly userRepository: Repository<Seller>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreAddress)
    private readonly addressRepository: Repository<StoreAddress>,
    private readonly supabaseService: SupabaseService
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

      const fileUrl = await this.supabaseService.uploadFile(
        `store/picture/${store.id}`,
        file
      );

      store.picture = fileUrl;
      await this.storeRepository.save(store);
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

      const fileUrl = await this.supabaseService.uploadFile(
        `store/logo/${store.id}`,
        file
      );

      store.logo = fileUrl;
      await this.storeRepository.save(store);
      return store;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getStore(userId: string): Promise<Partial<Store>> {
    try {
      const store = await this.storeRepository.findOneBy({ sellerId: userId });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      // const { id, sellerId, ...storeData } = store;
      return store;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getStoreByStoreId(storeId: string): Promise<Partial<Store>> {
    try {
      const store = await this.storeRepository.findOneBy({ id: storeId });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      // const { id, sellerId, ...storeData } = store;
      return store;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllStore(): Promise<Store[]> {
    try {
      const stores = await this.storeRepository.find();
      return stores;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateStoreAddress(
    userId: string,
    updateSellerAddressDto: UpdateStoreAddressDto
  ): Promise<StoreAddress> {
    try {
      const store = await this.storeRepository.findOneBy({ sellerId: userId });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }

      let address = await this.addressRepository.findOneBy({
        storeId: store.id,
      });
      if (!address) {
        address = new StoreAddress();
        address.storeId = store.id;
      }

      if (updateSellerAddressDto.postcode) {
        address.postcode = updateSellerAddressDto.postcode;
      }
      if (updateSellerAddressDto.road) {
        address.road = updateSellerAddressDto.road;
      }
      if (updateSellerAddressDto.province) {
        address.province = updateSellerAddressDto.province;
      }
      if (updateSellerAddressDto.city) {
        address.city = updateSellerAddressDto.city;
      }
      if (updateSellerAddressDto.detail) {
        address.detail = updateSellerAddressDto.detail;
      }
      if (updateSellerAddressDto.district) {
        address.district = updateSellerAddressDto.district;
      }

      await this.addressRepository.save(address);
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
