import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  Body,
  Param,
  Put,
} from '@nestjs/common';

import { AdminGuard } from '../guards/admin.guard';
import { Admin } from 'src/decorators';
import { AdminService } from './admin.service';
import { Pagination } from 'src/types/pagination';
import { User } from '@prisma/client';
import { UpdatUserProfileDto } from './admin.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Admin()
  @Get('users')
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search: string,
  ): Promise<Pagination<Partial<User>>> {
    return await this.adminService.getUsers(page, limit, search);
  }

  @Admin()
  @Get('metrics')
  async getMetrics(): Promise<any> {
    return await this.adminService.getMetrics();
  }

  @Admin()
  @Patch('users/:id')
  async updateUserProfile(
    @Param('id') id: string,
    @Body() user: UpdatUserProfileDto,
  ): Promise<any> {
    return await this.adminService.updateUserProfile(id, user);
  }

  @Admin()
  @Put('users/:id')
  async verifyUser(@Param('id') id: string): Promise<any> {
    return await this.adminService.verifyUser(id);
  }

  @Admin()
  @Put('users/:userId/approve')
  async ApproveUser(@Param('userId') userId: string): Promise<any> {
    return await this.adminService.approveUser(userId);
  }

  @Admin()
  @Put('users/:userId/reject')
  async RejectUser(@Param('userId') userId: string): Promise<any> {
    return await this.adminService.rejectUser(userId);
  }
}
