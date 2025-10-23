import { Module } from '@nestjs/common';
import { BackgroundJobsService } from './backgroundjobs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { VybraaConfigService } from 'src/common/services/vybraa-config.service';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [BackgroundJobsService, PrismaService, VybraaConfigService],
  exports: [BackgroundJobsService],
})
export class BackgroundJobsModule {}
