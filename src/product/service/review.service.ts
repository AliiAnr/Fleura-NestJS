import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { ProductReview } from "../entity/product-review.entity";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { CreateReviewDto } from "../dto/create.review.dto";
import { FCMService } from "src/notification/service/fcm.service";
@Injectable()
export class ReviewService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(Buyer)
    private readonly buyerRepository: Repository<Buyer>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductPicture)
    private readonly productPictureRepository: Repository<ProductPicture>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
    private readonly notificationService: FCMService
  ) {}

  async createReview(
    buyerId: string,

    request: CreateReviewDto
  ): Promise<ProductReview> {
    const product = await this.productRepository.findOne({
      where: { id: request.productId },
      relations: ["store"],
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const buyer = await this.buyerRepository.findOne({
      where: { id: buyerId },
    });
    if (!buyer) {
      throw new NotFoundException("Buyer not found");
    }

    const existingReview = await this.productReviewRepository.findOne({
      where: { buyerId: buyer.id, product },
    });
    // console.log(existingReview);
    if (existingReview) {
      throw new UnauthorizedException("You are already reviewed this product");
    }

    const review = new ProductReview();
    review.product = product;
    review.buyerId = buyer.id;
    review.message = request.message;
    review.rate = request.rate;

    // console.log(review);

    try {
      const result = await this.productReviewRepository.save(review);

      try {
        await this.notificationService.sendNotificationBySellerId(
          "Ulasan Baru",
          `Pembeli ${buyer.name} telah memberikan ulasan pada produk ${product.name}`,
          product.store.sellerId
        );
      } catch (error) {
        console.error("Failed to send review notification", error);
      }
      // console.log(result);
      return result;
    } catch (error) {
      throw new InternalServerErrorException("Failed to create review");
    }
  }

  async getReviewByProductId(productId: string): Promise<ProductReview[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const reviews = await this.productReviewRepository.find({
      where: { product },
    });

    return reviews;
  }

  async getReviewByBuyerId(buyerId: string): Promise<ProductReview[]> {
    const buyer = await this.buyerRepository.findOne({
      where: { id: buyerId },
    });
    // console.log(buyer);
    if (!buyer) {
      throw new NotFoundException("Buyer not found");
    }

    const reviews = await this.productReviewRepository.find({
      where: { buyerId: buyer.id },
    });
    // console.log(reviews);

    return reviews;
  }
}
