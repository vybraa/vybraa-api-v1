import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class OnboardingStep1Dto {
  @IsString()
  legalName: string;

  @IsString()
  displayName: string;

  @IsEmail()
  email: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  countryCodeId: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  countryOfResidence: string;

  @IsEnum(['Tiktok', 'Instagram', 'Facebook'])
  primarySocialPlatform: string;

  @IsString()
  categoryId: string;

  @IsString()
  socialHandle: string;

  @IsString()
  followers: string;

  @IsOptional()
  @IsBoolean()
  isFirstTimeRegistration?: boolean;
}

export class OnboardingStep2Dto {
  @IsString()
  profilePhotoUrl: string;
}

export class OnboardingStep3Dto {
  @IsString()
  profession: string;
}

export class OnboardingStep4Dto {
  @IsOptional()
  @IsString()
  additionalDescription?: string;
}

export class OnboardingCompleteDto {
  @IsInt()
  @Min(1)
  @Max(4)
  currentStep: number;

  @IsOptional()
  @IsString()
  additionalDescription?: string;
}

export class OnboardingStatusDto {
  @IsInt()
  @Min(1)
  @Max(5)
  onboardingStep: number;

  @IsString()
  isOnboardingComplete: boolean;

  @IsString()
  isUnderReview: boolean;

  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  reviewStatus: string;
}
