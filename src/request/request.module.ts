import { forwardRef, Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [CloudinaryModule, PrismaModule, forwardRef(() => PaymentModule)],
  controllers: [RequestController],
  providers: [RequestService, JwtService],
  exports: [RequestService],
})
export class RequestsModule {}
