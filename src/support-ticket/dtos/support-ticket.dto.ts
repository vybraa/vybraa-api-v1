import { SupportTicketCategory, SupportTicketPriority } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(SupportTicketPriority)
  priority: SupportTicketPriority;

  @IsNotEmpty()
  @IsEnum(SupportTicketCategory)
  category: SupportTicketCategory;
}
