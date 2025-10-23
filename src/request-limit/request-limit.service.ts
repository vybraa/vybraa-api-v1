import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRequestLimitDto } from './dtos/update-request-limit.dto';

@Injectable()
export class RequestLimitService {
  constructor(private prisma: PrismaService) {}

  async getRequestLimit(userId: string) {
    let requestLimit = await this.prisma.requestLimit.findUnique({
      where: { userId },
    });

    // If no limit exists, create a default one
    if (!requestLimit) {
      requestLimit = await this.prisma.requestLimit.create({
        data: {
          userId,
          monthlyLimit: 10,
          currentMonthCount: 0,
          resetDate: this.getNextResetDate(),
          isActive: true,
        },
      });
    }

    // Check if we need to reset the monthly count
    const now = new Date();
    const resetDate = new Date(requestLimit.resetDate);

    if (now >= resetDate) {
      requestLimit = await this.prisma.requestLimit.update({
        where: { id: requestLimit.id },
        data: {
          currentMonthCount: 0,
          resetDate: this.getNextResetDate(),
        },
      });
    }

    return {
      status: true,
      message: 'Request limit retrieved successfully',
      data: requestLimit,
    };
  }

  async updateRequestLimit(userId: string, updateData: UpdateRequestLimitDto) {
    const existingLimit = await this.prisma.requestLimit.findUnique({
      where: { userId },
    });

    if (!existingLimit) {
      const newLimit = await this.prisma.requestLimit.create({
        data: {
          userId,
          monthlyLimit: updateData.monthlyLimit,
          currentMonthCount: 0,
          resetDate: this.getNextResetDate(),
          isActive: updateData.isActive,
        },
      });

      return {
        status: true,
        message: 'Request limit created successfully',
        data: newLimit,
      };
    }

    const updatedLimit = await this.prisma.requestLimit.update({
      where: { userId },
      data: {
        monthlyLimit: updateData.monthlyLimit,
        isActive: updateData.isActive,
      },
    });

    return {
      status: true,
      message: 'Request limit updated successfully',
      data: updatedLimit,
    };
  }

  async getRequestStats(userId: string) {
    const requestLimit = await this.getRequestLimit(userId);
    const limitData = requestLimit.data;

    const remainingRequests = Math.max(
      0,
      limitData.monthlyLimit - limitData.currentMonthCount,
    );

    return {
      status: true,
      message: 'Request stats retrieved successfully',
      data: {
        currentMonthCount: limitData.currentMonthCount,
        monthlyLimit: limitData.monthlyLimit,
        remainingRequests,
        resetDate: limitData.resetDate,
      },
    };
  }

  async canMakeRequest(userId: string) {
    const requestLimit = await this.getRequestLimit(userId);
    const limitData = requestLimit.data;

    if (!limitData.isActive) {
      return {
        status: true,
        message: 'Request limits are disabled',
        data: {
          canMakeRequest: true,
          remainingRequests: -1, // Unlimited
          monthlyLimit: limitData.monthlyLimit,
        },
      };
    }

    const canMakeRequest = limitData.currentMonthCount < limitData.monthlyLimit;
    const remainingRequests = Math.max(
      0,
      limitData.monthlyLimit - limitData.currentMonthCount,
    );

    return {
      status: true,
      message: 'Request limit check completed',
      data: {
        canMakeRequest,
        remainingRequests,
        monthlyLimit: limitData.monthlyLimit,
      },
    };
  }

  async incrementRequestCount(userId: string) {
    const requestLimit = await this.getRequestLimit(userId);
    const limitData = requestLimit.data;

    if (
      limitData.isActive &&
      limitData.currentMonthCount >= limitData.monthlyLimit
    ) {
      throw new Error('Monthly request limit exceeded');
    }

    const updatedLimit = await this.prisma.requestLimit.update({
      where: { userId },
      data: {
        currentMonthCount: {
          increment: 1,
        },
      },
    });

    return updatedLimit;
  }

  private getNextResetDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth;
  }
}
