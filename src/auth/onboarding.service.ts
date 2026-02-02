import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import {
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStatusDto,
} from './dto/onboarding.dto';
import { FolderEnum } from 'src/utils/enum';
import configuration from 'src/config/configuration';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
    private httpService: HttpService,
  ) {}

  async checkOnboardingEligibility(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { celebrityProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.celebrityProfile) {
      return {
        canStart: false,
        currentStep: user.celebrityProfile.onboardingStep,
        isComplete: user.celebrityProfile.isOnboardingComplete,
        message: 'Onboarding already in progress or completed',
      };
    }

    if (user.userType === 'CELEBRITY') {
      return {
        canStart: true,
        currentStep: 0,
        isComplete: false,
        message: 'Ready to start onboarding',
      };
    }

    return {
      canStart: true,
      currentStep: 0,
      isComplete: false,
      message: 'Ready to start onboarding (will be converted to celebrity)',
      willConvertToCelebrity: true,
    };
  }

  async startOrCompleteStep1(
    userId: string | undefined,
    data: OnboardingStep1Dto,
  ): Promise<{ message: string; onboardingStep: number; accessToken: string }> {
    // Check if user exists
    const ipInfo = await this.httpService.axiosRef.get(
      configuration().ipinfoUrl,
    );

    const checkIfEmailExists = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (checkIfEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    // Handle first-time registration
    if (data.isFirstTimeRegistration) {
      // Update user information and set user type to CELEBRITY
      const user = await this.prisma.user.create({
        data: {
          firstName: data.legalName.split(' ')[0] || data.legalName,
          lastName: data.legalName.split(' ').slice(1).join(' ') || '',
          email: data.email,
          userType: 'CELEBRITY',
          ipAddressCountry: ipInfo.data.country || '',
        },
      });

      // Create celebrity profile with step 1 data
      const celebrityProfile = await this.prisma.celebrityProfile.create({
        data: {
          userId: user.id,
          legalName: data.legalName,
          displayName: data.displayName,
          dateOfBirth: new Date(data.dateOfBirth),
          categoryId: data.categoryId,
          countryCodeId: data.countryCodeId,
          phoneNumber: data.phoneNumber,
          countryOfResidence: data.countryOfResidence,
          primarySocialPlatform: data.primarySocialPlatform,
          socialHandle: data.socialHandle,
          followers: data.followers,
          profession: '',
          onboardingStep: 2, // Move to step 2 since step 1 is complete
          isOnboardingComplete: false,
          isUnderReview: false,
          reviewStatus: 'PENDING',
        },
      });

      // Generate access token for the user
      const payload = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        isVerified: user.isVerified,
        celebrityProfile,
      };
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.AUTH_JWT_SECRET,
        expiresIn: '24h',
      });

      return {
        message: 'Registration completed and onboarding started successfully!',
        onboardingStep: 2,
        accessToken,
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { celebrityProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle existing user onboarding
    if (user.userType !== 'CELEBRITY') {
      throw new ForbiddenException('Only celebrities can access onboarding');
    }

    // Check if profile already exists
    if (user.celebrityProfile) {
      // Validate step progression
      if (user.celebrityProfile.onboardingStep !== 1) {
        throw new BadRequestException(
          `Cannot complete step 1. Current step: ${user.celebrityProfile.onboardingStep}`,
        );
      }

      // Update profile with step 1 data
      const celebrityProfile = await this.prisma.celebrityProfile.update({
        where: { userId },
        data: {
          legalName: data.legalName,
          displayName: data.displayName,
          dateOfBirth: new Date(data.dateOfBirth),
          countryCodeId: data.countryCodeId,
          phoneNumber: data.phoneNumber,
          countryOfResidence: data.countryOfResidence,
          primarySocialPlatform: data.primarySocialPlatform,
          socialHandle: data.socialHandle,
          followers: data.followers,
          onboardingStep: 2,
        },
      });

      // Generate access token for the user
      const payload = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        isVerified: user.isVerified,
        celebrityProfile,
      };
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.AUTH_JWT_SECRET,
        expiresIn: '24h',
      });

      return {
        message: 'Step 1 completed successfully',
        onboardingStep: 2,
        accessToken,
      };
    }

    // Create initial celebrity profile for existing user
    const celebrityProfile = await this.prisma.celebrityProfile.create({
      data: {
        userId,
        legalName: data.legalName,
        displayName: data.displayName,
        dateOfBirth: new Date(data.dateOfBirth),
        countryCodeId: data.countryCodeId,
        phoneNumber: data.phoneNumber,
        countryOfResidence: data.countryOfResidence,
        primarySocialPlatform: data.primarySocialPlatform,
        socialHandle: data.socialHandle,
        followers: data.followers,
        categoryId: data.categoryId,
        profession: '',
        onboardingStep: 2, // Move to step 2 since step 1 is complete
        isOnboardingComplete: false,
        isUnderReview: false,
        reviewStatus: 'PENDING',
      },
    });

    // Generate access token for the user
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified,
      celebrityProfile,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.AUTH_JWT_SECRET,
      expiresIn: '24h',
    });

    return {
      message: 'Onboarding started and step 1 completed successfully',
      onboardingStep: 2,
      accessToken,
    };
  }

  async completeStep2(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{
    message: string;
    onboardingStep: number;
    accessToken: string;
    profilePhotoUrl: string;
  }> {
    console.log('Backend: completeStep2 called with userId:', userId);
    console.log('Backend: file object received:', file);
    console.log('Backend: file mimetype:', file?.mimetype);
    console.log('Backend: file size:', file?.size);
    console.log('Backend: file buffer exists:', !!file?.buffer);
    console.log('Backend: file originalname:', file?.originalname);

    const profile = await this.getCelebrityProfile(userId);

    if (profile.onboardingStep !== 2) {
      throw new BadRequestException(
        `Cannot complete step 2. Current step: ${profile.onboardingStep}`,
      );
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file to Cloudinary
    console.log('Backend: Uploading file to Cloudinary');
    const uploadResult = await this.cloudinaryService.uploadProfilePhoto(
      file,
      userId,
      FolderEnum.CELEBRITY_PROFILE,
    );
    console.log('Backend: File uploaded to Cloudinary successfully');

    // Update profile with profile photo URL and move to step 3
    await this.prisma.celebrityProfile.update({
      where: { userId },
      data: {
        profilePhotoUrl: uploadResult.secure_url,
        onboardingStep: 3,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { celebrityProfile: true },
    });

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified,
      celebrityProfile: user.celebrityProfile,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.AUTH_JWT_SECRET,
      expiresIn: '24h',
    });

    return {
      message: 'Step 2 completed successfully',
      onboardingStep: 3,
      accessToken,
      profilePhotoUrl: uploadResult.secure_url,
    };
  }

  async completeStep3(
    userId: string,
    data: OnboardingStep3Dto,
  ): Promise<{ message: string; onboardingStep: number; accessToken: string }> {
    const profile = await this.getCelebrityProfile(userId);

    if (profile.onboardingStep !== 3) {
      throw new BadRequestException(
        `Cannot complete step 3. Current step: ${profile.onboardingStep}`,
      );
    }

    await this.prisma.celebrityProfile.update({
      where: { userId },
      data: {
        profession: data.profession,
        onboardingStep: 4,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { celebrityProfile: true },
    });

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified,
      celebrityProfile: user.celebrityProfile,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.AUTH_JWT_SECRET,
      expiresIn: '24h',
    });

    return {
      message: 'Step 3 completed successfully',
      onboardingStep: 4,
      accessToken,
    };
  }

  async completeStep4(
    userId: string,
    data: OnboardingStep4Dto,
  ): Promise<{ message: string; onboardingStep: number; accessToken: string }> {
    const profile = await this.getCelebrityProfile(userId);

    if (profile.onboardingStep !== 4) {
      throw new BadRequestException(
        `Cannot complete step 4. Current step: ${profile.onboardingStep}`,
      );
    }

    await this.prisma.celebrityProfile.update({
      where: { userId },
      data: {
        additionalDescription: data.additionalDescription || '',
        onboardingStep: 5,
        isOnboardingComplete: true,
        isUnderReview: true,
      },
    });
    const currency = await this.prisma.currency.findFirst({
      where: {
        code: 'USD',
      },
    });
    if (currency) {
      await this.prisma.wallet.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          currency: {
            connect: {
              id: currency.id,
            },
          },
        },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { celebrityProfile: true },
    });

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified,
      celebrityProfile: user.celebrityProfile,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.AUTH_JWT_SECRET,
      expiresIn: '24h',
    });

    //Create a limit request for the celebrity
    await this.prisma.requestLimit.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        monthlyLimit: 20,
        currentMonthCount: 0,
        resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });
    return {
      message:
        'Onboarding completed successfully! Your profile is now under review.',
      onboardingStep: 5,
      accessToken,
    };
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatusDto> {
    const profile = await this.getCelebrityProfile(userId);

    return {
      onboardingStep: profile.onboardingStep,
      isOnboardingComplete: profile.isOnboardingComplete,
      isUnderReview: profile.isUnderReview,
      reviewStatus: profile.reviewStatus,
    };
  }

  async getOnboardingProgress(userId: string) {
    const profile = await this.getCelebrityProfile(userId);

    const totalSteps = 4;
    const progressPercentage = (profile.onboardingStep / totalSteps) * 100;

    const stepDetails = {
      step1: {
        completed: profile.onboardingStep >= 1,
        name: 'Personal Information',
      },
      step2: {
        completed: profile.onboardingStep >= 2,
        name: 'Profile Photo',
      },
      step3: {
        completed: profile.onboardingStep >= 3,
        name: 'Profession',
      },
      step4: {
        completed: profile.onboardingStep >= 4,
        name: 'Additional Details',
      },
    };

    const nextStepName =
      profile.onboardingStep < totalSteps
        ? stepDetails[
            `step${profile.onboardingStep + 1}` as keyof typeof stepDetails
          ]?.name
        : undefined;

    const estimatedTimeToComplete = this.calculateEstimatedTime(
      profile.onboardingStep,
    );

    return {
      currentStep: profile.onboardingStep,
      totalSteps,
      progressPercentage: Math.round(progressPercentage),
      stepDetails,
      nextStepName,
      estimatedTimeToComplete,
    };
  }

  private calculateEstimatedTime(currentStep: number): string {
    const stepEstimates = {
      1: '15-20 minutes',
      2: '5-10 minutes',
      3: '5-10 minutes',
      4: '5-10 minutes',
    };

    if (currentStep >= 4) {
      return 'Complete!';
    }

    return (
      stepEstimates[currentStep as keyof typeof stepEstimates] || 'Unknown'
    );
  }

  async getCelebrityProfile(userId: string) {
    const profile = await this.prisma.celebrityProfile.findUnique({
      where: { userId },
      include: {
        countryCode: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Celebrity profile not found. Please start onboarding first.',
      );
    }

    return profile;
  }

  async getFullProfile(userId: string) {
    const profile = await this.prisma.celebrityProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
            isVerified: true,
            createdAt: true,
          },
        },
        countryCode: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Celebrity profile not found');
    }

    return profile;
  }

  async updateReviewStatus(
    userId: string,
    status: 'APPROVED' | 'REJECTED',
    adminNotes?: string,
  ): Promise<{ message: string }> {
    const profile = await this.getCelebrityProfile(userId);

    if (!profile.isUnderReview) {
      throw new BadRequestException('Profile is not currently under review');
    }

    await this.prisma.celebrityProfile.update({
      where: { userId },
      data: {
        reviewStatus: status,
        isUnderReview: false,
        // Add admin notes if needed
      },
    });

    if (status === 'APPROVED') {
      // Update user verification status
      await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      return { message: 'Profile approved successfully' };
    } else {
      return { message: 'Profile review completed' };
    }
  }

  async resetOnboarding(userId: string): Promise<{ message: string }> {
    const profile = await this.getCelebrityProfile(userId);

    // Delete profile photo from Cloudinary if it exists
    if (profile.profilePhotoUrl) {
      try {
        // Extract public ID from URL
        const urlParts = profile.profilePhotoUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        console.log('Failed to delete profile photo from Cloudinary:', error);
      }
    }

    await this.prisma.celebrityProfile.update({
      where: { userId },
      data: {
        onboardingStep: 1,
        isOnboardingComplete: false,
        isUnderReview: false,
        reviewStatus: 'PENDING',
        profilePhotoUrl: null,
      },
    });

    return { message: 'Onboarding reset successfully' };
  }

  async getPendingReviews(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.prisma.celebrityProfile.findMany({
        where: {
          isUnderReview: true,
          reviewStatus: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.celebrityProfile.count({
        where: {
          isUnderReview: true,
          reviewStatus: 'PENDING',
        },
      }),
    ]);

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
