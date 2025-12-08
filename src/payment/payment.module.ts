import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RequestLimitService } from '../request-limit/request-limit.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RequestService } from 'src/request/request.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [JwtModule, PrismaModule, CloudinaryModule],
  controllers: [PaymentController],
  providers: [PaymentService, RequestLimitService, RequestService],
  exports: [PaymentService],
})
export class PaymentModule {}
