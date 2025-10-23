import { Module } from '@nestjs/common';
import { ExchangeRateController } from './exchange_rate.controller';
import { ExchangeRateService } from './exchange_rate.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, PrismaService, JwtService],
})
export class ExchangeRateModule {}
