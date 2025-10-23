import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserListener } from './listeners/users.listener';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '../common/common.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    CommonModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuthController, OnboardingController],
  providers: [
    AuthService,
    OnboardingService,
    PrismaService,
    JwtService,
    UserListener,
  ],
})
export class AuthModule {}
