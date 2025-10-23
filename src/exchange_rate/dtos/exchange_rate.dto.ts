import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExchangeRateDto {
  @IsNotEmpty()
  @IsString()
  fromCurrency: string;

  @IsNotEmpty()
  @IsString()
  rate: string;

  @IsNotEmpty()
  @IsString()
  toCurrency: string;
}

export class UpdateExchangeRateDto {
  @IsNotEmpty()
  @IsString()
  rate: string;
}
