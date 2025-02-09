import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";
import { Repository } from "typeorm";
import { Product } from "../entity/product.entity";
import { CreateProductDto } from "../dto/create.product.dto";
@Injectable()
export class ProductService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Seller)
    private readonly userRepository: Repository<Seller>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async createProduct(
    userId: string,
    request: CreateProductDto
  ): Promise<Product> {
    try {
      
      const store = await this.storeRepository.findOne({ where: { sellerId: userId } });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      const product = this.productRepository.create({
        ...request,
        store: store,
      });
      const savedProduct = await this.productRepository.save(product);
      return savedProduct;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to create product.");
    }
  }
}
