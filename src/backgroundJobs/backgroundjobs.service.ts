import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import configuration from 'src/config/configuration';
import {
  TransactionStatus,
  EscrowStatus,
  RequestStatus,
  Requests,
  WalletEarningsHistoryStatus,
} from '@prisma/client';
import { VybraaConfigService } from 'src/common/services/vybraa-config.service';
import { TemplateConfigEnum } from 'src/utils/enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BackgroundJobsService {
  private readonly logger = new Logger(BackgroundJobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly vybraaConfigService: VybraaConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // create wallet for user without wallet
  // @Cron(CronExpression.EVERY_DAY_AT_10AM)
  // async createWalletForUserWithoutWallet() {
  //   const users = await this.prisma.user.findMany({
  //     where: {
  //       wallet: null,
  //       isVerified: true,
  //     },
  //   });

  //   for await (const user of users) {
  //     console.log('Creating wallet for user', user.id);
  //     const currency = await this.prisma.currency.findFirst({
  //       where: {
  //         code: 'USD',
  //       },
  //     });
  //     if (currency) {
  //       console.log('Currency found', currency.id);
  //       await this.prisma.wallet.create({
  //         data: {
  //           userId: user.id,
  //           walletBalance: 0,
  //           currencyId: currency.id,
  //           isActive: true,
  //           isFreezed: false,
  //           createdAt: new Date(),
  //           updatedAt: new Date(),
  //         },
  //       });
  //     }
  //   }
  // }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateFlutterWaveKey() {
    try {
      console.log('Updating flutterwave key');
      const flutterWaveKey = await this.prisma.flutterWaveKey.findFirst({
        where: {
          isActive: true,
          updatedAt: {
            lt: new Date(Date.now() - 1000 * 60 * 7), // updated within last 7 mins
          },
        },
      });

      console.log('Flutterwave key found', flutterWaveKey);

      if (flutterWaveKey) {
        // Build payload

        // Make request
        const response = await axios.post(
          'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',
          new URLSearchParams({
            client_id: flutterWaveKey.client_id,
            client_secret: flutterWaveKey.client_secret,
            grant_type: 'client_credentials',
          }).toString(), // ✅ this is the body
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        await this.prisma.flutterWaveKey.update({
          where: { id: flutterWaveKey.id },
          data: {
            access_token: response.data.access_token,
          },
        });

        console.log('Token response:', response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Check for pending payments every hour
  @Cron(CronExpression.EVERY_HOUR)
  async checkPendingPayments() {
    this.logger.log('Starting pending payments check...');

    try {
      // Find transactions that are in escrow and pending for more than 24 hours
      const pendingTransactions = await this.prisma.transaction.findMany({
        where: {
          isInEscrow: true,
          escrowStatus: EscrowStatus.PENDING,
          status: TransactionStatus.PENDING,
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          },
        },
        include: {
          request: {
            include: {
              user: true,
              celebrityProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
          user: true,
        },
      });

      this.logger.log(
        `Found ${pendingTransactions.length} pending transactions to process`,
      );

      for (const transaction of pendingTransactions) {
        await this.processPendingTransaction(transaction);
      }

      // Check for requests that have been pending for too long without payment
      await this.checkPendingRequests();

      this.logger.log('Pending payments check completed');
    } catch (error) {
      this.logger.error('Error in pending payments check:', error);
    }
  }

  private async processPendingTransaction(transaction: any) {
    try {
      this.logger.log(`Processing pending transaction ${transaction.id}`);

      // If transaction has a reference, try to verify with Paystack
      if (transaction.reference) {
        const paymentStatus = await this.verifyPaymentWithPaystack(
          transaction.reference,
        );

        if (paymentStatus) {
          if (paymentStatus.status === 'success') {
            // Payment was successful, update transaction and request
            await this.handleSuccessfulPayment(transaction, paymentStatus);
          } else {
            // Payment failed, update transaction and request
            await this.handleFailedPayment(transaction, paymentStatus);
          }
        } else {
          // Could not verify payment, mark as failed after timeout
          await this.handlePaymentTimeout(transaction);
        }
      } else {
        // No reference, mark as failed
        await this.handlePaymentTimeout(transaction);
      }
    } catch (error) {
      this.logger.error(
        `Error processing transaction ${transaction.id}:`,
        error,
      );
    }
  }

  private async verifyPaymentWithPaystack(reference: string) {
    try {
      const response = await axios.get(
        `${configuration().paystack.paystackUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${configuration().paystack.secretKey}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Error verifying payment ${reference}:`, error);
      return null;
    }
  }

  private async handleSuccessfulPayment(transaction: any, paymentData: any) {
    this.logger.log(
      `Handling successful payment for transaction ${transaction.id}`,
    );

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.COMPLETED,
        escrowStatus: EscrowStatus.PENDING, // Keep in escrow until request completion
        metadata: {
          ...transaction.metadata,
          paystackData: paymentData,
          verifiedAt: new Date().toISOString(),
        },
      },
    });

    // Update request status to IN_PROGRESS
    if (transaction.request) {
      await this.prisma.requests.update({
        where: { id: transaction.request.id },
        data: {
          isRequestPaid: true,
        },
      });

      this.logger.log(
        `Request ${transaction.request.id} marked as paid and in progress`,
      );

      // Send email to celebrity that their request has been paid and is in progress
      this.eventEmitter.emit('email.notification', {
        toName: transaction.request.celebrityProfile.displayName,
        toEmail: transaction.request.celebrityProfile.user.email,
        templateId: TemplateConfigEnum.Celebrity_Request_Notification,
        params: {
          celebrityName: transaction.request.celebrityProfile.displayName,
          fromName:
            transaction.request.fromName ?? transaction.request.user.firstName,
          forName: transaction.request.forName ?? 'N/A',
          occasion: transaction.request.occasion,
          currency: 'USD',
          price: transaction.request.price.toString(),
          instruction: transaction.request.instructions,
        },
      });
    }
  }

  private async handleFailedPayment(transaction: any, paymentData: any) {
    this.logger.log(
      `Handling failed payment for transaction ${transaction.id}`,
    );

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.FAILED,
        escrowStatus: EscrowStatus.REFUNDED,
        metadata: {
          ...transaction.metadata,
          paystackData: paymentData,
          failureReason:
            paymentData.gateway_response || 'Payment verification failed',
          verifiedAt: new Date().toISOString(),
        },
      },
    });

    // Update request status to DECLINED
    // if (transaction.request) {
    //   await this.prisma.requests.update({
    //     where: { id: transaction.request.id },
    //     data: {
    //       status: RequestStatus.DECLINED,
    //     },
    //   });

    //   this.logger.log(
    //     `Request ${transaction.request.id} marked as declined due to payment failure`,
    //   );
    // }
  }

  private async handlePaymentTimeout(transaction: any) {
    this.logger.log(
      `Handling payment timeout for transaction ${transaction.id}`,
    );

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.FAILED,
        escrowStatus: EscrowStatus.REFUNDED,
        metadata: {
          ...transaction.metadata,
          failureReason: 'Payment timeout - no response from payment provider',
          timeoutAt: new Date().toISOString(),
        },
      },
    });

    // Update request status to DECLINED
    if (transaction.request) {
      await this.prisma.requests.update({
        where: { id: transaction.request.id },
        data: {
          status: RequestStatus.DECLINED,
        },
      });

      this.logger.log(
        `Request ${transaction.request.id} marked as declined due to payment timeout`,
      );
    }
  }

  private async checkPendingRequests() {
    try {
      // Find requests that have been pending for more than 48 hours without payment
      const pendingRequests = await this.prisma.requests.findMany({
        where: {
          status: RequestStatus.PENDING,
          isRequestPaid: false,
          createdAt: {
            lt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
          },
        },
        include: {
          transaction: {
            where: {
              isInEscrow: true,
              escrowStatus: EscrowStatus.PENDING,
            },
          },
        },
      });

      this.logger.log(
        `Found ${pendingRequests.length} pending requests without payment`,
      );

      for (const request of pendingRequests) {
        // If no transaction exists, create a failed transaction record
        if (!request.transaction || request.transaction.length === 0) {
          await this.prisma.transaction.create({
            data: {
              userId: request.userId,
              requestId: request.id,
              amount: request.price,
              currency: 'NGN',
              paymentMethod: 'timeout',
              reference: `timeout_${request.id}_${Date.now()}`,
              type: 'CREDIT',
              status: TransactionStatus.FAILED,
              isInEscrow: false,
              escrowType: null,
              escrowStatus: null,
              description: 'Request timeout - no payment initiated',
              metadata: {
                timeoutReason: 'No payment initiated within 48 hours',
                timeoutAt: new Date().toISOString(),
              },
            },
          });

          // Update request status
          await this.prisma.requests.update({
            where: { id: request.id },
            data: {
              status: RequestStatus.DECLINED,
            },
          });

          this.logger.log(
            `Request ${request.id} marked as declined due to no payment initiation`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error checking pending requests:', error);
    }
  }

  // Release escrow payments for completed requests
  @Cron(CronExpression.EVERY_MINUTE)
  async releaseEscrowPayments() {
    this.logger.log('Starting escrow release check...');

    try {
      // Find completed requests with pending escrow payments
      const completedRequests = await this.prisma.requests.findMany({
        where: {
          status: RequestStatus.COMPLETED,
          transaction: {
            every: {
              isInEscrow: true,
              escrowStatus: EscrowStatus.PENDING,
            },
          },
        },
        include: {
          transaction: true,
          celebrityProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log('Completed requests', completedRequests);

      this.logger.log(
        `Found ${completedRequests.length} completed requests with pending escrow`,
      );

      for (const request of completedRequests) {
        await this.releaseEscrowForRequest(request);
      }

      this.logger.log('Escrow release check completed');
    } catch (error) {
      this.logger.error('Error in escrow release check:', error);
    }
  }

  private async releaseEscrowForRequest(request: Requests) {
    try {
      this.logger.log(`Releasing escrow for request ${request.id}`);

      await this.prisma.$transaction(async (prisma) => {
        const transaction = await prisma.transaction.findFirst({
          where: {
            reference: request.paymentReference,
          },
        });

        if (!transaction) {
          throw new Error(`Transaction not found for request ${request.id}`);
        }

        // Update transaction to release escrow
        await prisma.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            escrowStatus: EscrowStatus.RELEASED,
            releaseDate: new Date(),
            metadata: {
              releasedAt: new Date().toISOString(),
              releaseReason: 'Request completed successfully',
            },
          },
        });

        let celebrityBalance: number;
        let vybraaRequestFeeCharge: number;

        try {
          const baseCurrencyAmount =
            await this.vybraaConfigService.convertToBaseCurrency(
              Number(transaction.amount),
              transaction.currency,
            );
          const result = await this.vybraaConfigService.evaluateRequestPrice(
            Number(baseCurrencyAmount),
          );
          celebrityBalance = result.celebrityBalance;
          vybraaRequestFeeCharge = result.vybraaRequestFeeCharge;
        } catch (error) {
          this.logger.warn(
            `Failed to get vybraa config for request ${request.id}, using default 10% fee:`,
            error.message,
          );
          // Fallback to default 10% fee
          const defaultFeePercentage = 10;
          vybraaRequestFeeCharge =
            Number(request.price) * (defaultFeePercentage / 100);
          celebrityBalance = Number(request.price) - vybraaRequestFeeCharge;
        }

        const celebrityProfile = await prisma.celebrityProfile.findFirst({
          where: {
            id: request.celebrityProfileId,
          },
          include: {
            user: true,
          },
        });

        if (!celebrityProfile) {
          throw new Error(
            `Celebrity profile not found for request ${request.id}`,
          );
        }

        // Transfer funds to celebrity's wallet
        const celebrityWallet = await prisma.wallet.findFirst({
          where: {
            userId: celebrityProfile.userId,
          },
        });

        if (celebrityWallet) {
          const totalAmount = celebrityBalance;

          await prisma.wallet.update({
            where: { id: celebrityWallet.id },
            data: {
              walletBalance: {
                increment: celebrityBalance,
              },
            },
          });

          this.logger.log(
            `Released ${totalAmount} to celebrity wallet ${celebrityWallet.id}`,
          );
        } else {
          throw new Error(
            `Celebrity wallet not found for user ${celebrityProfile.userId}`,
          );
        }

        //find super admin wallet
        const superAdminWallet = await prisma.wallet.findFirst({
          where: {
            isSuperAdmin: true,
          },
        });

        if (superAdminWallet) {
          await prisma.wallet.update({
            where: { id: superAdminWallet.id },
            data: {
              walletBalance: { increment: vybraaRequestFeeCharge },
            },
          });
        } else {
          throw new Error(`Super admin wallet not found`);
        }

        //create wallet earnings history
        await prisma.walletEarningsHistory.create({
          data: {
            walletId: celebrityWallet.id,
            requestId: request.id,
            amount: celebrityBalance,
            currency: configuration().baseCurrency,
            vybraaFee: vybraaRequestFeeCharge,
            status: WalletEarningsHistoryStatus.CREDIT,
          },
        });

        this.logger.log(`Escrow released for request ${request.id}`);
      });
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Error releasing escrow for request ${request.id}:`,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkForUnpaidRequests() {
    const unpaidRequests = await this.prisma.requests.findMany({
      where: {
        status: RequestStatus.PENDING,
        isRequestPaid: false,
        createdAt: {
          lt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        },
      },
    });

    for (const request of unpaidRequests) {
      this.logger.log(`Deleting unpaid request ${request.id}`);
      //soft delete request
      await this.prisma.requests.update({
        where: { id: request.id },
        data: {
          deletedAt: new Date(),
        },
      });
    }
  }
}
