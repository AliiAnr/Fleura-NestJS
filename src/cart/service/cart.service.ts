import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { Product } from "src/product/entity/product.entity";
import { RedisService } from "src/redis/redis.service";
import { Store } from "src/store/entity/store.entity";
import { In, Repository } from "typeorm";
import { CreateCartDto } from "../dto/create-cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Buyer)
    private readonly buyerRepository: Repository<Buyer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly redisService: RedisService
  ) {}

  async saveCartToRedis(
    buyerId: string,
    cartData: CreateCartDto
  ): Promise<void> {
    const { productId, quantity } = cartData;
    const cartKey = `cart:${buyerId}`;

    // Ambil informasi produk
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ["store"],
    });

    if (!product) {
      throw new BadRequestException("Produk tidak ditemukan");
    }

    const storeId = product.store.id;
    const productKey = `product:${productId}`;

    // Cek apakah produk sudah ada di cart
    const existingCartItem = await this.redisService.hget(cartKey, productKey);

    let newQuantity = quantity;
    let total = product.price * quantity;
    let price = product.price;

    if (existingCartItem) {
      const parsedItem = JSON.parse(existingCartItem);
      newQuantity += parsedItem.quantity; // Tambah jumlah produk yang sudah ada
      total = product.price * newQuantity; // Update total harga
    }

    // Simpan produk ke dalam cart (update atau tambah)
    await this.redisService.hset(
      cartKey,
      productKey,
      JSON.stringify({
        productId,
        storeId,
        quantity: newQuantity,
        price,
        total,
      })
    );

    // console.log(
    //   `Cart updated for buyer ${buyerId}, product ${productId} quantity: ${newQuantity}`
    // );
  }

  async increaseQuantity(buyerId: string, productId: string) {
    const cartKey = `cart:${buyerId}`;
    const productKey = `product:${productId}`;

    const existingCartItem = await this.redisService.hget(cartKey, productKey);

    if (!existingCartItem) {
      throw new BadRequestException("Produk tidak ditemukan di cart");
    }

    const parsedItem = JSON.parse(existingCartItem);
    const newQuantity = parsedItem.quantity + 1;
    const total = parsedItem.price * newQuantity;

    await this.redisService.hset(
      cartKey,
      productKey,
      JSON.stringify({ ...parsedItem, quantity: newQuantity, total })
    );
  }

  async decreaseQuantity(buyerId: string, productId: string) {
    const cartKey = `cart:${buyerId}`;
    const productKey = `product:${productId}`;

    const existingCartItem = await this.redisService.hget(cartKey, productKey);

    if (!existingCartItem) {
      throw new BadRequestException("Produk tidak ditemukan di cart");
    }

    const parsedItem = JSON.parse(existingCartItem);
    const newQuantity = parsedItem.quantity - 1;
    const total = parsedItem.price * newQuantity;

    if (newQuantity <= 0) {
      await this.removeFromCart(buyerId, productId);
      return;
    }

    await this.redisService.hset(
      cartKey,
      productKey,
      JSON.stringify({ ...parsedItem, quantity: newQuantity, total })
    );
  }

  /**
   * Mengambil isi cart dari Redis dan mengelompokkan berdasarkan store
   */
  async getCart(buyerId: string) {
    const cartKey = `cart:${buyerId}`;
    const cartItems = await this.redisService.hgetall(cartKey);

    if (!cartItems) return {};

    // Parse JSON untuk setiap produk
    const products = Object.entries(cartItems).map(([key, value]) =>
      JSON.parse(value as string)
    );

    // Ambil informasi produk dan store dari repository
    const productIds = products.map((item) => item.productId);
    const productsInfo = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ["store"],
    });

    // Gabungkan informasi produk dan store ke dalam cart items
    const enrichedProducts = products.map((item) => {
      const productInfo = productsInfo.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: productInfo.name,
        storeName: productInfo.store.name,
      };
    });

    // Kelompokkan berdasarkan storeId
    return this.groupCartByStore(enrichedProducts);
  }

  /**
   * Menghapus satu produk dari cart
   */
  async removeFromCart(buyerId: string, productId: string) {
    const cartKey = `cart:${buyerId}`;
    await this.redisService.hdel(cartKey, `product:${productId}`);
  }

  /**
   * Menghapus seluruh cart
   */
  async clearCart(buyerId: string) {
    const cartKey = `cart:${buyerId}`;
    await this.redisService.del(cartKey);
  }

  /**
   * Mengelompokkan produk berdasarkan storeId
   */
  private groupCartByStore(cartItems: any[]) {
    const groupedCart = cartItems.reduce((acc, item) => {
      const { storeId, storeName } = item;
      if (!acc[storeId]) {
        acc[storeId] = { storeId, storeName, items: [] };
      }
      acc[storeId].items.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      });
      return acc;
    }, {});

    return Object.values(groupedCart);
  }
}
