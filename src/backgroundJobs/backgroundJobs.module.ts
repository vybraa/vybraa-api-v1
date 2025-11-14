import { Module } from '@nestjs/common';
import { BackgroundJobsService } from './backgroundjobs.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { VybraaConfigService } from 'src/common/services/vybraa-config.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentModule } from 'src/payment/payment.module';
@Module({
  imports: [
    PrismaModule,
    PaymentModule,
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [BackgroundJobsService, VybraaConfigService],
  exports: [BackgroundJobsService],
})
export class BackgroundJobsModule {}
