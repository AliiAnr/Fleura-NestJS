import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "src/product/entity/product.entity";

@Entity("order_item")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: "CASCADE" })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: "CASCADE",
  })
  product: Product;

  @Column()
  quantity: number;
}
