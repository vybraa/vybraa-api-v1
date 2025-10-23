import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ExchangeRateService } from './exchange_rate.service';
import { Admin } from 'src/decorators';
import {
  CreateExchangeRateDto,
  UpdateExchangeRateDto,
} from './dtos/exchange_rate.dto';
import { AdminGuard } from 'src/guards';

@Controller('exchange-rates')
@UseGuards(AdminGuard)
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Post()
  async createExchangeRate(
    @Body() createExchangeRateDto: CreateExchangeRateDto,
  ) {
    return this.exchangeRateService.createExchangeRate(createExchangeRateDto);
  }

  @Admin()
  @Get('get-exchange-rate')
  async getExchangeRate(
    @Query('fromCurrency') fromCurrency: string,
    @Query('toCurrency') toCurrency: string,
  ) {
    return this.exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
  }

  @Put(':id')
  async updateExchangeRate(
    @Param('id') id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ) {
    return this.exchangeRateService.updateExchangeRate(
      id,
      updateExchangeRateDto,
    );
  }
}
