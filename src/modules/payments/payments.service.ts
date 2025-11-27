import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment } from './entities/payment.entity';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { PaymentStatus, OrderStatus } from '../../common/enums';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy',
      {
        apiVersion: '2024-11-20.acacia' as any,
      },
    );
  }

  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<any> {
    const order = await this.ordersService.findById(
      createPaymentIntentDto.orderId,
    );

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(createPaymentIntentDto.amount * 100),
      currency: 'usd',
      metadata: {
        orderId: order.id,
      },
    });

    const payment = this.paymentsRepository.create({
      orderId: order.id,
      amount: createPaymentIntentDto.amount,
      status: PaymentStatus.PENDING,
      transactionId: paymentIntent.id,
      paymentMethod: 'stripe',
      metadata: {
        clientSecret: paymentIntent.client_secret,
      },
    });

    await this.paymentsRepository.save(payment);

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: createPaymentIntentDto.amount,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
    );

    if (paymentIntent.status === 'succeeded') {
      payment.status = PaymentStatus.SUCCESS;
      await this.ordersService.updateStatus(payment.orderId, {
        status: OrderStatus.PROCESSING,
      });
    } else {
      payment.status = PaymentStatus.FAILED;
    }

    return await this.paymentsRepository.save(payment);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return await this.paymentsRepository.findOne({
      where: { orderId },
      relations: ['order'],
    });
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async handleWebhook(signature: string, payload: any): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.confirmPayment(paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        const payment = await this.paymentsRepository.findOne({
          where: { transactionId: failedPayment.id },
        });
        if (payment) {
          payment.status = PaymentStatus.FAILED;
          await this.paymentsRepository.save(payment);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
