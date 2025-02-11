import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Store } from "src/store/entity/store.entity";
import { Repository } from "typeorm";
import { Product } from "../entity/product.entity";
import { CreateProductDto } from "../dto/create.product.dto";
import { UpdateProductDto } from "../dto/update.product.dto";
import { ProductPicture } from "../entity/product-picture.entity";
import { Multer } from "multer";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ProductCategory } from "../entity/product-category.entity";
import { CreateCategoryDto } from "../dto/create.category.dto";
@Injectable()
export class CategoryService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Seller)
    private readonly userRepository: Repository<Seller>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductPicture)
    private readonly productPictureRepository: Repository<ProductPicture>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>
  ) {}

  async createCategory(request: CreateCategoryDto): Promise<ProductCategory> {
    try {
      const category = this.productCategoryRepository.create(request);
      const savedCategory = await this.productCategoryRepository.save(category);
      return savedCategory;
    } catch (error) {
      throw new InternalServerErrorException("Failed to create category.");
    }
  }
}
