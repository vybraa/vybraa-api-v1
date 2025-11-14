import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RequestLimitService } from '../request-limit/request-limit.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RequestsModule } from 'src/request/request.module';

@Module({
  imports: [JwtModule, PrismaModule, forwardRef(() => RequestsModule)],
  controllers: [PaymentController],
  providers: [PaymentService, RequestLimitService],
  exports: [PaymentService],
})
export class PaymentModule {}
