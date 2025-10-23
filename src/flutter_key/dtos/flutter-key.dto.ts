import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFlutterKeyDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}

export class UpdateFlutterKeyDto {
  @IsString()
  @IsOptional()
  key?: string;
}

