import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFlutterKeyDto {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @IsString()
  @IsOptional()
  secret_key: string;
}

export class UpdateFlutterKeyDto extends PartialType(CreateFlutterKeyDto) {}
