import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_stripe_payment_intent_id' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}
