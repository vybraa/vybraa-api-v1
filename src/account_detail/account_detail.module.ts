import { Module } from '@nestjs/common';
import { AccountDetailService } from './account_detail.service';
import { AccountDetailController } from './account_detail.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [AccountDetailController],
  providers: [AccountDetailService, PrismaService, JwtService],
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
})
export class AccountDetailModule {}
