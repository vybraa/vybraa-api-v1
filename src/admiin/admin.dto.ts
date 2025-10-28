import { RegisterDto } from 'src/auth/dto/create-auth.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

export class UpdatUserProfileDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  countryCodeId: string;

  @IsString()
  @IsOptional()
  countryOfResidence: string;

  @IsString()
  @IsOptional()
  primarySocialPlatform: string;

  @IsString()
  @IsOptional()
  socialHandle: string;

  @IsString()
  @IsOptional()
  followers: string;

  @IsString()
  @IsOptional()
  profilePhotoUrl: string;

  @IsString()
  @IsOptional()
  managerName: string;

  @IsString()
  @IsOptional()
  managerPhone: string;
}
