import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'order-uuid' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0.5)
  amount: number;
}
