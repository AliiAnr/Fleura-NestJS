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
        private readonly productCategoryRepository: Repository<ProductCategory>
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
      console.log("here");
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

      // Hapus file dari sistem file
      if (fs.existsSync(picture.path)) {
        fs.unlinkSync(picture.path);
      }

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
    // console.log(files);
    // console.log(productId);
    // console.log(userId);
    // console.log(files);
    try {
      // console.log(productId);
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

      const uploadDir = path.join(process.cwd(), "uploads", "product/picture");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const pictures = files.map((file) => {
        const fileExtension = path.extname(file.originalname);
        const filename = `${uuidv4()}${fileExtension}`;
        // console.log(filename);
        // console.log(productId)
        const uploadPath = path.join(uploadDir, filename);

        // Menulis file ke direktori uploads/products
        fs.writeFileSync(uploadPath, file.buffer);

        const picture = new ProductPicture();
        picture.product = product;
        picture.path = uploadPath; // Simpan nama file
        return picture;
      });

      // console.log(pictures);
      // console.log(product);

      product.picture.push(...pictures); // Pastikan ini sesuai dengan relasi di entitas Product
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProductCategory(
    userId: string,
    productId: string,
    categoryId: string
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
        relations: ["category"],
      });

      if (!product) {
        throw new UnauthorizedException("Product not Found");
      }

      const category = await this.productCategoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new UnauthorizedException("Category not Found");
      }

      product.category=category;
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new UnauthorizedException("Failed to update product category");
    }
  }

}
