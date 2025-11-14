import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Query,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { WebhookDto } from './dtos/webhook.dto';
import { FlutterwaveWebhookDto } from './dtos/flutterwave-webhook.dto';
import { RequestLimitService } from '../request-limit/request-limit.service';
import {
  RequestStatus,
  Transaction,
  TransactionStatus,
  User,
} from '@prisma/client';
import { Public, UserDecorator } from 'src/decorators';
import {
  CreateBankAccountDto,
  CreatePaymentDto,
  InitiateBankAccountTransferDto,
  VerifyPaymentDto,
} from './payment.dto';
import { PaymentChannelEnum, TemplateConfigEnum } from 'src/utils/enum';
import { FlutterwaveResponse, FlutterwaveTransaction } from 'src/types/payment';
import { AuthGuard } from 'src/guards/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinalizeTransferDto, ResendOtpDto } from './dtos/payment-record.dto';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly requestLimitService: RequestLimitService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Public()
  @Post('paystack/webhook')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(
    @Body() webhookData: WebhookDto,
    @Headers('x-paystack-signature') signature: string,
  ) {
    try {
      this.logger.log('Received Paystack webhook', {
        event: webhookData.event,
        reference: webhookData.data?.reference,
      });

      // Validate webhook signature
      const isValidSignature =
        await this.paymentService.validateWebhookSignature(
          webhookData,
          signature,
        );

      if (!isValidSignature) {
        this.logger.warn('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Handle different webhook events
      switch (webhookData.event) {
        case 'charge.success':
          await this.handlePaymentSuccess(webhookData);
          break;
        case 'charge.failed':
          await this.handlePaymentFailed(webhookData);
          break;
        case 'subscription.create':
          await this.handleSubscriptionCreate(webhookData);
          break;
        case 'subscription.disable':
          await this.handleSubscriptionDisable(webhookData);
          break;
        case 'invoice.create':
          await this.handleInvoiceCreate(webhookData);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(webhookData);
          break;
        default:
          this.logger.log(`Unhandled webhook event: ${webhookData.event}`);
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Webhook processing error', error);
      throw error;
    }
  }

  @Post('flutterwave/create-payment')
  @Public()
  @HttpCode(HttpStatus.OK)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Query('paymentChannel') paymentChannel: PaymentChannelEnum,
  ) {
    const paymentChannelData = paymentChannel || PaymentChannelEnum.PAYSTACK;
    return this.paymentService.createPayment(
      createPaymentDto,
      paymentChannelData,
    );
  }

  @Get('flutterwave/verify/:reference')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async verifyPayment(
    @Param('reference') reference: string,
    @UserDecorator() user: User,
  ): Promise<FlutterwaveResponse<FlutterwaveTransaction>> {
    return this.paymentService.verifyFlutterwavePayment(reference, user);
  }

  private async handlePaymentSuccess(webhookData: WebhookDto) {
    let paymentRecord: Transaction;
    const { data } = webhookData;
    this.logger.log('Processing successful payment', {
      reference: data.reference,
      amount: data.amount,
      customer: data.customer?.email,
    });

    try {
      // Find the request by payment reference
      const request = await this.paymentService.findRequestByPaymentReference(
        data.reference,
      );

      if (!request) {
        //check if payment record already exists
        paymentRecord = await this.paymentService.getPaymentRecordByReference(
          data.reference,
        );

        if (!paymentRecord) {
          throw new BadRequestException('Payment record not found');
        }

        if (paymentRecord.status !== data.status) {
          paymentRecord = await this.paymentService.createPaymentRecord({
            userId: paymentRecord.userId,
            requestId: request.id,
            amount: data.amount / 100, // Convert from kobo to naira
            currency: data.currency,
            paymentMethod: data.channel,
            paymentReference: data.reference,
            status: TransactionStatus.COMPLETED,
            metadata: data.metadata,
          });

          await this.paymentService.updateWalletBalanceAfterWithdrawal(
            paymentRecord,
          );
        }
      } else {
        // Create payment record
        paymentRecord = await this.paymentService.createPaymentRecord({
          userId: request.userId,
          requestId: request.id,
          amount: data.amount / 100, // Convert from kobo to naira
          currency: data.currency,
          paymentMethod: data.channel,
          paymentReference: data.reference,
          status: TransactionStatus.COMPLETED,
          metadata: data.metadata,
        });
      }

      await this.paymentService.updateRequestIsPaidStatus(request.id);

      if (paymentRecord) {
        // await this.paymentService.updateRequestStatus(request.id, 'IN_PROGRESS');
      }

      //TODO:send payment success to user(FAN) by email
      //.....

      //Send email to notification to celebrity for new request
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
          paymentRef: request.paymentReference,
          requestId: request.id,
          amount: data.amount.toString(),
          currency: data.currency,
          celebrityName: request.celebrityProfile.displayName,
        },
      });

      this.logger.log(
        `Payment processed successfully for request ${request.id}`,
      );
    } catch (error) {
      this.logger.error('Error processing payment success', error);
      throw error;
    }
  }

  private async handlePaymentFailed(webhookData: WebhookDto) {
    const { data } = webhookData;
    this.logger.log('Processing failed payment', {
      reference: data.reference,
      reason: data.gateway_response,
    });

    try {
      // Find the request by payment reference
      const request = await this.paymentService.findRequestByPaymentReference(
        data.reference,
      );

      if (!request) {
        this.logger.warn(
          `No request found for payment reference: ${data.reference}`,
        );
        return;
      }

      // Update request status to DECLINED
      //   await this.paymentService.updateRequestStatus(request.id, 'DECLINED');

      // Create payment record
      await this.paymentService.createPaymentRecord({
        userId: request.userId,
        requestId: request.id,
        amount: data.amount / 100,
        currency: data.currency,
        paymentMethod: data.channel,
        paymentReference: data.reference,
        status: TransactionStatus.FAILED,
        metadata: data.metadata,
      });

      this.logger.log(`Payment failure processed for request ${request.id}`);
    } catch (error) {
      this.logger.error('Error processing payment failure', error);
      throw error;
    }
  }

  private async handleSubscriptionCreate(webhookData: WebhookDto) {
    this.logger.log('Subscription created', webhookData.data);
    // Handle subscription creation if needed
  }

  private async handleSubscriptionDisable(webhookData: WebhookDto) {
    this.logger.log('Subscription disabled', webhookData.data);
    // Handle subscription disable if needed
  }

  private async handleInvoiceCreate(webhookData: WebhookDto) {
    this.logger.log('Invoice created', webhookData.data);
    // Handle invoice creation if needed
  }

  private async handleInvoicePaymentFailed(webhookData: WebhookDto) {
    this.logger.log('Invoice payment failed', webhookData.data);
    // Handle invoice payment failure if needed
  }

  @Post('webhook/test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(@Body() testData: any) {
    this.logger.log('Webhook test endpoint called', testData);
    return { status: 'success', message: 'Webhook test endpoint is working' };
  }

  @Public()
  @Post('flutterwave/webhook')
  @HttpCode(HttpStatus.OK)
  async handleFlutterwaveWebhook(
    @Body() webhookData: FlutterwaveWebhookDto,
    @Headers('verif-hash') signature: string,
  ) {
    try {
      this.logger.log('Received Flutterwave webhook', webhookData);
      this.logger.log('Received Flutterwave webhook', {
        event: webhookData.event,
        reference: webhookData.data?.tx_ref,
        status: webhookData.data?.status,
      });

      // Validate webhook signature
      const isValidSignature =
        await this.paymentService.validateFlutterwaveWebhookSignature(
          webhookData,
          signature,
        );

      if (!isValidSignature) {
        this.logger.warn('Invalid Flutterwave webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Handle different webhook events
      const result =
        await this.paymentService.handleFlutterwaveWebhook(webhookData);

      this.logger.log('Flutterwave webhook processed', result);

      return { status: 'success', result };
    } catch (error) {
      this.logger.error('Flutterwave webhook processing error', error);

      // Return 200 to prevent Flutterwave from retrying
      // Log error for investigation
      return {
        status: 'error',
        message: 'Webhook received but processing failed',
        error: error.message,
      };
    }
  }

  @Get('fluterwave/webhook/:reference')
  @Public()
  @HttpCode(HttpStatus.OK)
  async fluterwaveWebhook(@Param('reference') reference: string) {
    return this.paymentService.handleFlutterwaveWebhook(reference);
  }

  /**
   *
   * Bank Account Management Endpoints
   *
   */

  @Get('resolve/account')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async resolveAccount(
    @Query('bankCode') bankCode: string,
    @Query('accountNumber') accountNumber: string,
  ) {
    return this.paymentService.resolveAccount(bankCode, accountNumber);
  }

  @Get('bank-list')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBankList() {
    return this.paymentService.getBankList();
  }

  @Post('bank-account/create')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async createBankAccount(
    @Body() createBankAccountDto: CreateBankAccountDto,
    @UserDecorator() user: User,
  ) {
    return this.paymentService.createBankAccount(user, createBankAccountDto);
  }

  @Post('initiate/bank-account/transfer')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async initiateBankAccountTransfer(
    @Body() initiateBankAccountTransferDto: InitiateBankAccountTransferDto,
    @UserDecorator() user: User,
  ) {
    return this.paymentService.initiateBankAccountTransfer(
      user,
      initiateBankAccountTransferDto,
    );
  }

  @Get('bank-account/list')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBankAccountList(@UserDecorator() user: User) {
    return this.paymentService.getBankAccountList(user);
  }

  @Post('finalize/transfer')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async finalizeTransfer(
    @Body() finalizeTransferDto: FinalizeTransferDto,
    @UserDecorator() user: User,
  ) {
    return this.paymentService.finalizeTransfer(user, finalizeTransferDto);
  }

  @Post('resend/otp')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
    @UserDecorator() user: User,
  ) {
    return this.paymentService.resendOtp(user, resendOtpDto);
  }
}
