import { Controller, Get, Param, Query } from '@nestjs/common';
import { CountryCodeService } from '../services/country-code.service';
import { CountryCode } from '../entities/country-code.entity';
import { Public } from 'src/decorators/auth.decorator';

@Controller('country-codes')
export class CountryCodeController {
  constructor(private readonly countryCodeService: CountryCodeService) {}

  @Get()
  @Public()
  async findAll(): Promise<CountryCode[]> {
    return this.countryCodeService.findAll();
  }

  @Get('search')
  async searchByName(@Query('name') name: string): Promise<CountryCode[]> {
    return this.countryCodeService.searchByName(name);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CountryCode | null> {
    return this.countryCodeService.findById(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<CountryCode | null> {
    return this.countryCodeService.findByCode(code);
  }

  @Get('dial/:dialCode')
  async findByDialCode(
    @Param('dialCode') dialCode: string,
  ): Promise<CountryCode | null> {
    return this.countryCodeService.findByDialCode(dialCode);
  }
}
