import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { RequestLimitService } from './request-limit.service';
import { AuthGuard } from 'src/guards';
import { UserDecorator } from 'src/decorators';
import { User } from '@prisma/client';
import { UpdateRequestLimitDto } from './dtos/update-request-limit.dto';

@Controller('request-limits')
@UseGuards(AuthGuard)
export class RequestLimitController {
  constructor(private readonly requestLimitService: RequestLimitService) {}

  @Get()
  async getRequestLimit(@UserDecorator() user: User) {
    return this.requestLimitService.getRequestLimit(user.id);
  }

  @Put()
  async updateRequestLimit(
    @UserDecorator() user: User,
    @Body() updateRequestLimitDto: UpdateRequestLimitDto,
  ) {
    return this.requestLimitService.updateRequestLimit(
      user.id,
      updateRequestLimitDto,
    );
  }

  @Get('stats')
  async getRequestStats(@UserDecorator() user: User) {
    return this.requestLimitService.getRequestStats(user.id);
  }

  @Get('check')
  async canMakeRequest(@UserDecorator() user: User) {
    return this.requestLimitService.canMakeRequest(user.id);
  }
}
