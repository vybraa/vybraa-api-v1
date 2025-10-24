import { AccountType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  reference: string;
}

export class CreateBankAccountDto {
  @IsNotEmpty()
  @IsString()
  bankCode: string;
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  accountName: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;
}

export class InitiateBankAccountTransferDto {
  @IsNotEmpty()
  @IsString()
  bankAccountId: string;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  description?: string;
}
