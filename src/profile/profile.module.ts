import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { JwtService } from '@nestjs/jwt';
import { RequestsModule } from 'src/request/request.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [RequestsModule, PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService, JwtService],
})
export class ProfileModule {}
