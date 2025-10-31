import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { QueryActivityLogDto } from './dtos/query-activity-log.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserDecorator } from '../decorators';
import { User } from '@prisma/client';
import { Admin } from '../decorators';

@Controller('activity-logs')
@UseGuards(AuthGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * Get all activity logs (Admin only)
   */
  @Get()
  @Admin()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryActivityLogDto) {
    return this.activityLogsService.findAll(query);
  }

  /**
   * Get current user's activity logs
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyActivities(
    @UserDecorator() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    return this.activityLogsService.findByUserId(user.id, pageNum, limitNum);
  }

  /**
   * Get current user's activity summary
   */
  @Get('me/summary')
  @HttpCode(HttpStatus.OK)
  async getMyActivitySummary(@UserDecorator() user: User) {
    return this.activityLogsService.getUserActivitySummary(user.id);
  }

  /**
   * Get recent activities for current user
   */
  @Get('me/recent')
  @HttpCode(HttpStatus.OK)
  async getMyRecentActivities(
    @UserDecorator() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = parseInt(limit || '10', 10);
    return this.activityLogsService.getRecentActivities(user.id, limitNum);
  }

  /**
   * Get activity logs for a specific user (Admin only)
   */
  @Get('user/:userId')
  @Admin()
  @HttpCode(HttpStatus.OK)
  async getUserActivities(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    return this.activityLogsService.findByUserId(userId, pageNum, limitNum);
  }

  /**
   * Get activity summary for a specific user (Admin only)
   */
  @Get('user/:userId/summary')
  @Admin()
  @HttpCode(HttpStatus.OK)
  async getUserActivitySummary(@Param('userId') userId: string) {
    return this.activityLogsService.getUserActivitySummary(userId);
  }

  /**
   * Get activity logs for a specific entity (Admin only)
   */
  @Get('entity/:entityType/:entityId')
  @Admin()
  @HttpCode(HttpStatus.OK)
  async getEntityActivities(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.activityLogsService.findByEntity(entityType, entityId);
  }
}












