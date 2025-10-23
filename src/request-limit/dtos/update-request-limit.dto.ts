import { IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class UpdateRequestLimitDto {
  @IsNumber()
  @Min(1)
  @Max(1000)
  monthlyLimit: number;

  @IsBoolean()
  isActive: boolean;
}
