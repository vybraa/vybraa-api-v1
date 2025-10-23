import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration';
import { cloudinaryConfig } from './common/cloudinary/cloudinary.config';
import { AppThrottlerGuard } from './common/throttler/throttler.guard';
import { ExchangeRateModule } from './exchange_rate/exchange_rate.module';
import { AdminModule } from './admiin/admin.module';
import { BackgroundJobsModule } from './backgroundJobs/backgroundJobs.module';
import { RequestsModule } from './request/request.module';
import { ProfileModule } from './profile/profile.module';
import { FlutterKeyModule } from './flutter_key/flutter_key.module';
import { AccountDetailModule } from './account_detail/account_detail.module';
import { PaymentModule } from './payment/payment.module';
import { RequestLimitModule } from './request-limit/request-limit.module';
import { WalletModule } from './wallet/wallet.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AdminModule,
    ExchangeRateModule,
    BackgroundJobsModule,
    RequestsModule,
    ProfileModule,
    FlutterKeyModule,
    AccountDetailModule,
    PaymentModule,
    WalletModule,
    RequestLimitModule,
    ActivityLogsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    // Initialize Cloudinary configuration
    cloudinaryConfig();
  }
}
