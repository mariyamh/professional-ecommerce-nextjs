import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { userId } });
    
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        items: [],
        totalPrice: 0,
      });
      await this.cartRepository.save(cart);
    }
    
    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const product = await this.productsService.findById(addToCartDto.productId);
    
    if (product.stock < addToCartDto.quantity) {
      throw new NotFoundException('Insufficient stock');
    }

    const cart = await this.getCart(userId);
    
    const existingItem = cart.items.find(
      (item) => item.productId === addToCartDto.productId,
    );

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: addToCartDto.quantity,
        image: product.images?.[0],
      });
    }

    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return await this.cartRepository.save(cart);
  }

  async updateCartItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return await this.cartRepository.save(cart);
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return await this.cartRepository.save(cart);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    cart.items = [];
    cart.totalPrice = 0;
    await this.cartRepository.save(cart);
  }
}
