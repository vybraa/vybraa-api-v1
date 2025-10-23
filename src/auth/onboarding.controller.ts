import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';
import { AuthGuard } from '../guards/auth.guard';
import {
  OnboardingStep1Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
} from './dto/onboarding.dto';
import { Public } from 'src/decorators/auth.decorator';

@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('start')
  @Public()
  async startOnboarding(@Request() req: any, @Body() data: OnboardingStep1Dto) {
    const userId = req && req.user && req.user.id ? req.user.id : undefined;
    return this.onboardingService.startOrCompleteStep1(userId, data);
  }

  @Put('step2')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  async completeStep2(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req && req.user ? req.user.id : undefined;
    return this.onboardingService.completeStep2(userId, file);
  }

  @Put('step3')
  async completeStep3(@Request() req: any, @Body() data: OnboardingStep3Dto) {
    console.log('data', data);
    const userId = req.user.id;
    return this.onboardingService.completeStep3(userId, data);
  }

  @Put('step4')
  async completeStep4(@Request() req: any, @Body() data: OnboardingStep4Dto) {
    const userId = req.user.id;
    return this.onboardingService.completeStep4(userId, data);
  }

  @Get('status')
  async getOnboardingStatus(@Request() req: any) {
    const userId = req.user.id;
    return this.onboardingService.getOnboardingStatus(userId);
  }

  @Get('progress')
  async getOnboardingProgress(@Request() req: any) {
    const userId = req.user.id;
    return this.onboardingService.getOnboardingProgress(userId);
  }

  @Get('profile')
  async getCelebrityProfile(@Request() req: any) {
    const userId = req.user.id;
    return this.onboardingService.getFullProfile(userId);
  }

  @Post('reset')
  async resetOnboarding(@Request() req: any) {
    const userId = req.user.id;
    return this.onboardingService.resetOnboarding(userId);
  }

  @Get('eligibility')
  async checkEligibility(@Request() req: any) {
    const userId = req.user.id;
    return this.onboardingService.checkOnboardingEligibility(userId);
  }
}
