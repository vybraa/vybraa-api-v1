import { RecipientEnum, RequestOccasion, RequestStatus, VideoReviewUrlStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestsDto {
  @IsString()
  @IsNotEmpty()
  celebrityProfileId: string;

  @IsEnum(RequestOccasion)
  @IsNotEmpty()
  occasion: RequestOccasion;

  @IsEnum(RecipientEnum)
  @IsOptional()
  recipient: RecipientEnum;

  @IsString()
  @IsOptional()
  forName: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;
}

export class ChangeRequestStatusDto {
  @IsEnum(RequestStatus)
  @IsNotEmpty()
  status: RequestStatus;
}

export class UpdateRequestScriptDto {
  @IsString()
  @IsOptional()
  suggestedAiVideoScript?: string;

  @IsEnum(VideoReviewUrlStatus)
  @IsOptional()
  videoReviewUrlStatus?: VideoReviewUrlStatus;
}

export class UpdateVideoReviewStatusDto {
  @IsEnum(VideoReviewUrlStatus)
  @IsNotEmpty()
  status: VideoReviewUrlStatus;
}
