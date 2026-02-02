import { Module } from '@nestjs/common';
import { ExchangeRateController } from './exchange_rate.controller';
import { ExchangeRateService } from './exchange_rate.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, JwtService],
})
export class ExchangeRateModule {}
