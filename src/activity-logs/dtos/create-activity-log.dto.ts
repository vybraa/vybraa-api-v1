import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ActivityAction } from '@prisma/client';

export class CreateActivityLogDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(ActivityAction)
  action: ActivityAction;

  @IsNotEmpty()
  @IsString()
  actionDescription: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}









