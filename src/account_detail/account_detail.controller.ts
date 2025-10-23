import { User } from '@prisma/client';
import { AccountDetailService } from './account_detail.service';
import { UserDecorator } from 'src/decorators/user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountDetailDto } from './dtos/account_detail.dto';
import { UpdateAccountDetailDto } from './dtos/account_detail.dto';
import { AuthGuard } from 'src/guards';

@Controller('account-detail')
@UseGuards(AuthGuard)
export class AccountDetailController {
  constructor(private readonly accountDetailService: AccountDetailService) {}

  @Get()
  async getAccountDetails(@UserDecorator() user: User) {
    return this.accountDetailService.getAccountDetails(user);
  }

  @Post()
  async createAccountDetails(
    @Body() accountDetail: AccountDetailDto,
    @UserDecorator() user: User,
  ) {
    return this.accountDetailService.createAccountDetails(accountDetail, user);
  }

  @Put(':id')
  async updateAccountDetails(
    @Param('id') id: string,
    @Body() accountDetail: UpdateAccountDetailDto,
    @UserDecorator() user: User,
  ) {
    return this.accountDetailService.updateAccountDetails(
      id,
      accountDetail,
      user,
    );
  }

  @Get('bank-list')
  async getBankList() {
    return await this.accountDetailService.getBankList();
  }

  @Post('bank-lookup')
  async bankLookup(
    @Body()
    { bankCode, accountNumber }: { bankCode: string; accountNumber: string },
  ) {
    return await this.accountDetailService.bankLookup(bankCode, accountNumber);
  }
}
