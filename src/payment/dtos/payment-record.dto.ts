import {
  TransactionStatus,
  TransactionType,
  VybraaCurrency,
} from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class CreatePaymentRecordDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsBoolean()
  isOtpSent?: boolean;

  @IsOptional()
  @IsString()
  transferCode?: string;
}

export class FinalizeTransferDto {
  @IsNotEmpty()
  @IsString()
  transferCode: string;

  @IsNotEmpty()
  @IsNumber()
  otp: number;
}

export class ResendOtpDto {
  @IsNotEmpty()
  @IsString()
  transferCode: string;
}
