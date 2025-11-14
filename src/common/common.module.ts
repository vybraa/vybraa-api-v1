import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { AppThrottlerModule } from './throttler/throttler.module';
import { CountryCodeService } from './services/country-code.service';
import { CountryCodeController } from './controllers/country-code.controller';
import { CurrenciesService } from './services/currencies.service';
import { CurrenciesController } from './controllers/currencies-controller';
import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { VybraaConfigService } from './services/vybraa-config.service';
import { EmailModule } from './email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AppThrottlerModule, EmailModule, PrismaModule],
  providers: [
    CloudinaryService,
    CountryCodeService,
    CurrenciesService,
    CategoryService,
    VybraaConfigService,
  ],
  controllers: [
    CountryCodeController,
    CurrenciesController,
    CategoryController,
  ],
  exports: [
    CloudinaryService,
    AppThrottlerModule,
    CountryCodeService,
    CurrenciesService,
    CategoryService,
    VybraaConfigService,
    EmailModule,
  ],
})
export class CommonModule {}
