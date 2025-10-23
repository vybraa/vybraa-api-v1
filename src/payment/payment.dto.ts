import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  @IsString()
  recipient?: string;
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
