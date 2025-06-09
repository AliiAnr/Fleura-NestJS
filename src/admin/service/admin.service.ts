import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Admin, AdminReviewStatus } from "../entity/admin.entity";
import * as bcrypt from "bcrypt";
import { RegisterAdminDto } from "../dto/register-admin.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { Seller } from "src/seller/entity/seller.entity";
import { Product } from "src/product/entity/product.entity";
import { Store } from "src/store/entity/store.entity";
import { AdminProductReview } from "../entity/admin-product-review.entity";
import { AdminStoreReview } from "../entity/admin-store-review.entity";
import { AdminSellerReview } from "../entity/admin-seller-review.entity";
import { AdminSellerReviewDto } from "../dto/seller-review.dto";
import { AdminProductReviewDto } from "../dto/product-review.dto";
import { AdminStoreReviewDto } from "../dto/store-review.dto";
import { FCMService } from "src/notification/service/fcm.service";

@Injectable()
export class AdminService {
  constructor(
    @Inject("JwtLoginService") private jwtLoginService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(AdminProductReview)
    private readonly adminProductReviewRepository: Repository<AdminProductReview>,
    @InjectRepository(AdminStoreReview)
    private readonly adminStoreReviewRepository: Repository<AdminStoreReview>,
    @InjectRepository(AdminSellerReview)
    private readonly adminSellerReviewRepository: Repository<AdminSellerReview>,
    private readonly notificationService: FCMService
  ) {}

  //   async createUser(request: RegisterAdminDto): Promise<Admin> {
  //     try {
  //       await this.validateCreateUserRequest(request);
  //       const user = this.userRepository.create({
  //         ...request,
  //         password: await bcrypt.hash(request.password, 10),
  //       });
  //       const savedUser = await this.userRepository.save(user);
  //       return savedUser;
  //     } catch (error) {
  //       if (error instanceof UnprocessableEntityException) {
  //         throw error;
  //       }
  //       throw new Error("Failed to create admin.");
  //     }
  //   }
  //   private async validateCreateUserRequest(request: RegisterAdminDto) {
  //     try {
  //       const user = await this.userRepository.findOne({
  //         where: { name: request.name },
  //       });

  //       if (user) {
  //         console.log("error");
  //         throw new UnprocessableEntityException("Admin already exists.");
  //       }
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     } catch (err) {
  //       if (err instanceof UnprocessableEntityException) {
  //         throw err;
  //       }

  //       console.log("error: Unexpected error");
  //       throw new Error("Error validating user request.");
  //     }
  //   }

  async reviewSeller(
    adminSellerReviewDto: AdminSellerReviewDto
  ): Promise<AdminSellerReview> {
    const { sellerId, description, status } = adminSellerReviewDto;

    // Cari seller berdasarkan sellerId
    const seller = await this.sellerRepository.findOne({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new NotFoundException("Seller not found");
    }

    // Buat review baru
    const review = this.adminSellerReviewRepository.create({
      seller,
      description,
      status,
    });

    // Simpan review ke database
    const savedReview = await this.adminSellerReviewRepository.save(review);

    // Jika status review adalah ACCEPTED, perbarui kolom admin_verified_at di tabel seller
    if (status === AdminReviewStatus.ACCEPTED) {
      seller.admin_verified_at = new Date(); // Set waktu verifikasi ke waktu saat ini
      await this.sellerRepository.save(seller);
    }

    if (status === AdminReviewStatus.REJECTED) {
      // Kirim notifikasi ke seller jika review ditolak
      this.notificationService.sendNotificationBySellerId(
        "Akun Penjual Anda Ditolak",
        `Akun penjual Anda telah ditolak oleh admin. Silakan periksa kembali informasi yang Anda berikan.`,
        seller.id
      );
    } else if (status === AdminReviewStatus.ACCEPTED) {
      // Kirim notifikasi ke seller jika review diterima
      this.notificationService.sendNotificationBySellerId(
        "Akun Penjual Anda Diterima",
        `Akun penjual Anda telah diterima oleh admin. Anda sekarang dapat mulai berjualan.`,
        seller.id
      );
    } else if (status === AdminReviewStatus.NEED_REVIEW) {
      // Kirim notifikasi ke seller jika review perlu ditinjau ulang
      this.notificationService.sendNotificationBySellerId(
        "Akun Penjual Perlu Tinjauan Ulang",
        `Akun penjual Anda perlu ditinjau ulang oleh admin. Silakan periksa kembali informasi yang Anda berikan.`,
        seller.id
      );
    }

    return savedReview;
  }

  async reviewProduct(
    adminProductReviewDto: AdminProductReviewDto
  ): Promise<AdminProductReview> {
    const { productId, description, status } = adminProductReviewDto;

    // Cari produk berdasarkan productId
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Buat review baru
    const review = this.adminProductReviewRepository.create({
      product,
      description,
      status,
    });

    // Simpan review ke database
    const savedReview = await this.adminProductReviewRepository.save(review);

    // Jika status review adalah ACCEPTED, perbarui kolom admin_verified_at di tabel product
    if (status === AdminReviewStatus.ACCEPTED) {
      product.admin_verified_at = new Date(); // Set waktu verifikasi ke waktu saat ini
      await this.productRepository.save(product);
    }

    if( status === AdminReviewStatus.REJECTED) {
      // Kirim notifikasi ke seller jika review ditolak
      this.notificationService.sendNotificationBySellerId(
        "Produk Anda Ditolak",
        `Produk Anda  ${product.name} telah ditolak oleh admin. Silakan periksa kembali informasi yang Anda berikan.`,
        product.store.seller.id
      );
    } else if (status === AdminReviewStatus.ACCEPTED) {
      // Kirim notifikasi ke seller jika review diterima
      this.notificationService.sendNotificationBySellerId(
        "Produk Anda Diterima",
        `Produk Anda ${product.name} telah diterima oleh admin. Produk Anda sekarang dapat dilihat oleh pembeli.`,
        product.store.seller.id
      );
    } else if (status === AdminReviewStatus.NEED_REVIEW) {
      // Kirim notifikasi ke seller jika review perlu ditinjau ulang
      this.notificationService.sendNotificationBySellerId(
        "Produk Perlu Tinjauan Ulang",
        `Produk Anda ${product.name} perlu ditinjau ulang oleh admin. Silakan periksa kembali informasi yang Anda berikan.`,
        product.store.seller.id
      );
    }

    return savedReview;
  }

  async reviewStore(
    adminStoreReviewDto: AdminStoreReviewDto
  ): Promise<AdminStoreReview> {
    const { storeId, description, status } = adminStoreReviewDto;

    // Cari store berdasarkan storeId
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException("Store not found");
    }

    // Buat review baru
    const review = this.adminStoreReviewRepository.create({
      store,
      description,
      status,
    });

    // Simpan review ke database
    const savedReview = await this.adminStoreReviewRepository.save(review);

    // Jika status review adalah ACCEPTED, perbarui kolom admin_verified_at di tabel store
    if (status === AdminReviewStatus.ACCEPTED) {
      store.admin_verified_at = new Date(); // Set waktu verifikasi ke waktu saat ini
      await this.storeRepository.save(store);
    }

    if (status === AdminReviewStatus.REJECTED) {
      // Kirim notifikasi ke seller jika review ditolak
      this.notificationService.sendNotificationBySellerId(
        "Toko Anda Ditolak",
        `Toko Anda ${store.name} telah ditolak oleh admin. Silakan periksa kembali informasi yang Anda berikan.`,
        store.seller.id
      );  
    } else if (status === AdminReviewStatus.ACCEPTED) { 
      // Kirim notifikasi ke seller jika review diterima
      this.notificationService.sendNotificationBySellerId(
        "Toko Anda Diterima",
        `Toko Anda ${store.name} telah diterima oleh admin. Toko Anda sekarang dapat dilihat oleh pembeli.`,
        store.seller.id
      );
    }
    else if (status === AdminReviewStatus.NEED_REVIEW) {
      // Kirim notifikasi ke seller jika review perlu ditinjau ulang
      this.notificationService.sendNotificationBySellerId(
        "Toko Perlu Tinjauan Ulang",
        `Toko Anda ${store.name} perlu ditinjau ulang oleh admin. Silakan periksa kembali informasi yang Anda berikan.`,
        store.seller.id
      );
    }

    return savedReview;
  }
}
