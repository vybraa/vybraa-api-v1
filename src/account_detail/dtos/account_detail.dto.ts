import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AccountDetailDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @IsOptional()
  routingNumber: string;

  @IsString()
  @IsOptional()
  accountName: string;
}

export class UpdateAccountDetailDto extends PartialType(AccountDetailDto) {}
