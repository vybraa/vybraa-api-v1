import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, RequestStatus, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Pagination } from 'src/types/pagination';
import { UpdatUserProfileDto } from './admin.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TemplateConfigEnum } from 'src/utils/enum';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<Pagination<Partial<User>>> {
    try {
      if (!this.prisma) {
        throw new Error('PrismaService is not injected properly');
      }

      // Ensure page and limit are numbers and validate them
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (isNaN(pageNum) || isNaN(limitNum)) {
        throw new BadRequestException('Page and limit must be valid numbers');
      }

      if (pageNum < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const whereClause: Prisma.UserWhereInput = {};

      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await this.prisma.user.findMany({
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userType: true,
          phoneNumber: true,
          profilePhotoUrl: true,
          ipAddressCountry: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          celebrityProfile: {
            select: {
              id: true,
              userId: true,
              legalName: true,
              displayName: true,
              dateOfBirth: true,
              countryCodeId: true,
              phoneNumber: true,
              countryOfResidence: true,
              primarySocialPlatform: true,
              socialHandle: true,
              followers: true,
              profilePhotoUrl: true,
              profession: true,
              additionalDescription: true,
              categoryId: true,
              managerName: true,
              managerPhone: true,
              requestPrice: true,
              requestPriceCurrency: true,
              onboardingStep: true,
              isOnboardingComplete: true,
              isUnderReview: true,
              isTrending: true,
              reviewStatus: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log('users', users);
      return {
        data: users,
        total: users.length,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get users: ${error.message}`,
      );
    }
  }

  async getMetrics(): Promise<any> {
    try {
      const userCount = await this.prisma.user.count();
      const categoryCount = await this.prisma.category.count();
      const celebrityCount = await this.prisma.celebrityProfile.count();
      const flutterwaveKeyCount = await this.prisma.flutterWaveKey.count();
      const requests = await this.prisma.requests.findMany({
        where: {
          isRequestPaid: true,
        },
      });

      const totalRequests = requests.length;

      const requestRevenue = requests.reduce((acc, request) => {
        return acc + Number(request.price);
      }, 0);
      return {
        userCount,
        categoryCount,
        celebrityCount,
        flutterwaveKeyCount,
        revenue: requestRevenue,
        requests: totalRequests,
      };
    } catch (error) {
      console.error('Error in getMetrics:', error);
      throw new InternalServerErrorException('Failed to get metrics');
    }
  }

  async updateUserProfile(id: string, user: UpdatUserProfileDto): Promise<any> {
    try {
      const userInfo = {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phoneNumber: user.phoneNumber || undefined,
      };
      await this.prisma.user.update({
        where: { id },
        data: userInfo,
      });

      await this.prisma.celebrityProfile.update({
        where: { userId: id },
        data: {
          managerName: user.managerName || undefined,
          managerPhone: user.managerPhone || undefined,
          primarySocialPlatform: user.primarySocialPlatform || undefined,
          socialHandle: user.socialHandle || undefined,
          followers: user.followers || undefined,
          profilePhotoUrl: user.profilePhotoUrl || undefined,
          countryCodeId: user.countryCodeId || undefined,
          countryOfResidence: user.countryOfResidence || undefined,
        },
      });
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  async verifyUser(id: string): Promise<any> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isVerified: true },
      });

      return { message: 'User verified successfully' };
    } catch (error) {
      console.error('Error in verifyUser:', error);
      throw new InternalServerErrorException('Failed to verify user');
    }
  }

  async approveUser(userId: string): Promise<any> {
    try {
      const celebrity = await this.prisma.celebrityProfile.update({
        where: { userId },
        data: { isUnderReview: false, reviewStatus: 'APPROVED' },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      this.eventEmitter.emit('email.notification', {
        toName: celebrity.displayName,
        toEmail: user?.email || '',
        templateId: TemplateConfigEnum.Celebrity_Approved_Notification,
        params: {
          celebrityName: celebrity.displayName,
        },
      });
    } catch (error) {
      console.error('Error in approveUser:', error);
      throw new InternalServerErrorException('Failed to approve user');
    }
  }

  async rejectUser(userId: string): Promise<any> {
    try {
      const celebrity = await this.prisma.celebrityProfile.update({
        where: { userId },
        data: { isUnderReview: false, reviewStatus: 'REJECTED' },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      this.eventEmitter.emit('email.notification', {
        toName: celebrity.displayName,
        toEmail: user?.email || '',
        templateId: TemplateConfigEnum.Celebrity_Rejected_Notification,
        params: {
          celebrityName: celebrity.displayName,
        },
      });

      return { message: 'User rejected successfully' };
    } catch (error) {
      console.error('Error in rejectUser:', error);
      throw new InternalServerErrorException('Failed to reject user');
    }
  }
}
