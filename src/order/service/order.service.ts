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
import { Not, Repository } from "typeorm";
import { Order, OrderStatus } from "../entity/order.entity";
import { OrderItem } from "../entity/order-item.entity";
import { CreateOrderDto } from "../dto/create-order.dto";
import { BuyerAddress } from "src/buyer/entity/buyer.address.entity";
import { Payment, PaymentMethod } from "../entity/payment.entity";
import { PaymentService } from "./payment.service";
import { FCMService } from "src/notification/service/fcm.service";
import { title } from "process";
import { OrderGateway } from "../gateway/order.gateway";

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
    private paymentService: PaymentService,
    private notificationService: FCMService,
    private readonly orderGateway: OrderGateway
  ) {}

  async createOrder(buyerId: string, request: CreateOrderDto) {
    const shippingFee = 15000;

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

    // if (request.taken_method === "delivery") {
    const userAddress = await this.buyerAddressRepository.findOne({
      where: { id: request.addressId, buyer: { id: buyerId } },
    });
    if (!userAddress) {
      throw new NotFoundException("Address not found");
    }
    // order.address = userAddress;
    order.addressId = userAddress.id;
    // }

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

    if (request.note) {
      order.note = request.note;
    }
    if (request.taken_date) {
      order.taken_date = new Date(request.taken_date);
    }

    // Simpan order
    await this.orderRepository.save(order);

    // Panggil fungsi pembayaran berdasarkan metode pembayaran
    let paymentResult: any;
    switch (request.payment_method) {
      case PaymentMethod.QRIS:
        paymentResult = await this.paymentService.createQrisTransaction(
          order.id
        );
        break;
      // return this.paymentService.createQrisTransaction(order.id);
      case PaymentMethod.CASH:
        paymentResult = await this.paymentService.createCashTransaction(
          order.id
        );
        break;
      // return this.paymentService.createCashTransaction(order.id);
      case PaymentMethod.POINT:
        paymentResult = await this.paymentService.createPointTransaction(
          order.id
        );
        break;
      // return this.paymentService.createPointTransaction(order.id);
      default:
        throw new HttpException(
          { message: "Invalid payment method" },
          HttpStatus.BAD_REQUEST
        );
    }
    // Ambil data payment setelah transaksi berhasil
    const payment = await this.paymentRepository.findOne({
      where: { orderId: order.id },
    });

    this.notificationService.sendNotificationByBuyerId(
      "Pesanan Berhasil Dibuat",
      `Pesanan Anda telah berhasil dibuat. Silakan cek detail pesanan Anda.`,
      buyerId
    );

    this.notificationService.sendNotificationBySellerId(
      "Pesanan Baru",
      `Pesanan baru telah dibuat oleh ${buyer.name}. Silakan cek detail pesanan.`,
      store.id
    );

    // this.orderGateway.sendOrderStatusUpdate(order.buyer.id, {
    //   orderId: order.id,
    //   newStatus: order.status,
    // });

    return payment;
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

  async getAllUnCompletedOrder() {
    // Ambil semua order yang status-nya BUKAN COMPLETED
    return this.orderRepository.find({
      where: {
        status: Not(OrderStatus.COMPLETED),
      },
      relations: [
        "buyer",
        "store",
        "orderItems",
        "orderItems.product",
        "orderItems.product.store",
        "orderItems.product.category",
        "orderItems.product.picture",
        "payment",
      ],
      order: { created_at: "DESC" },
    });
  }

  async getAllCompletedOrder() {
    // Ambil semua order yang status-nya COMPLETED
    return this.orderRepository.find({
      where: {
        status: OrderStatus.COMPLETED,
      },
      relations: [
        "buyer",
        "store",
        "orderItems",
        "orderItems.product",
        "orderItems.product.store",
        "orderItems.product.category",
        "orderItems.product.picture",
        "payment",
      ],
      order: { created_at: "DESC" },
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

    if (status === OrderStatus.DELIVERY) {
      this.notificationService.sendNotificationByBuyerId(
        "Pesanan Sedang Dikirim",
        `Pesanan Anda sedang dalam proses pengiriman`,
        order.buyer.id
      );
    } else if (status === OrderStatus.PICKUP) {
      this.notificationService.sendNotificationByBuyerId(
        "Pesanan Siap Diambil",
        `Pesanan Anda sudah siap untuk diambil di toko`,
        order.buyer.id
      );
    } else if (status === OrderStatus.COMPLETED) {
      this.notificationService.sendNotificationByBuyerId(
        "Pesanan Selesai",
        `Pesanan Anda telah selesai. Terima kasih telah berbelanja!`,
        order.buyer.id
      );
    } else if (status === OrderStatus.PROCESS) {
      this.notificationService.sendNotificationByBuyerId(
        "Pesanan Sedang Diproses",
        `Pesanan Anda sedang dalam proses. Silakan tunggu sebentar.`,
        order.buyer.id
      );
    }

    this.orderGateway.sendOrderStatusUpdate(order.buyer.id, {
      orderId,
      newStatus: status,
    });
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
