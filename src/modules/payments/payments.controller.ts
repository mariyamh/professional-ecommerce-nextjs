import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto);
  }

  @Post('confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(confirmPaymentDto.paymentIntentId);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by order ID' })
  getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  getAllPayments() {
    return this.paymentsService.findAll();
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.paymentsService.handleWebhook(signature, req.rawBody);
    return { received: true };
  }
}
