import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { AuthGuard } from 'src/guards';
import { ProfileService } from './profile.service';
import { UserDecorator } from 'src/decorators';
import { User } from '@prisma/client';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get('explore')
  async getMe(
    @UserDecorator() user: User,
    @Query('category') category: string = 'all',
  ) {
    console.log('user', user);
    return await this.profileService.getMe(user, category);
  }

  @Get(':id')
  async getCelebrityProfile(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ) {
    return await this.profileService.getCelebrityProfile(id, user);
  }
}
