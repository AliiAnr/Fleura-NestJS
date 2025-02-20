import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Product } from "src/product/entity/product.entity";
import { Buyer } from "src/buyer/entity/buyer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderItem } from "../entity/order-item.entity";
import { Repository } from "typeorm";
import { Order } from "../entity/order.entity";

@Injectable()
export class MidtransService {
  private readonly midtransBaseUrl = process.env.MITRANS_BASE_URL;
  private readonly serverKey = process.env.MITRANS_SERVER_KEY; // Ganti dengan server key dari Midtrans

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Buyer) private readonly buyerRepository: Repository<Buyer>
  ) {}

  async createQrisTransaction(orderId: string) {
    // console.log(this.midtransBaseUrl)
    const midtransQRISBaseURL = `${this.midtransBaseUrl}v2/charge`;
    // Dapatkan informasi order
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

    // console.log('Items: ', items);

    // Hitung total gross_amount dari harga item
    // const grossAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const payload = {
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: order.total,
      },
      item_details: items,
      customer_details: {
        first_name: buyer.name,
        email: buyer.email,
        phone: buyer.phone || "",
      },
    };
    // console.log('Payload: ', payload);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(this.serverKey + ":").toString("base64")}`,
    };

    // console.log('Headers: ', headers);

    try {
      const response = await firstValueFrom(
        this.httpService.post(midtransQRISBaseURL, payload, { headers })
      );
      // console.log('Response: ', response.data);
      const result = {
        qris: response.data.actions[0].url,
        expiry_time: response.data.expiry_time,
        total: order.total,
        status: response.data.transaction_status,
      };

      return result;
    } catch (error) {
      // console.error('Error: ', error);
      throw error.response?.data || error.message;
    }
  }
}
