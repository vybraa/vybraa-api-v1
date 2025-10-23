import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { VybraaConfigService } from 'src/common/services/vybraa-config.service';

@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [WalletService, PrismaService, JwtService, VybraaConfigService],
})
export class WalletModule {}
