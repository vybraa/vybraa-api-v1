import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestService } from './request.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { PaymentService } from 'src/payment/payment.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [RequestController],
  providers: [RequestService, PrismaService, JwtService, PaymentService],
  exports: [RequestService],
})
export class RequestsModule {}
