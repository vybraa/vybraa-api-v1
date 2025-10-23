import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import {
  AccountDetailDto,
  UpdateAccountDetailDto,
} from './dtos/account_detail.dto';
import axios from 'axios';
import configuration from 'src/config/configuration';

@Injectable()
export class AccountDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccountDetails(accountDetail: AccountDetailDto, user: User) {
    return this.prisma.userAccountDetails.create({
      data: { ...accountDetail, userId: user.id },
    });
  }

  async getAccountDetails(user: User) {
    return this.prisma.userAccountDetails.findMany({
      where: { userId: user.id },
    });
  }

  async getAccountDetailsById(id: string, user: User) {
    return this.prisma.userAccountDetails.findUnique({
      where: { id, userId: user.id },
    });
  }

  async updateAccountDetails(
    id: string,
    accountDetail: UpdateAccountDetailDto,
    user: User,
  ) {
    return this.prisma.userAccountDetails.update({
      where: { id, userId: user.id },
      data: accountDetail,
    });
  }

  async getBankList() {
    console.log('getting bank list');
    try {
      const flutterWaveKey = await this.prisma.flutterWaveKey.findFirst({
        where: {
          isActive: true,
        },
      });
      const response = await axios.get(
        'https://api.flutterwave.cloud/developersandbox/banks?country=NG',
        {
          headers: {
            Authorization: `Bearer ${flutterWaveKey.access_token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log('error getting bank list', error);
      throw new InternalServerErrorException('Error getting bank list');
    }
  }

  async bankLookup(bankCode: string, accountNumber: string) {
    try {
      if (configuration().paymentChannel === 'flutterwave') {
        const flutterWaveKey = await this.prisma.flutterWaveKey.findFirst({
          where: {
            isActive: true,
          },
        });
        const response = await axios.post(
          `https://api.flutterwave.cloud/developersandbox/banks/account-resolve`,
          {
            currency: 'NGN',
            account: {
              number: accountNumber,
              code: bankCode,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${flutterWaveKey.access_token}`,
            },
          },
        );
        return response.data;
      }
      if (configuration().paymentChannel === 'paystack') {
        return {};
      }
    } catch (error) {
      console.log('error bank lookup', error.response.data);
      throw new InternalServerErrorException(error.response.data);
    }
  }
}
