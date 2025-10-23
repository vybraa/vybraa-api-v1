import { Module } from '@nestjs/common';
import { RequestLimitController } from './request-limit.controller';
import { RequestLimitService } from './request-limit.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [RequestLimitController],
  providers: [RequestLimitService, JwtService],
  exports: [RequestLimitService],
})
export class RequestLimitModule {}
