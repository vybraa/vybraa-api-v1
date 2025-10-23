import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CurrenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrencies() {
    return this.prisma.currency.findMany();
  }
}
