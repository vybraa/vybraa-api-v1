import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestLimitService } from '../request-limit/request-limit.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, RequestLimitService],
  exports: [PaymentService],
})
export class PaymentModule {}
