import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction, ActivityLog, Prisma } from '@prisma/client';
import { CreateActivityLogDto } from './dtos/create-activity-log.dto';
import { QueryActivityLogDto } from './dtos/query-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an activity log entry
   */
  async create(data: CreateActivityLogDto): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        actionDescription: data.actionDescription,
        entityType: data.entityType,
        entityId: data.entityId,
        recipientId: data.recipientId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            userType: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Log user login
   */
  async logLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    return this.create({
      userId,
      action: ActivityAction.USER_LOGIN,
      actionDescription: 'User logged in',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log user logout
   */
  async logLogout(userId: string): Promise<ActivityLog> {
    return this.create({
      userId,
      action: ActivityAction.USER_LOGOUT,
      actionDescription: 'User logged out',
    });
  }

  /**
   * Log request creation
   */
  async logRequestCreated(
    userId: string,
    requestId: string,
    celebrityId: string,
    metadata?: any,
  ): Promise<ActivityLog> {
    return this.create({
      userId,
      action: ActivityAction.REQUEST_CREATED,
      actionDescription: 'Created a new request',
      entityType: 'Request',
      entityId: requestId,
      recipientId: celebrityId,
      metadata,
    });
  }

  /**
   * Log request status change (celebrity accepting/declining)
   */
  async logRequestStatusChange(
    celebrityUserId: string,
    requestId: string,
    fanUserId: string,
    action: ActivityAction,
    previousStatus: string,
    newStatus: string,
  ): Promise<ActivityLog> {
    const actionDescriptions = {
      [ActivityAction.REQUEST_ACCEPTED]: 'Accepted request',
      [ActivityAction.REQUEST_DECLINED]: 'Declined request',
      [ActivityAction.REQUEST_COMPLETED]: 'Completed request',
      [ActivityAction.REQUEST_CANCELLED]: 'Cancelled request',
    };

    return this.create({
      userId: celebrityUserId,
      action,
      actionDescription: actionDescriptions[action] || 'Updated request status',
      entityType: 'Request',
      entityId: requestId,
      recipientId: fanUserId,
      metadata: {
        previousStatus,
        newStatus,
        changedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log video upload
   */
  async logVideoUploaded(
    celebrityUserId: string,
    requestId: string,
    fanUserId: string,
    videoUrl: string,
  ): Promise<ActivityLog> {
    return this.create({
      userId: celebrityUserId,
      action: ActivityAction.REQUEST_VIDEO_UPLOADED,
      actionDescription: 'Uploaded video for request',
      entityType: 'Request',
      entityId: requestId,
      recipientId: fanUserId,
      metadata: {
        videoUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log payment activity
   */
  async logPayment(
    userId: string,
    action: ActivityAction,
    paymentReference: string,
    amount: number,
    currency: string,
    requestId?: string,
    metadata?: any,
  ): Promise<ActivityLog> {
    const actionDescriptions = {
      [ActivityAction.PAYMENT_INITIATED]: 'Initiated payment',
      [ActivityAction.PAYMENT_COMPLETED]: 'Payment completed successfully',
      [ActivityAction.PAYMENT_FAILED]: 'Payment failed',
      [ActivityAction.PAYMENT_REFUNDED]: 'Payment refunded',
    };

    return this.create({
      userId,
      action,
      actionDescription: actionDescriptions[action] || 'Payment activity',
      entityType: 'Payment',
      entityId: paymentReference,
      metadata: {
        ...metadata,
        amount,
        currency,
        requestId,
      },
    });
  }

  /**
   * Find all activity logs with filters
   */
  async findAll(query: QueryActivityLogDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userType: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find activity logs for a specific user
   */
  async findByUserId(userId: string, page: number = 1, limit: number = 50) {
    return this.findAll({
      userId,
      page: page.toString(),
      limit: limit.toString(),
    });
  }

  /**
   * Find activity logs for a specific entity
   */
  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            userType: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string) {
    const [totalActivities, loginCount, requestActivities, paymentActivities] =
      await Promise.all([
        this.prisma.activityLog.count({ where: { userId } }),
        this.prisma.activityLog.count({
          where: { userId, action: ActivityAction.USER_LOGIN },
        }),
        this.prisma.activityLog.count({
          where: {
            userId,
            action: {
              in: [
                ActivityAction.REQUEST_CREATED,
                ActivityAction.REQUEST_ACCEPTED,
                ActivityAction.REQUEST_DECLINED,
                ActivityAction.REQUEST_COMPLETED,
              ],
            },
          },
        }),
        this.prisma.activityLog.count({
          where: {
            userId,
            action: {
              in: [
                ActivityAction.PAYMENT_INITIATED,
                ActivityAction.PAYMENT_COMPLETED,
                ActivityAction.PAYMENT_FAILED,
              ],
            },
          },
        }),
      ]);

    return {
      userId,
      totalActivities,
      loginCount,
      requestActivities,
      paymentActivities,
    };
  }

  /**
   * Get recent activities for a user
   */
  async getRecentActivities(userId: string, limit: number = 10) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Delete old activity logs (for cleanup/GDPR compliance)
   */
  async deleteOldLogs(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
