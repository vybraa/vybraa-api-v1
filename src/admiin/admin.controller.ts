import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { AdminGuard } from '../guards/admin.guard';
import { Admin } from 'src/decorators';
import { AdminService } from './admin.service';
import { Pagination } from 'src/types/pagination';
import { User } from '@prisma/client';

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
  ): Promise<Pagination<User>> {
    return await this.adminService.getUsers(page, limit, search);
  }

  @Admin()
  @Get('metrics')
  async getMetrics(): Promise<any> {
    return await this.adminService.getMetrics();
  }
}
