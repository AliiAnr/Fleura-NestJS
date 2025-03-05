import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Product } from "src/product/entity/product.entity";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItem } from "../entity/order-item.entity";
import { Repository } from "typeorm";
import { Order } from "../entity/order.entity";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "../entity/payment.entity";
import * as crypto from "crypto";

@Injectable()
export class PaymentService {
  private readonly midtransBaseUrl = process.env.MITRANS_BASE_URL;
  private readonly serverKey = process.env.MITRANS_SERVER_KEY; // Ganti dengan server key dari Midtrans

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Buyer) private readonly buyerRepository: Repository<Buyer>
  ) {}

  async createQrisTransaction(orderId: string) {
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (existingPayment) {
      throw new HttpException(
        { message: "Payment already exists", payment: existingPayment },
        HttpStatus.CONFLICT
      );
    }
    // console.log(this.midtransBaseUrl)
    const midtransQRISBaseURL = `${this.midtransBaseUrl}v2/charge`;
    const shippingFee = 20000;
    // Dapatkan informasi order
    // console.log(midtransQRISBaseURL);
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["buyer", "orderItems", "orderItems.product"],
    });

    // console.log('Order: ', order);

    if (!order) {
      throw new InternalServerErrorException("Order not found");
    }

    const buyer = order.buyer;
    // console.log('Buyer: ', buyer);
    const items = order.orderItems.map((orderItem) => ({
      id: orderItem.product.id,
      price: orderItem.product.price,
      quantity: orderItem.quantity,
      name: orderItem.product.name,
    }));

    // Tambahkan biaya pengiriman sebagai item baru jika metode pengambilan adalah delivery
    if (order.taken_method === "delivery") {
      items.push({
        id: "shipping_fee",
        price: shippingFee,
        quantity: 1,
        name: "Shipping Fee",
      });
    }
    // console.log('Items: ', order.orderItems);

    // Hitung total gross_amount dari harga item
    // const grossAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const payload: any = {
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: order.total,
      },
      item_details: items,
      customer_details: {
        first_name: buyer.name,
        email: buyer.email,
        // ,
        phone: buyer.phone || "",
      },
    };

    // console.log("Payload: ", payload);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(this.serverKey + ":").toString("base64")}`,
    };

    // console.log('Headers: ', headers);

    try {
      const response = await firstValueFrom(
        this.httpService.post(midtransQRISBaseURL, payload, { headers })
      );
      // console.log('Response: ', response);

      const result = {
        qris: response.data.actions[0].url,
        expiry_time: response.data.expiry_time,
        total: order.total,
        status: response.data.transaction_status,
      };
      // console.log("Result: ", result);

      const payment = this.paymentRepository.create({
        methode: PaymentMethod.QRIS,
        orderId: orderId,
      });

      await this.paymentRepository.save(payment);

      // console.log(result)

      return result;
    } catch (error) {
      // console.error('Error: ', error);
      throw error.response?.data || error.message;
    }
  }

  // async createCashTransaction(orderId: string) {

  async processNotification(data: any) {
    // console.log(data);
    const {
      order_id,
      transaction_status,
      signature_key,
      gross_amount,
      status_code,
    } = data;

    // 🔹 1. Validasi Signature Key Midtrans
    const generatedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + this.serverKey)
      .digest("hex");

    if (generatedSignature !== signature_key) {
      throw new Error("Invalid signature key");
    }

    // 🔹 2. Cek status transaksi dan update database
    let status: PaymentStatus = PaymentStatus.UNPAID;

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      status = PaymentStatus.PAID;
    } else if (transaction_status === "pending") {
      status = PaymentStatus.UNPAID;
    } else if (
      transaction_status === "expire" ||
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      status = PaymentStatus.EXPIRE;
    }

    // 🔹 3. Update status di database
    const payment = await this.paymentRepository.findOne({
      where: { orderId: order_id },
    });

    if (payment) {
      payment.status = status;
      await this.paymentRepository.save(payment);
    } else {
      // Jika order belum ada di database, buat baru
      const newPayment = this.paymentRepository.create({
        orderId: order_id,
        // amount: gross_amount,
        status,
      });
      await this.paymentRepository.save(newPayment);
    }

    return { message: `Payment status updated to ${status}` };
  }

  async createCashTransaction(orderId: string) {
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (existingPayment) {
      throw new HttpException(
        { message: "Payment already exists", payment: existingPayment },
        HttpStatus.CONFLICT
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["buyer", "orderItems", "orderItems.product"],
    });

    // console.log('Order: ', order);

    if (!order) {
      throw new InternalServerErrorException("Order not found");
    }

    const payment = this.paymentRepository.create({
      methode: PaymentMethod.CASH,
      orderId: orderId,
    });

    await this.paymentRepository.save(payment);

    return { message: "Cash transaction created successfully" };
  }

  async createPointTransaction(orderId: string) {
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (existingPayment) {
      throw new HttpException(
        { message: "Payment already exists", payment: existingPayment },
        HttpStatus.CONFLICT
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["buyer", "orderItems", "orderItems.product"],
    });

    if (!order) {
      throw new InternalServerErrorException("Order not found");
    }

    const buyer = order.buyer;
    const totalPoint = order.point;
    const buyerPoint = buyer.point;

    if (buyerPoint < totalPoint) {
      throw new HttpException(
        { message: "Insufficient point", point: buyerPoint },
        HttpStatus.BAD_REQUEST
      );
    }

    const newPoint = buyerPoint - totalPoint;
    buyer.point = newPoint;
    await this.buyerRepository.save(buyer);

    const payment = this.paymentRepository.create({
      status: PaymentStatus.PAID,
      methode: PaymentMethod.POINT,
      orderId: orderId,
    });

    await this.paymentRepository.save(payment);

    return { message: "Point transaction created successfully" };
  }


  async updatePaymentStatus(orderId: string, status: PaymentStatus) {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      throw new HttpException(
        { message: "Payment not found", orderId },
        HttpStatus.NOT_FOUND
      );
    }

    payment.status = status;
    await this.paymentRepository.save(payment);

    return { message: `Payment status updated to ${status}` };
  }
}
