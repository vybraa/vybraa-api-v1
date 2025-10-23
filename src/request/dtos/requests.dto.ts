import { RecipientEnum, RequestOccasion, RequestStatus } from '@prisma/client';
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
