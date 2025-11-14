import { Module } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService, JwtService],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
