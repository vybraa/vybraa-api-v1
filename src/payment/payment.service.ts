import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBankAccountDto,
  CreatePaymentDto,
  InitiateBankAccountTransferDto,
} from './payment.dto';
import { CreatePaymentRecordDto } from './dtos/payment-record.dto';
import axios from 'axios';
import configuration from 'src/config/configuration';
import { PaymentChannelEnum, TemplateConfigEnum } from 'src/utils/enum';
import * as crypto from 'crypto';
import {
  EscrowStatus,
  EscrowType,
  CelebrityProfile,
  Requests,
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
} from '@prisma/client';
import {
  AccountResolutionResponse,
  BankListType,
  FlutterwaveResponse,
  FlutterwaveTransaction,
  PaymentResponseType,
} from 'src/types/payment';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    paymentChannel: PaymentChannelEnum = PaymentChannelEnum.PAYSTACK,
  ) {
    try {
      if (paymentChannel === PaymentChannelEnum.PAYSTACK) {
        const response = await axios.post(
          `${configuration().paystack.paystackUrl}/transaction/initialize`,
          {
            amount: createPaymentDto.amount,
            email: createPaymentDto.email,
            callback_url: `${configuration().baseUrl}/requests/payment-callback`,
            metadata: {
              cancel_action:
                configuration().baseUrl + '/requests/payment-cancel',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${configuration().paystack.secretKey}`,
            },
          },
        );
        return await response.data;
      }
      if (paymentChannel === PaymentChannelEnum.FLUTTERWAVE) {
        const flutterWaveKey = await this.prisma.flutterWaveKey.findFirst({
          where: {
            isActive: true,
          },
        });
        try {
          const response = await axios.post(
            `${configuration().flutterwave.flutterwaveUrl}/transfers`,
            {
              amount: createPaymentDto.amount,
              email: createPaymentDto.email,
              callback_url: `${configuration().baseUrl}/requests/payment-callback`,
              metadata: {
                cancel_action:
                  configuration().baseUrl + '/requests/payment-cancel',
              },
            },
            {
              headers: {
                Authorization: `Bearer ${flutterWaveKey.access_token}`,
              },
            },
          );

          return await response.data;
        } catch (error) {
          console.log('error', error);
          throw new InternalServerErrorException(error.response.data);
        }
      }

      throw new BadRequestException('Payment channel not supported');
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(error);
    }
  }

  async validateWebhookSignature(
    payload: any,
    signature: string,
  ): Promise<boolean> {
    try {
      const secretKey = configuration().paystack.secretKey;
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  async findRequestByPaymentReference(paymentReference: string): Promise<
    Requests & {
      user: User;
      celebrityProfile: CelebrityProfile & { user: User };
    }
  > {
    return this.prisma.requests.findFirst({
      where: {
        paymentReference,
      },
      include: {
        user: true,
        celebrityProfile: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateRequestStatus(requestId: string, status: string) {
    return this.prisma.requests.update({
      where: { id: requestId },
      data: { status: status as any },
    });
  }

  async updateRequestIsPaidStatus(requestId: string) {
    //check if request is is already paid
    const request = await this.prisma.requests.findUnique({
      where: { id: requestId },
    });
    if (request.isRequestPaid) {
      return;
    }
    console.log('Updating request is paid status', requestId);
    return this.prisma.requests.update({
      where: { id: requestId },
      data: { isRequestPaid: true },
    });
  }

  async createPaymentRecord(paymentData: CreatePaymentRecordDto) {
    //check if payment record already exists
    const paymentRecord = await this.prisma.transaction.findFirst({
      where: { reference: paymentData.paymentReference },
    });
    if (paymentRecord) {
      return await this.prisma.transaction.update({
        where: { id: paymentRecord.id },
        data: {
          status: paymentData.status,
          metadata: paymentData.metadata,
        },
      });
    }
    return this.prisma.transaction.create({
      data: {
        request: {
          connect: {
            id: paymentData.requestId,
          },
        },
        user: {
          connect: {
            id: paymentData.userId,
          },
        },
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.paymentReference,
        isInEscrow: true,
        escrowType: EscrowType.REQUEST_PAYMENT,
        escrowStatus: EscrowStatus.PENDING,
        type: TransactionType.CREDIT,
        status: paymentData.status,
        metadata: paymentData.metadata,
      },
    });
  }

  async getPaymentRecordByReference(paymentReference: string) {
    return this.prisma.transaction.findFirst({
      where: { reference: paymentReference },
      include: {
        request: {
          include: {
            user: true,
            celebrityProfile: true,
          },
        },
      },
    });
  }

  async verifyPayment(paymentReference: string) {
    try {
      const response = await axios.get(
        `${configuration().paystack.paystackUrl}/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${configuration().paystack.secretKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new InternalServerErrorException('Payment verification failed');
    }
  }

  async mapFlutterwaveTransactionStatusToTransactionStatus(
    status: string,
  ): Promise<TransactionStatus> {
    switch (status) {
      case 'successful':
        return TransactionStatus.COMPLETED;
      case 'succeeded':
        return TransactionStatus.COMPLETED;
      case 'failed':
        return TransactionStatus.FAILED;
      case 'pending':
        return TransactionStatus.PENDING;
      case 'cancelled':
        return TransactionStatus.CANCELLED;
      case 'processing':
        return TransactionStatus.PROCESSING;
      default:
        return TransactionStatus.PENDING;
    }
  }

  async verifyFlutterwavePayment(
    paymentReference: string,
    user: User,
  ): Promise<FlutterwaveResponse<FlutterwaveTransaction>> {
    try {
      const response = await axios.get(
        `${configuration().flutterwave.fluuterwaveV3Url}/transactions/${paymentReference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${configuration().flutterwave.secretKey}`,
          },
        },
      );
      if (response.data) {
        const flutterwaveTransaction = (
          response.data as FlutterwaveResponse<FlutterwaveTransaction>
        ).data;
        const request = await this.prisma.requests.findFirst({
          where: {
            paymentReference: flutterwaveTransaction.tx_ref,
          },
        });
        if (!request) {
          throw new NotFoundException('Request not found');
        }

        await this.updateRequestIsPaidStatus(request.id);

        await this.prisma.transaction.create({
          data: {
            reference: flutterwaveTransaction.tx_ref,
            escrowStatus: EscrowStatus.PENDING,
            escrowType: EscrowType.REQUEST_PAYMENT,
            amount: flutterwaveTransaction.amount,
            currency: flutterwaveTransaction.currency,
            paymentMethod: PaymentChannelEnum.FLUTTERWAVE,
            type: TransactionType.CREDIT,
            request: {
              connect: {
                id: request.id,
              },
            },
            status:
              await this.mapFlutterwaveTransactionStatusToTransactionStatus(
                flutterwaveTransaction.status,
              ),
            metadata: flutterwaveTransaction.metadata,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      }
      return response.data as FlutterwaveResponse<FlutterwaveTransaction>;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new InternalServerErrorException('Payment verification failed');
    }
  }

  async updateWalletBalance(userId: string, transaction: Transaction) {
    if (transaction.isInEscrow) return;
    await this.prisma.wallet.update({
      where: { userId },
      data: { walletBalance: { increment: transaction.amount } },
    });
  }

  /**
   * Log payment activity
   */
  private async logPaymentActivity(
    userId: string,
    action: string,
    paymentReference: string,
    amount: number,
    currency: string,
    requestId?: string,
    metadata?: any,
  ) {
    try {
      const { ActivityLogsService } = await import(
        '../activity-logs/activity-logs.service'
      );
      const activityLogsService = new ActivityLogsService(this.prisma);

      await activityLogsService.logPayment(
        userId,
        action as any,
        paymentReference,
        amount,
        currency,
        requestId,
        metadata,
      );
    } catch (error) {
      console.error('Error logging payment activity:', error);
      // Don't throw - logging should not break main flow
    }
  }

  /**
   * Validate Flutterwave webhook signature
   */
  async validateFlutterwaveWebhookSignature(
    webhookData: any,
    signature: string,
  ): Promise<boolean> {
    try {
      const secretHash =
        configuration().flutterwave?.secretHash ||
        process.env.FLUTTERWAVE_SECRET_HASH;

      if (!secretHash) {
        console.warn(
          'Flutterwave secret hash not configured, skipping validation',
        );
        return true; // Allow webhook if secret not configured
      }

      // Flutterwave sends the secret hash as the signature
      // Simply compare the signature with the configured secret hash
      const isValid = signature === secretHash;

      if (!isValid) {
        console.warn('Invalid Flutterwave webhook signature');
      }

      return isValid;
    } catch (error) {
      console.error('Error validating Flutterwave webhook signature:', error);
      return false;
    }
  }

  /**
   * Handle Flutterwave webhook events
   */
  async handleFlutterwaveWebhook(webhookData: any) {
    const { status } = webhookData;

    switch (status) {
      case 'successful':
        return await this.processFlutterwavePaymentSuccess(webhookData);
      // case 'charge.failed':
      //   return await this.processFlutterwavePaymentFailed(data);
      // case 'transfer.completed':
      //   return await this.processFlutterwaveTransferCompleted(data);
      // case 'refund.completed':
      //   return await this.processFlutterwaveRefundCompleted(data);
      default:
        console.log(`Unhandled Flutterwave webhook event: ${event}`);
        return { status: 'ignored', event };
    }
  }

  /**
   * Process successful Flutterwave payment
   */
  private async processFlutterwavePaymentSuccess(data: any) {
    try {
      console.log('Processing Flutterwave payment success:', data.tx_ref);

      // Find the request by payment reference
      const request = await this.findRequestByPaymentReference(data.tx_ref);

      if (!request) {
        console.warn(
          `No request found for Flutterwave payment reference: ${data.tx_ref}`,
        );
        return { status: 'request_not_found', reference: data.tx_ref };
      }

      // Update request paid status
      await this.updateRequestIsPaidStatus(request.id);

      //check if payment record already exists

      // Create transaction record
      const paymentRecord = await this.createPaymentRecord({
        userId: request.userId,
        requestId: request.id,
        amount: data.amount, // Flutterwave sends amount in main currency unit
        currency: data.currency,
        paymentMethod: data.payment_type || 'flutterwave',
        paymentReference: data.tx_ref,
        status: TransactionStatus.COMPLETED,
        metadata: {
          flw_ref: data.flw_ref,
          processor_response: data.processor_response,
          charged_amount: data.charged_amount,
          app_fee: data.app_fee,
          merchant_fee: data.merchant_fee,
          customer: data.customer,
          payment_type: data.payment_type,
          settled_amount: data.amount_settled,
        },
      });

      // Log payment activity
      await this.logPaymentActivity(
        request.userId,
        'PAYMENT_COMPLETED',
        data.tx_ref,
        data.amount,
        data.currency,
        request.id,
        {
          provider: 'flutterwave',
          flw_ref: data.flw_ref,
          payment_type: data.payment_type,
        },
      );

      console.log(
        `Flutterwave payment processed successfully for request: ${request.id}`,
      );

      // Send email to celebrity about a request created by a fan
      this.eventEmitter.emit('email.notification', {
        toName: request.celebrityProfile.displayName,
        toEmail: request.celebrityProfile.user.email,
        templateId: TemplateConfigEnum.Celebrity_Request_Notification,
        params: {
          celebrityName: request.celebrityProfile.displayName,
          fromName: request.fromName ?? request.user.firstName,
          forName: request.forName ?? 'N/A',
          occasion: request.occasion,
          currency: 'USD',
          price: request.price.toString(),
          instruction: request.instructions,
        },
      });

      // Send email to fan about successful payment
      this.eventEmitter.emit('email.notification', {
        toName: request.user.firstName,
        toEmail: request.user.email,
        templateId: TemplateConfigEnum.Success_Request_Payment_Notification,
        params: {
          fanName: request.user.firstName,
          paymentRef: data.tx_ref,
          requestId: request.id,
          amount: data.amount,
          currency: data.currency,
          celebrityName: request.celebrityProfile.displayName,
        },
      });
      return {
        status: 'success',
        reference: data.tx_ref,
        requestId: request.id,
        transactionId: paymentRecord.id,
      };
    } catch (error) {
      console.error('Error processing Flutterwave payment success:', error);
      throw error;
    }
  }

  /**
   * Process failed Flutterwave payment
   */
  private async processFlutterwavePaymentFailed(data: any) {
    try {
      console.log('Processing Flutterwave payment failure:', data.tx_ref);

      // Find the request by payment reference
      const request = await this.findRequestByPaymentReference(data.tx_ref);

      if (!request) {
        console.warn(
          `No request found for Flutterwave failed payment: ${data.tx_ref}`,
        );
        return { status: 'request_not_found', reference: data.tx_ref };
      }

      // Create failed transaction record
      const paymentRecord = await this.createPaymentRecord({
        userId: request.userId,
        requestId: request.id,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.payment_type || 'flutterwave',
        paymentReference: data.tx_ref,
        status: TransactionStatus.FAILED,
        metadata: {
          flw_ref: data.flw_ref,
          processor_response: data.processor_response,
          failure_reason: data.processor_response || 'Payment failed',
          customer: data.customer,
          payment_type: data.payment_type,
        },
      });

      // Log failed payment activity
      await this.logPaymentActivity(
        request.userId,
        'PAYMENT_FAILED',
        data.tx_ref,
        data.amount,
        data.currency,
        request.id,
        {
          provider: 'flutterwave',
          flw_ref: data.flw_ref,
          failure_reason: data.processor_response,
        },
      );

      console.log(
        `Flutterwave failed payment recorded for request: ${request.id}`,
      );

      return {
        status: 'failed',
        reference: data.tx_ref,
        requestId: request.id,
        transactionId: paymentRecord.id,
      };
    } catch (error) {
      console.error('Error processing Flutterwave payment failure:', error);
      throw error;
    }
  }

  /**
   * Process completed Flutterwave transfer
   */
  private async processFlutterwaveTransferCompleted(data: any) {
    try {
      console.log(
        'Processing Flutterwave transfer completion:',
        data.reference,
      );

      // Find transaction by reference
      const transaction = await this.prisma.transaction.findFirst({
        where: { reference: data.reference },
      });

      if (!transaction) {
        console.warn(
          `No transaction found for Flutterwave transfer: ${data.reference}`,
        );
        return { status: 'transaction_not_found', reference: data.reference };
      }

      // Update transaction status
      const existingMetadata = (transaction.metadata as any) || {};
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          metadata: {
            ...existingMetadata,
            transfer_data: data,
            completed_at: new Date().toISOString(),
          },
        },
      });

      // Update wallet balance if not in escrow
      if (!transaction.isInEscrow && transaction.userId) {
        await this.updateWalletBalance(transaction.userId, transaction);
      }

      console.log(
        `Flutterwave transfer completed for transaction: ${transaction.id}`,
      );

      return {
        status: 'success',
        reference: data.reference,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error('Error processing Flutterwave transfer:', error);
      throw error;
    }
  }

  /**
   * Process completed Flutterwave refund
   */
  private async processFlutterwaveRefundCompleted(data: any) {
    try {
      console.log('Processing Flutterwave refund completion:', data.tx_ref);

      // Find transaction by reference
      const transaction = await this.prisma.transaction.findFirst({
        where: { reference: data.tx_ref },
      });

      if (!transaction) {
        console.warn(
          `No transaction found for Flutterwave refund: ${data.tx_ref}`,
        );
        return { status: 'transaction_not_found', reference: data.tx_ref };
      }

      // Update transaction status to refunded
      const existingMetadata = (transaction.metadata as any) || {};
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
          escrowStatus: EscrowStatus.REFUNDED,
          metadata: {
            ...existingMetadata,
            refund_data: data,
            refunded_at: new Date().toISOString(),
            refund_amount: data.amount,
          },
        },
      });

      console.log(
        `Flutterwave refund processed for transaction: ${transaction.id}`,
      );

      return {
        status: 'success',
        reference: data.tx_ref,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error('Error processing Flutterwave refund:', error);
      throw error;
    }
  }

  /**
   * Resolve account
   */
  async resolveAccount(
    bankCode: string,
    accountNumber: string,
  ): Promise<AccountResolutionResponse> {
    try {
      const response = await axios.get(
        `${configuration().paystack.paystackUrl}/bank/resolve?bank_code=${bankCode}&account_number=${accountNumber}`,
        {
          headers: {
            Authorization: `Bearer ${configuration().paystack.secretKey}`,
          },
        },
      );
      return (response.data as PaymentResponseType<AccountResolutionResponse>)
        .data;
    } catch (error) {
      console.error('Error resolving account:', error);
      throw error;
    }
  }

  async getBankList(): Promise<BankListType[]> {
    try {
      const response = await axios.get(
        `${configuration().paystack.paystackUrl}/bank`,
        {
          headers: {
            Authorization: `Bearer ${configuration().paystack.secretKey}`,
          },
        },
      );
      return (response.data as PaymentResponseType<BankListType[]>).data;
    } catch (error) {
      console.error('Error getting bank list:', error);
      throw error;
    }
  }

  async createBankAccount(user: User, bankAccount: CreateBankAccountDto) {
    try {
      return this.prisma.bankAccount.create({
        data: {
          ...bankAccount,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  }

  async initiateBankAccountTransfer(
    user: User,
    initiateBankAccountTransferDto: InitiateBankAccountTransferDto,
  ) {
    try {
      const bankAccount = await this.prisma.bankAccount.findUnique({
        where: { id: initiateBankAccountTransferDto.bankAccountId },
      });
      if (!bankAccount) {
        throw new NotFoundException('Bank account not found');
      }
      const response = await axios.post(
        `${configuration().paystack.paystackUrl}/transfers`,
        {
          amount: initiateBankAccountTransferDto.amount,
          bank_code: bankAccount.bankCode,
          account_number: bankAccount.accountNumber,
          currency: 'NGN',
          reference: crypto.randomUUID(),
        },
        {
          headers: {
            Authorization: `Bearer ${configuration().paystack.secretKey}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error initiating bank account transfer:', error);
      throw error;
    }
  }

  async getBankAccountList(user: User) {
    try {
      return this.prisma.bankAccount.findMany({
        where: { userId: user.id },
      });
    } catch (error) {
      console.error('Error getting bank account list:', error);
      throw error;
    }
  }
}
