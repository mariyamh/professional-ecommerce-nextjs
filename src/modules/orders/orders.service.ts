import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { OrderStatus } from '../../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = await this.productsService.findById(item.productId);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}`,
        );
      }
    }

    // Create order
    const order = this.ordersRepository.create({
      userId,
      products: cart.items,
      totalPrice: cart.totalPrice,
      status: OrderStatus.PENDING,
      shippingAddress: createOrderDto.shippingAddress,
      phoneNumber: createOrderDto.phoneNumber,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Update product stock
    for (const item of cart.items) {
      await this.productsService.updateStock(item.productId, item.quantity);
    }

    // Clear cart
    await this.cartService.clearCart(userId);

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findById(id);
    order.status = updateOrderStatusDto.status;
    return await this.ordersRepository.save(order);
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.findById(id);

    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending orders');
    }

    order.status = OrderStatus.CANCELLED;
    return await this.ordersRepository.save(order);
  }
}
