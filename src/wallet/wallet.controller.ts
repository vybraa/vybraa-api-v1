import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from 'src/guards';
import { UserDecorator } from 'src/decorators';
import { User } from '@prisma/client';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('overview')
  async getWallet(@UserDecorator() user: User) {
    return this.walletService.getWalletOverview(user);
  }

  @Get('transactions')
  async getWalletTransactions(@UserDecorator() user: User) {
    return this.walletService.getWalletTransactions(user.id);
  }
}
