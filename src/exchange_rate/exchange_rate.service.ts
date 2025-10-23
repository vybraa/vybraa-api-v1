import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateExchangeRateDto,
  UpdateExchangeRateDto,
} from './dtos/exchange_rate.dto';

@Injectable()
export class ExchangeRateService {
  constructor(private readonly prisma: PrismaService) {}

  async createExchangeRate(createExchangeRateDto: CreateExchangeRateDto) {
    const exchangeRate = await this.prisma.exchangeRate.create({
      data: {
        ...createExchangeRateDto,
      },
    });

    return exchangeRate;
  }
  async getExchangeRate(fromCurrency: string, toCurrency: string) {
    const exchangeRate = await this.prisma.exchangeRate.findMany({
      where: {
        fromCurrency,
        toCurrency,
      },
      include: {
        currency: true,
      },
    });

    return exchangeRate;
  }

  async updateExchangeRate(
    id: string,
    updateExchangeRateDto: UpdateExchangeRateDto,
  ) {
    const exchangeRate = await this.prisma.exchangeRate.update({
      where: { id },
      data: {
        ...updateExchangeRateDto,
      },
    });

    return exchangeRate;
  }
}
