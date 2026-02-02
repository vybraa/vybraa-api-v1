import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { RegisterDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(RegisterDto) {
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
