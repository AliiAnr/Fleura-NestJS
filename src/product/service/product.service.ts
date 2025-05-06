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
import { IsNull, Not, Repository } from "typeorm";
import { Product } from "../entity/product.entity";
import { CreateProductDto } from "../dto/create.product.dto";
import { UpdateProductDto } from "../dto/update.product.dto";
import { ProductPicture } from "../entity/product-picture.entity";
import { Multer } from "multer";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ProductCategory } from "../entity/product-category.entity";
import { SupabaseService } from "src/supabase/supabase.service";
import { ProductReview } from "../entity/product-review.entity";
@Injectable()
export class ProductService {
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
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
    private readonly supabaseService: SupabaseService
  ) {}

  async createProduct(
    userId: string,
    request: CreateProductDto
  ): Promise<Product> {
    try {
      const store = await this.storeRepository.findOne({
        where: { sellerId: userId },
      });
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

  async updateProduct(
    userId: string,
    productId: string,
    request: UpdateProductDto
  ): Promise<Product> {
    try {
      const store = await this.storeRepository.findOne({
        where: { sellerId: userId },
      });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      const product = await this.productRepository.findOne({
        where: { id: productId, store: store },
      });

      if (!product) {
        throw new UnauthorizedException("Product not Found");
      }
      if (request.name) {
        product.name = request.name;
      }
      if (request.description) {
        product.description = request.description;
      }
      if (request.price) {
        product.price = request.price;
      }
      if (request.stock) {
        product.stock = request.stock;
      }
      if (request.pre_order != null) {
        product.pre_order = request.pre_order;
      }
      if (request.arrange_time) {
        product.arrange_time = request.arrange_time;
      }
      if (request.point) {
        product.point = request.point;
      }

      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new UnauthorizedException("Failed to update product");
    }
  }

  async DeletePictureById(
    productId: string,
    pictureId: string
  ): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ["picture"],
      });
      if (!product) {
        throw new UnauthorizedException("Product not Found");
      }

      const picture = product.picture.find((pic) => pic.id === pictureId);
      if (!picture) {
        throw new UnauthorizedException("Picture not Found");
      }

      // Hapus file dari Supabase
      const filePath = picture.path.split(
        `/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`
      )[1];
      // console.log(`File path to delete: ${filePath}`);
      await this.supabaseService.deleteFile(filePath);

      // Hapus entri gambar dari produk
      product.picture = product.picture.filter((pic) => pic.id !== pictureId);
      await this.productRepository.save(product);

      // Hapus entri gambar dari tabel product_picture
      await this.productPictureRepository.remove(picture);
      return product;
    } catch (error) {
      throw new InternalServerErrorException("Failed to delete picture");
    }
  }

  async uploadManyPicture(
    userId: string,
    productId: string,
    files: Multer.File[]
  ): Promise<Product> {
    try {
      const store = await this.storeRepository.findOne({
        where: { sellerId: userId },
      });

      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      const product = await this.productRepository.findOne({
        where: { id: productId, store: store },
        relations: ["picture"], // Pastikan untuk memuat relasi pictures
      });
      if (!product) {
        throw new UnauthorizedException("Product not Found");
      }

      const pictures = await Promise.all(
        files.map(async (file) => {
          const fileUrl = await this.supabaseService.uploadFile(
            `product/picture/${product.id}`,
            file
          );

          const picture = new ProductPicture();
          picture.product = product;
          picture.path = fileUrl; // Simpan URL file
          return picture;
        })
      );

      product.picture.push(...pictures); // Pastikan ini sesuai dengan relasi di entitas Product
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProductCategory(
    user_id: string,
    product_id: string,
    category_id: string
  ): Promise<Product> {
    try {
      const store = await this.storeRepository.findOne({
        where: { sellerId: user_id },
      });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      const product = await this.productRepository.findOne({
        where: { id: product_id, store: store },
        relations: ["category"],
      });

      if (!product) {
        throw new UnauthorizedException("Product not Found");
      }

      const category = await this.productCategoryRepository.findOne({
        where: { id: category_id },
      });
      if (!category) {
        throw new UnauthorizedException("Category not Found");
      }

      product.category = category;
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new UnauthorizedException("Failed to update product category");
    }
  }
  async deleteProductCategory(
    user_id: string,
    product_id: string
  ): Promise<Product> {
    try {
      const store = await this.storeRepository.findOne({
        where: { sellerId: user_id },
      });
      if (!store) {
        throw new UnauthorizedException("Store not Found");
      }
      const product = await this.productRepository.findOne({
        where: { id: product_id, store: store },
        relations: ["category"],
      });

      if (!product) {
        throw new UnauthorizedException("Product not Found");
      }

      product.category = null;
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new UnauthorizedException("Failed to delete product category");
    }
  }

  async getProductByProductId(productId: string): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ["store", "category", "picture", "review"],
    });

    if (!product) {
      throw new UnauthorizedException("Product not Found");
    }

    const ratings = product.review.map((review) => review.rate);
    const rating =
      ratings.length > 0
        ? ratings.reduce((sum: number, rate: number) => sum + rate, 0) /
          ratings.length
        : 0; // Jika tidak ada ulasan, rating adalah 0
    const review_count = product.review.length;
    const { review, ...productWithoutReview } = product;
    const productWithRatings = {
      ...productWithoutReview,
      rating,
      review_count,
    };

    // console.log(product);
    return productWithRatings;
  }

  async getProductsByStoreId(storeId: string): Promise<any> {
    try {
      const products = await this.productRepository.find({
        where: { store: { id: storeId } },
        relations: ["store", "category", "picture", "review"],
      });
      // Hitung rata-rata rating untuk setiap produk
      const productsWithRatings = products.map((product) => {
        const ratings = product.review.map((review) => review.rate);
        const rating =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0; // Jika tidak ada ulasan, rating adalah null

        const review_count = product.review.length;
        const { review, ...productWithoutReview } = product;
        return {
          ...productWithoutReview,
          rating,
          review_count,
        };
      });
      return productsWithRatings;
    } catch (error) {
      throw new InternalServerErrorException("Failed to get products");
    }
    // return products;
  }

  async getAllProducts(): Promise<any> {
    const products = await this.productRepository.find({
      relations: ["store", "category", "picture", "review"],
    });
    const productsWithRatings = products.map((product) => {
      const ratings = product.review.map((review) => review.rate);
      const rating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0; // Jika tidak ada ulasan, rating adalah null

      const review_count = product.review.length;
      const { review, ...productWithoutReview } = product;
      return {
        ...productWithoutReview,
        rating,
        review_count,
      };
    });
    return productsWithRatings;
  }

  async getAllVerifiedProducts(): Promise<any> {
    const products = await this.productRepository.find({
      where: { admin_verified_at: Not(IsNull()) },
      relations: ["store", "category", "picture", "review"],
    });
    const productsWithRatings = products.map((product) => {
      const ratings = product.review.map((review) => review.rate);
      const rating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0; // Jika tidak ada ulasan, rating adalah null

      const review_count = product.review.length;
      const { review, ...productWithoutReview } = product;
      return {
        ...productWithoutReview,
        rating,
        review_count,
      };
    });
    return productsWithRatings;
  }
  async getAllUnverifiedProducts(): Promise<any> {
    const products = await this.productRepository.find({
      where: { admin_verified_at: IsNull() },
      relations: ["store", "category", "picture", "review"],
    });
    const productsWithRatings = products.map((product) => {
      const ratings = product.review.map((review) => review.rate);
      const rating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0; // Jika tidak ada ulasan, rating adalah null

      const review_count = product.review.length;
      const { review, ...productWithoutReview } = product;
      return {
        ...productWithoutReview,
        rating,
        review_count,
      };
    });
    return productsWithRatings;
  }

  async getProductByCategory(categoryId: string): Promise<any> {
    const products = await this.productRepository.find({
      where: { category: { id: categoryId } },
      relations: ["store", "category", "picture", "review"],
    });
    const productsWithRatings = products.map((product) => {
      const ratings = product.review.map((review) => review.rate);
      const rating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0; // Jika tidak ada ulasan, rating adalah null

      const review_count = product.review.length;
      const { review, ...productWithoutReview } = product;
      return {
        ...productWithoutReview,
        rating,
        review_count,
      };
    });
    return productsWithRatings;
  }

  async getProductByCategoryIdandStoreId(
    categoryId: string,
    storeId: string
  ): Promise<any> {
    const products = await this.productRepository.find({
      where: { category: { id: categoryId }, store: { id: storeId } },
      relations: ["store", "category", "picture", "review"],
    });
    const productsWithRatings = products.map((product) => {
      const ratings = product.review.map((review) => review.rate);
      const rating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0; // Jika tidak ada ulasan, rating adalah null

      const review_count = product.review.length;
      const { review, ...productWithoutReview } = product;
      return {
        ...productWithoutReview,
        rating,
        review_count,
      };
    });
    return productsWithRatings;
  }

  
}
