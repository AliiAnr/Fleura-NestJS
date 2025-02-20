import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { Product } from "src/product/entity/product.entity";
import { Store } from "src/store/entity/store.entity";
import { Repository } from "typeorm";
import { Order } from "../entity/order.entity";
import { OrderItem } from "../entity/order-item.entity";
import { CreateOrderDto } from "../dto/create-order.dto";
import { BuyerAddress } from "src/buyer/entity/buyer.address.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Buyer)
    private readonly buyerRepository: Repository<Buyer>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(BuyerAddress)
    private readonly buyerAddressRepository: Repository<BuyerAddress>
  ) {}

  async createOrder(buyerId: string, request: CreateOrderDto) {
    const shippingFee = 20000;

    const buyer = await this.buyerRepository.findOne({
      where: { id: buyerId },
    });
    if (!buyer) {
      throw new Error("Buyer not found");
    }

    // Buat order terlebih dahulu (tanpa orderItems)
    const order = this.orderRepository.create({ buyer });
    await this.orderRepository.save(order);

    // const order = new Order();
    // order.buyer = buyer;

    if (request.taken_method === 'delivery') {
      const userAddress = await this.buyerAddressRepository.findOne({
        where: { id: request.addressId, buyer: { id: buyerId } },
      });
      if (!userAddress) {
        throw new NotFoundException("Address not found");
      }
      // order.address = userAddress;
      order.addressId = userAddress.id
    }

    // console.log(order);

    // Ambil semua produk dalam sekali query untuk menghindari banyak request ke database
    const productIds = request.items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: productIds.map((id) => ({ id })),
      relations: ["store"],
    });

    if (products.length !== productIds.length) {
      throw new Error("Some products were not found");
    }

    // Validasi semua produk berasal dari store yang sama
    const store = products[0].store;
    if (!products.every((product) => product.store.id === store.id)) {
      throw new Error("All products must be from the same store");
    }

    // Buat orderItems
    const orderItems = request.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return this.orderItemRepository.create({
        order,
        product,
        quantity: item.quantity,
      });
    });

    await this.orderItemRepository.save(orderItems);

    // Hitung total harga
    const total = orderItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Update order dengan store, orderItems, dan total harga
    order.store = store;
    order.orderItems = orderItems;
    order.taken_method = request.taken_method;

    if (request.taken_method === "delivery") {
      order.total = total + shippingFee;
    } else {
      order.total = total;
    }

    return this.orderRepository.save(order);
  }
}
