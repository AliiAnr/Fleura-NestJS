import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { Product } from "src/product/entity/product.entity";
import { Store } from "src/store/entity/store.entity";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "../entity/order.entity";
import { OrderItem } from "../entity/order-item.entity";
import { CreateOrderDto } from "../dto/create-order.dto";
import { BuyerAddress } from "src/buyer/entity/buyer.address.entity";
import { Payment, PaymentMethod } from "../entity/payment.entity";
import { PaymentService } from "./payment.service";

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
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(BuyerAddress)
    private readonly buyerAddressRepository: Repository<BuyerAddress>,
    private paymentService: PaymentService
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

    if (request.taken_method === "delivery") {
      const userAddress = await this.buyerAddressRepository.findOne({
        where: { id: request.addressId, buyer: { id: buyerId } },
      });
      if (!userAddress) {
        throw new NotFoundException("Address not found");
      }
      // order.address = userAddress;
      order.addressId = userAddress.id;
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
    const totalPoint = orderItems.reduce(
      (sum, item) => sum + item.product.point * item.quantity,
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

    order.point = totalPoint;

    // Simpan order
    await this.orderRepository.save(order);

    // Panggil fungsi pembayaran berdasarkan metode pembayaran
    switch (request.payment_method) {
      case PaymentMethod.QRIS:
        return this.paymentService.createQrisTransaction(order.id);
      case PaymentMethod.CASH:
        return this.paymentService.createCashTransaction(order.id);
      case PaymentMethod.POINT:
        return this.paymentService.createPointTransaction(order.id);
      default:
        throw new HttpException(
          { message: "Invalid payment method" },
          HttpStatus.BAD_REQUEST
        );
    }
  }

  async getOrdersByBuyerId(buyerId: string) {
    console.log(buyerId);
    return this.orderRepository.find({
      where: { buyer: { id: buyerId } },
      relations: [
        "orderItems",
        "orderItems.product",
        "orderItems.product.store",
        "orderItems.product.category",
        "orderItems.product.picture",
        "payment",
      ],
    });
  }

  async getOrdersByStore(StoreId: string) {
    return this.orderRepository.find({
      where: { store: { id: StoreId } },
      relations: [
        "orderItems",
        "orderItems.product",
        "orderItems.product.store",
        "orderItems.product.category",
        "orderItems.product.picture",
        "payment",
      ],
    });
  }

  async getOrder(orderId: string) {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        "orderItems",
        "orderItems.product",
        "orderItems.product.store",
        "orderItems.product.category",
        "orderItems.product.picture",
        "payment",
      ],
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["buyer"],
    });
    // console.log(order);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.status === status) {
      throw new HttpException(
        { message: "Order status is already the same" },
        HttpStatus.BAD_REQUEST
      );
    }

    const Payment = await this.paymentRepository.findOne({
      where: { orderId: orderId },
    });

    const buyer = await this.buyerRepository.findOne({
      where: { id: order.buyer.id },
    });

    console.log(status);
    console.log(Payment);

    order.status = status;
    if (Payment) {
      if (Payment.methode === PaymentMethod.POINT) {
        return this.orderRepository.save(order);
      }
    }
    if (status === OrderStatus.COMPLETED) {
      const earnedPoint = Math.floor(order.total * 0.001);
      console.log(earnedPoint);
      buyer.point += earnedPoint;
      console.log(buyer.point);
      // console.log(earnedPoint);
      await this.buyerRepository.save(buyer);
    }

    return this.orderRepository.save(order);
  }

  // async createOrderByRedeeemPoint(buyerId: string, request: CreateOrderDto) {
  //   const buyer = await this.buyerRepository.findOne({
  //     where: { id: buyerId },
  //   });
  //   if (!buyer) {
  //     throw new Error("Buyer not found");
  //   }

  //   // Buat order terlebih dahulu (tanpa orderItems)
  //   const order = this.orderRepository.create({ buyer });
  //   await this.orderRepository.save(order);

  //   // const order = new Order();
  //   // order.buyer = buyer;

  //   if (request.taken_method === "delivery") {
  //     const userAddress = await this.buyerAddressRepository.findOne({
  //       where: { id: request.addressId, buyer: { id: buyerId } },
  //     });
  //     if (!userAddress) {
  //       throw new NotFoundException("Address not found");
  //     }
  //     // order.address = userAddress;
  //     order.addressId = userAddress.id;
  //   }

  //   // console.log(order);

  //   // Ambil semua produk dalam sekali query untuk menghindari banyak request ke database
  //   const productIds = request.items.map((item) => item.productId);
  //   const products = await this.productRepository.find({
  //     where: productIds.map((id) => ({ id })),
  //     relations: ["store"],
  //   });

  //   if (products.length !== productIds.length) {
  //     throw new Error("Some products were not found");
  //   }

  //   // Validasi semua produk berasal dari store yang sama
  //   const store = products[0].store;
  //   if (!products.every((product) => product.store.id === store.id)) {
  //     throw new Error("All products must be from the same store");
  //   }

  //   // Buat orderItems
  //   const orderItems = request.items.map((item) => {
  //     const product = products.find((p) => p.id === item.productId);
  //     return this.orderItemRepository.create({
  //       order,
  //       product,
  //       quantity: item.quantity,
  //     });
  //   });

  //   await this.orderItemRepository.save(orderItems);

  //   // Hitung total harga
  //   const totalPoint = orderItems.reduce(
  //     (sum, item) => sum + item.product.point * item.quantity,
  //     0
  //   );

  //   // Update order dengan store, orderItems, dan total harga
  //   order.store = store;
  //   order.orderItems = orderItems;
  //   order.taken_method = request.taken_method;
  //   order.total = totalPoint;

  //   return this.orderRepository.save(order);
  // }
}
