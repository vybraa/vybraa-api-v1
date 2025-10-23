import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RequestsModule } from 'src/request/request.module';

@Module({
  imports: [RequestsModule],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, JwtService],
})
export class ProfileModule {}
