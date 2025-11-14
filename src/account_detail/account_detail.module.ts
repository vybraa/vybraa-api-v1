import { Module } from '@nestjs/common';
import { AccountDetailService } from './account_detail.service';
import { AccountDetailController } from './account_detail.controller';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AccountDetailController],
  providers: [AccountDetailService, JwtService],
})
export class AccountDetailModule {}
