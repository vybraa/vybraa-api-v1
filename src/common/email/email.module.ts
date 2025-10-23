import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailListener } from './email.listener';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [EmailService, EmailListener],
  exports: [EmailService, EmailListener],
})
export class EmailModule {}
