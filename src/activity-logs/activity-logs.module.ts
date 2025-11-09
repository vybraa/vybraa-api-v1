import { Module } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService, PrismaService, JwtService],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}














