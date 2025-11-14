import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CelebrityProfile,
  Prisma,
  Requests,
  RequestStatus,
  Role,
  User,
} from '@prisma/client';
import { ChangeRequestStatusDto, RequestsDto } from './dtos/requests.dto';
import configuration from 'src/config/configuration';
import { CelebrityRequest, RequestSummary } from 'src/types/request';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PaymentService } from 'src/payment/payment.service';
import { generateFlutterwaveTransactionRef } from 'src/utils/helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TemplateConfigEnum } from 'src/utils/enum';

@Injectable()
export class RequestService {
  private readonly basedAmountSerializer: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.basedAmountSerializer = configuration().baseAmountSerializer;
    console.log('basedAmountSerializer', this.basedAmountSerializer);
  }

  async findAll(
    user: User & { celebrityProfile: CelebrityProfile },
    status: RequestStatus,
    includeUnpaid: boolean = false,
    onlyUnpaid: boolean = false,
  ): Promise<Array<Partial<CelebrityRequest>>> {
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (user.userType === Role.CELEBRITY) {
      const celebrityProfile = await this.prisma.celebrityProfile.findUnique({
        where: { userId: user.id },
      });
      if (!celebrityProfile) {
        throw new NotFoundException('Celebrity profile not found');
      }
      const whereClause: Prisma.RequestsWhereInput = {
        celebrityProfileId: celebrityProfile.id,
        status,
      };

      // Handle payment status filtering
      if (onlyUnpaid) {
        whereClause.isRequestPaid = false;
      } else if (!includeUnpaid) {
        whereClause.isRequestPaid = true;
      }

      const requests = await this.prisma.requests.findMany({
        where: whereClause,
        include: {
          celebrityProfile: true,
          vybraaServiceFee: true,
          user: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });

      console.log('Celebrity requests found:', requests.length);
      console.log('First request createdAt:', requests[0]?.createdAt);
      console.log(
        'Last request createdAt:',
        requests[requests.length - 1]?.createdAt,
      );

      const celebrityRequests = requests.map((request) => {
        return {
          id: request.id,
          user: {
            id: request.user.id,
            firstName: request.user.firstName,
            lastName: request.user.lastName,
            profilePhotoUrl: request.user.profilePhotoUrl,
          },
          recipient: request.recipient,
          status: request.status,
          forName: request.forName,
          fromName: request.fromName,
          occasion: request.occasion,
          instructions: request.instructions,
          price: request.price.toString(),
          currency: configuration().baseCurrency,
        };
      });

      return celebrityRequests as Array<Partial<CelebrityRequest>>;
    } else {
      const where: Prisma.RequestsWhereInput = {
        userId: user.id,
      };

      // Handle payment status filtering
      if (onlyUnpaid) {
        where.isRequestPaid = false;
      } else if (!includeUnpaid) {
        where.isRequestPaid = true;
      }
      switch (status) {
        case RequestStatus.PENDING:
          where.OR = [
            { status: RequestStatus.PENDING },
            { status: RequestStatus.IN_PROGRESS },
          ];

          break;
        case RequestStatus.IN_PROGRESS:
          where.status = RequestStatus.IN_PROGRESS;
          break;
        case RequestStatus.COMPLETED:
          where.status = RequestStatus.COMPLETED;
          break;
        case RequestStatus.DECLINED:
          where.status = RequestStatus.DECLINED;
          break;
        default:
          where.userId = user.id;
      }

      const requests = await this.prisma.requests.findMany({
        where,
        include: {
          celebrityProfile: true,
          vybraaServiceFee: true,
          user: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });

      console.log('Fan requests found:', requests.length);
      console.log('First request createdAt:', requests[0]?.createdAt);
      console.log(
        'Last request createdAt:',
        requests[requests.length - 1]?.createdAt,
      );

      const fanRequests = await Promise.all(
        requests.map(async (request) => {
          let price = request.price;
          let currency = configuration().baseCurrency;
          if (userData.ipAddressCountry.toLowerCase() === 'ng') {
            currency = 'NGN';
            price = (await this.handleCurrencyConversion(
              Number(request.price),
              'NGN',
            )) as any;
          }

          return {
            id: request.id,
            user: {
              id: request.user.id,
              firstName: request.user.firstName,
              lastName: request.user.lastName,
            },
            recipient: request.recipient,
            forName: request.forName,
            fromName: request.fromName,
            occasion: request.occasion,
            instructions: request.instructions,
            price: price.toString(),
            currency: currency,
            status: request.status,
            celebrityProfile: {
              id: request.celebrityProfile.id,
              displayName: request.celebrityProfile.displayName,
              profilePhotoUrl: request.celebrityProfile.profilePhotoUrl,
              profession: request.celebrityProfile.profession,
            },
          };
        }),
      );

      return fanRequests as Array<Partial<CelebrityRequest>>;
    }
  }

  async findOne(id: string): Promise<Requests> {
    return this.prisma.requests.findUnique({
      where: { id },
      include: { celebrityProfile: true, user: true, vybraaServiceFee: true },
    });
  }

  async handleCurrencyConversion(amount: number, currency: string = 'ngn') {
    const conversionRateAmount = await this.prisma.exchangeRate.findFirst({
      where: {
        fromCurrency: configuration().baseCurrency.toUpperCase(),
        toCurrency: currency.toUpperCase(),
        isActive: true,
      },
    });
    if (!conversionRateAmount) {
      throw new NotFoundException('Conversion rate not found');
    }
    return amount * Number(conversionRateAmount.rate);
  }

  async convertToBaseCurrency(amount: number, currency: string = 'ngn') {
    const conversionRateAmount = await this.prisma.exchangeRate.findFirst({
      where: {
        fromCurrency: configuration().baseCurrency.toUpperCase(),
        toCurrency: currency.toUpperCase(),
        isActive: true,
      },
    });
    if (!conversionRateAmount) {
      throw new NotFoundException('Conversion rate not found');
    }
    return amount / Number(conversionRateAmount.rate);
  }

  private getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
  }

  async create(request: RequestsDto, user: User) {
    try {
      // Step 1: Validate and fetch required data
      const { serviceBill, celebrityProfile, requestLimit, userData } =
        await this.fetchRequestDependencies(request, user);

      // Step 2: Validate celebrity request limits
      await this.validateCelebrityRequestLimit(celebrityProfile, requestLimit);

      // Step 3: Calculate payment amount
      const { amount, currency } = await this.calculatePaymentAmount(
        celebrityProfile,
        serviceBill,
        userData,
      );

      // Step 4: Initialize payment with appropriate provider
      const paymentResponse = await this.initializePayment(
        amount,
        currency,
        user.email,
        userData,
      );

      // Step 5: Create request in database
      await this.createRequestRecord(
        request,
        user,
        userData,
        celebrityProfile,
        serviceBill,
        paymentResponse.reference,
      );

      // Step 6: Update celebrity request count
      await this.incrementCelebrityRequestCount(requestLimit);

      // Step 7: Return payment response
      return this.formatPaymentResponse(paymentResponse, amount, currency);
    } catch (err) {
      console.error('Error creating request:', err);
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to create request');
    }
  }

  /**
   * Fetch all required dependencies for creating a request
   */
  private async fetchRequestDependencies(request: RequestsDto, user: User) {
    const [serviceBill, celebrityProfile, requestLimit, userData] =
      await Promise.all([
        this.prisma.vybraBillingFees.findFirst({
          where: {
            name: 'service_fee',
            currency: configuration().baseCurrency,
            isActive: true,
          },
        }),
        this.prisma.celebrityProfile.findUnique({
          where: { id: request.celebrityProfileId },
          include: { user: true },
        }),
        this.prisma.requestLimit.findUnique({
          where: { userId: user.id },
        }),
        this.prisma.user.findUnique({
          where: { id: user.id },
        }),
      ]);

    if (!serviceBill) {
      throw new InternalServerErrorException('No active service fee found');
    }

    if (!celebrityProfile) {
      throw new NotFoundException('Celebrity profile not found');
    }

    return { serviceBill, celebrityProfile, requestLimit, userData };
  }

  /**
   * Validate celebrity monthly request limits
   */
  private async validateCelebrityRequestLimit(
    celebrityProfile: CelebrityProfile,
    requestLimit: any,
  ) {
    if (!requestLimit || !requestLimit.isActive) {
      return;
    }

    // Check if we need to reset the monthly count
    const now = new Date();
    const resetDate = new Date(requestLimit.resetDate);

    let currentCount = requestLimit.currentMonthCount;

    if (now >= resetDate) {
      // Reset the count and update the reset date
      await this.prisma.requestLimit.update({
        where: { id: requestLimit.id },
        data: {
          currentMonthCount: 0,
          resetDate: this.getNextResetDate(),
        },
      });
      currentCount = 0;
    }

    if (currentCount >= requestLimit.monthlyLimit) {
      throw new BadRequestException(
        `This celebrity has reached their monthly request limit of ${requestLimit.monthlyLimit} requests. Please try again next month.`,
      );
    }
  }

  /**
   * Calculate payment amount based on user country and celebrity price
   */
  private async calculatePaymentAmount(
    celebrityProfile: CelebrityProfile,
    serviceBill: any,
    userData: User,
  ): Promise<{ amount: number; currency: string }> {
    const isNigerian = userData.ipAddressCountry?.toLowerCase() === 'ng';
    const currency = isNigerian ? 'NGN' : configuration().baseCurrency;

    if (isNigerian) {
      // Calculate for Nigerian users
      const ngnServiceBill = await this.prisma.vybraBillingFees.findFirst({
        where: {
          name: 'service_fee',
          currency: 'NGN',
          isActive: true,
        },
      });

      const convertedRequestPrice = await this.handleCurrencyConversion(
        Number(celebrityProfile.requestPrice),
        'NGN',
      );

      const totalAmount =
        (convertedRequestPrice + Number(ngnServiceBill.price)) *
        this.basedAmountSerializer;

      return { amount: totalAmount, currency: 'NGN' };
    } else {
      // Calculate for international users
      const totalAmount =
        (Number(celebrityProfile.requestPrice) + Number(serviceBill.price)) *
        this.basedAmountSerializer;

      return { amount: totalAmount, currency };
    }
  }

  /**
   * Initialize payment with appropriate payment provider
   */
  private async initializePayment(
    amount: number,
    currency: string,
    email: string,
    userData: User,
  ): Promise<{
    reference: string;
    authorization_url?: string;
    access_code?: string;
  }> {
    const isNigerian = userData.ipAddressCountry?.toLowerCase() === 'ng';

    if (isNigerian && currency === 'NGN') {
      // Use Paystack for Nigerian users
      const paystackResponse = await this.paymentService.createPayment({
        amount,
        email,
      });

      return {
        reference: paystackResponse.data.reference,
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
      };
    } else {
      // Use Flutterwave for international users
      const reference = await generateFlutterwaveTransactionRef(10);

      return {
        reference,
      };
    }
  }

  /**
   * Create request record in database
   */
  private async createRequestRecord(
    request: RequestsDto,
    user: User,
    userData: User,
    celebrityProfile: CelebrityProfile,
    serviceBill: any,
    paymentReference: string,
  ) {
    const requestData: Prisma.RequestsCreateInput = {
      instructions: request.instructions,
      occasion: request.occasion,
      recipient: request.recipient,
      forName: request.forName ?? null,
      fromName: userData.firstName ?? null,
      paymentReference,
      price: celebrityProfile.requestPrice,
      user: { connect: { id: user.id } },
      celebrityProfile: { connect: { id: request.celebrityProfileId } },
      vybraaServiceFee: { connect: { id: serviceBill.id } },
    };

    await this.prisma.requests.create({ data: requestData });
  }

  /**
   * Increment celebrity's monthly request count
   */
  private async incrementCelebrityRequestCount(requestLimit: any) {
    if (requestLimit && requestLimit.isActive) {
      await this.prisma.requestLimit.update({
        where: { id: requestLimit.id },
        data: {
          currentMonthCount: {
            increment: 1,
          },
        },
      });
    }
  }

  /**
   * Format payment response for frontend
   */
  private formatPaymentResponse(
    paymentResponse: any,
    amount: number,
    currency: string,
  ) {
    const baseResponse = {
      paymentData: {
        requestPrice: amount.toFixed(2),
        currency,
      },
    };

    // Include Paystack-specific data if available
    if (paymentResponse.authorization_url) {
      return {
        ...paymentResponse,
        ...baseResponse,
      };
    }

    // Return basic response for Flutterwave
    return {
      data: {
        reference: paymentResponse.reference,
      },
      ...baseResponse,
    };
  }

  async update(
    id: string,
    request: Prisma.RequestsUpdateInput,
  ): Promise<Requests> {
    return this.prisma.requests.update({ where: { id }, data: request });
  }

  async changeRequestStatus(
    id: string,
    request: ChangeRequestStatusDto,
    user: User & { celebrityProfile: CelebrityProfile },
  ) {
    console.log('request', request);
    if (!id) {
      throw new BadRequestException('Request ID is required');
    }

    const rq = await this.prisma.requests.findUnique({
      where: { id, celebrityProfileId: user.celebrityProfile.id },
      include: { user: true },
    });
    if (!rq) {
      throw new NotFoundException('Request not found');
    }

    const previousStatus = rq.status;

    try {
      await this.prisma.requests.update({
        where: { id, celebrityProfileId: user.celebrityProfile.id },
        data: request,
      });

      // Log request status change activity
      await this.logRequestStatusChange(
        user.id,
        id,
        rq.userId,
        request.status,
        previousStatus,
      );

      return { message: 'Request status changed successfully' };
    } catch (err) {
      console.error('error:', err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Log request status change activity
   */
  private async logRequestStatusChange(
    celebrityUserId: string,
    requestId: string,
    fanUserId: string,
    newStatus: string,
    previousStatus: string,
  ) {
    try {
      const { ActivityLogsService } = await import(
        '../activity-logs/activity-logs.service'
      );
      const activityLogsService = new ActivityLogsService(this.prisma);

      const actionMap = {
        ACCEPTED: 'REQUEST_ACCEPTED',
        DECLINED: 'REQUEST_DECLINED',
        COMPLETED: 'REQUEST_COMPLETED',
        CANCELLED: 'REQUEST_CANCELLED',
      };

      const action = actionMap[newStatus] || null;

      if (action) {
        await activityLogsService.logRequestStatusChange(
          celebrityUserId,
          requestId,
          fanUserId,
          action as any,
          previousStatus,
          newStatus,
        );
      }
    } catch (error) {
      console.error('Error logging request status change:', error);
      // Don't throw - logging should not break main flow
    }
  }

  /**
   * Log video upload activity
   */
  private async logVideoUpload(
    celebrityUserId: string,
    requestId: string,
    fanUserId: string,
    videoUrl: string,
  ) {
    try {
      const { ActivityLogsService } = await import(
        '../activity-logs/activity-logs.service'
      );
      const activityLogsService = new ActivityLogsService(this.prisma);

      await activityLogsService.logVideoUploaded(
        celebrityUserId,
        requestId,
        fanUserId,
        videoUrl,
      );
    } catch (error) {
      console.error('Error logging video upload:', error);
      // Don't throw - logging should not break main flow
    }
  }

  async celebrityRequestPaymentInfo(
    id: string,
    user: User,
  ): Promise<
    {
      name: string;
      price: string;
      currency: string;
      duration: string;
    }[]
  > {
    const celebrityProfile = await this.prisma.celebrityProfile.findUnique({
      where: { id },
    });
    if (!celebrityProfile) {
      throw new NotFoundException('Celebrity profile not found');
    }

    let serviceBill = null;

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (userData.ipAddressCountry.toLowerCase() === 'ng') {
      serviceBill = await this.prisma.vybraBillingFees.findFirst({
        where: {
          name: 'service_fee',
          currency: 'NGN',
          isActive: true,
        },
      });
    } else {
      serviceBill = await this.prisma.vybraBillingFees.findFirst({
        where: {
          name: 'service_fee',
          currency: 'USD',
          isActive: true,
        },
      });
    }
    if (!serviceBill) {
      throw new InternalServerErrorException('No active service fee found');
    }
    if (userData.ipAddressCountry.toLowerCase() === 'ng') {
      const convertedRequestPrice = await this.handleCurrencyConversion(
        Number(celebrityProfile.requestPrice),
        'NGN',
      );
      celebrityProfile.requestPrice = convertedRequestPrice as any;
      celebrityProfile.requestPriceCurrency = 'NGN' as any;
    }
    const paymentData = [
      {
        name: 'Standard',
        slug: 'standard',
        price: celebrityProfile.requestPrice.toString(),
        currency: celebrityProfile.requestPriceCurrency,
        duration: '2-7 days',
      },

      {
        name: 'Service Fee',
        slug: 'service-fee',
        price: serviceBill.price.toString(),
        currency: serviceBill.currency,
        duration: null,
      },
    ];

    return paymentData;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.requests.delete({ where: { id } });
  }

  async updateVideo(
    id: string,
    file: Express.Multer.File,
    user: User & { celebrityProfile: CelebrityProfile },
  ): Promise<Requests> {
    // Validate that the request exists and belongs to the celebrity
    const request = await this.prisma.requests.findUnique({
      where: { id, celebrityProfileId: user.celebrityProfile.id },
      include: { celebrityProfile: { include: { user: true } }, user: true },
    });

    //check if size of file is greater than 15mb
    if (file.size > 15 * 1024 * 1024) {
      throw new BadRequestException(
        'File size is too large. Maximum size is 15MB.',
      );
    }

    if (!request) {
      throw new NotFoundException('Request not found or access denied');
    }

    // Check if request is in the correct status for video upload
    if (request.status !== RequestStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Video can only be uploaded for requests in progress',
      );
    }

    try {
      // Upload video to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadRequestVideo(
        file,
        id,
      );

      // If there was a previous video, delete it from Cloudinary
      if (request.videoUrl) {
        try {
          // Extract public ID from the URL
          const urlParts = request.videoUrl.split('/');
          const publicId = urlParts[urlParts.length - 1].split('.')[0];
          await this.cloudinaryService.deleteVideo(publicId);
        } catch (deleteError) {
          console.warn('Failed to delete previous video:', deleteError);
          // Continue with update even if deletion fails
        }
      }

      // Update the request with the new video URL
      const updatedRequest = await this.prisma.requests.update({
        where: { id },
        data: {
          videoUrl: uploadResult.secure_url,
          status: RequestStatus.COMPLETED, // Mark as completed after video upload
        },
      });

      // Log video upload activity
      await this.logVideoUpload(
        user.id,
        id,
        request.userId,
        uploadResult.secure_url,
      );

      this.eventEmitter.emit('email.notification', {
        toName: request.user.firstName,
        toEmail: request.user.email,
        templateId: TemplateConfigEnum.Request_Completed_Notification,
        params: {
          celebrityName: request.celebrityProfile.displayName,
          fanName: request.user.firstName,
          forName: request.forName ?? 'N/A',
          occasion: request.occasion,
          requestId: request.id,
        },
      });

      return updatedRequest;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new InternalServerErrorException('Failed to upload video');
    }
  }

  async requestSummary(
    user: User & { celebrityProfile: CelebrityProfile },
  ): Promise<RequestSummary> {
    const requests = await this.prisma.requests.findMany({
      where: { userId: user.id },
    });

    return {
      totalRequests: requests.length,
      totalPendingRequests: requests.filter(
        (request) => request.status === RequestStatus.PENDING,
      ).length,
      totalCompletedRequests: requests.filter(
        (request) => request.status === RequestStatus.COMPLETED,
      ).length,
      totalDeclinedRequests: requests.filter(
        (request) => request.status === RequestStatus.DECLINED,
      ).length,
    };
  }
}
