import { CountryCode } from '../../common/entities/country-code.entity';

export class OnboardingStep1Response {
  message: string;
  onboardingStep: number;
  data: {
    legalName: string;
    displayName: string;
    email: string;
    dateOfBirth: string;
    countryCode: CountryCode;
    phoneNumber: string;
    countryOfResidence: string;
    primarySocialPlatform: string;
    socialHandle: string;
    followers: string;
  };
}

export class OnboardingStep2Response {
  message: string;
  onboardingStep: number;
  data: {
    profilePhotoUrl: string;
  };
}

export class OnboardingStep3Response {
  message: string;
  onboardingStep: number;
  data: {
    profession: string;
  };
}

export class OnboardingStep4Response {
  message: string;
  onboardingStep: number;
  data: {
    additionalDescription?: string;
  };
}

export class OnboardingStatusResponse {
  onboardingStep: number;
  isOnboardingComplete: boolean;
  isUnderReview: boolean;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  nextStep?: string;
  estimatedCompletionTime?: string;
}

export class CelebrityProfileResponse {
  id: string;
  userId: string;
  legalName: string;
  displayName: string;
  dateOfBirth: Date;
  countryCode: CountryCode;
  phoneNumber: string;
  countryOfResidence: string;
  primarySocialPlatform: string;
  socialHandle: string;
  followers: string;
  profilePhotoUrl?: string;
  profession: string;
  additionalDescription?: string;
  onboardingStep: number;
  isOnboardingComplete: boolean;
  isUnderReview: boolean;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: 'FAN' | 'CELEBRITY';
    isVerified: boolean;
    createdAt: Date;
  };
}

export class OnboardingProgressResponse {
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  stepDetails: {
    step1: { completed: boolean; name: string };
    step2: { completed: boolean; name: string };
    step3: { completed: boolean; name: string };
    step4: { completed: boolean; name: string };
  };
  nextStepName?: string;
  estimatedTimeToComplete?: string;
}
