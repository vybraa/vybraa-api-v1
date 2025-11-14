import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { JwtService } from '@nestjs/jwt';
import { UserListener } from './listeners/users.listener';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '../common/common.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    CommonModule,
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuthController, OnboardingController],
  providers: [
    AuthService,
    OnboardingService,
    JwtService,
    UserListener,
  ],
})
export class AuthModule {}
