import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EscrowStatus,
  RequestStatus,
  TransactionStatus,
  TransactionType,
  User,
} from '@prisma/client';
import { VybraaConfigService } from 'src/common/services/vybraa-config.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vybraaConfigService: VybraaConfigService,
  ) {}

  async getWalletOverview(user: User) {
    const walletData = await this.prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!walletData) throw new NotFoundException('Wallet not found');

    const celebrityProfile = await this.prisma.celebrityProfile.findUnique({
      where: { userId: user.id },
    });

    if (!celebrityProfile)
      throw new NotFoundException('Celebrity profile not found');

    const celebrityTransactions = await this.prisma.requests.findMany({
      where: {
        celebrityProfileId: celebrityProfile.id,
        status: RequestStatus.COMPLETED,
        isRequestPaid: true,
        transaction: {
          some: {
            status: TransactionStatus.COMPLETED,
            type: TransactionType.CREDIT,
            escrowStatus: EscrowStatus.RELEASED,
          },
        },
      },
      include: {
        transaction: true,
      },
    });

    const totalEarnings = celebrityTransactions.reduce((acc, transaction) => {
      return acc + Number(transaction.price);
    }, 0);

    const totalRequests = await this.prisma.requests.findMany({
      where: {
        celebrityProfileId: celebrityProfile.id,
        isRequestPaid: true,
      },
    });

    const totalRequestsDeclined = await this.prisma.requests.findMany({
      where: {
        celebrityProfileId: celebrityProfile.id,
        isRequestPaid: true,
        status: {
          in: [RequestStatus.DECLINED, RequestStatus.PENDING],
        },
      },
    });

    return {
      totalBalance: walletData.walletBalance.toString(),
      totalEarnings: totalEarnings.toString(),
      totalRequests: totalRequests.length,
      totalRequestsDeclined: totalRequestsDeclined.length,
    };
  }

  async getWalletTransactions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        celebrityProfile: true,
      },
    });

    const celebrityTransactions = await this.prisma.requests.findMany({
      where: {
        celebrityProfileId: user.celebrityProfile.id,
        transaction: {
          some: {
            status: TransactionStatus.COMPLETED,
            escrowStatus: EscrowStatus.RELEASED,
          },
        },
      },
      select: {
        id: true,
        occasion: true,
        forName: true,
        fromName: true,
        transaction: {
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return await Promise.all(
      celebrityTransactions.map(async (transaction) => {
        const transactionData = transaction.transaction[0];
        console.log('transactionData', transactionData);
        const convertedPriceToUsd =
          await this.vybraaConfigService.convertToBaseCurrency(
            Number(transactionData.amount),
            transactionData.currency,
          );

        const payloadTransactionData = {
          ...transactionData,
          amount: convertedPriceToUsd,
        };
        return {
          id: transaction.id,
          occasion: transaction.occasion,
          forName: transaction.forName,
          fromName: transaction.fromName,
          transaction: payloadTransactionData,
        };
      }),
    );
  }

  async getSingleTransaction(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId, userId },
      select: {
        id: true,
        type: true,
        amount: true,
        userId: true,
        status: true,
        createdAt: true,
        currency: true,
        request: {
          select: {
            id: true,
            occasion: true,
            forName: true,
            fromName: true,
          },
        },
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const walletEarningsHistory =
      await this.prisma.walletEarningsHistory.findFirst({
        where: {
          requestId: transaction.request.id,
        },
      });

    return {
      requestFrom: transaction.request.fromName || undefined,
      requestFor: transaction.request.forName || undefined,
      occasion: transaction.request.occasion || undefined,
      createdAt: transaction.createdAt,
      type: transaction.type,
      requestAmount: transaction.amount.toString(),
      requestCurrency: transaction.currency,
      requestStatus: transaction.status,
      walletEarningsHistory: walletEarningsHistory || null,
    };
  }
}
