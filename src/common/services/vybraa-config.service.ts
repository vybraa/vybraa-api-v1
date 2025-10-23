import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CalculationType, VybraaConfigSettings } from '@prisma/client';
import configuration from 'src/config/configuration';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VybraaConfigService {
  private readonly logger = new Logger(VybraaConfigService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getVybraaConfig(slug: string) {
    return await this.prisma.vybraaConfigSettings.findFirst({
      where: { slug },
    });
  }

  async createVybraaConfig(vybraaConfig: VybraaConfigSettings) {
    return this.prisma.vybraaConfigSettings.create({
      data: vybraaConfig,
    });
  }

  async evaluateRequestPrice(requestPrice: number, type: string = 'request') {
    const vybraaRequestFeeCharge = await this.getVybraaConfig(
      `${type}_fee_charge`,
    );
    if (!vybraaRequestFeeCharge) {
      throw new NotFoundException(
        `Vybraa ${type} fee charge configuration not found. Please ensure the '${type}_fee_charge' setting exists in vybraa_config_settings table. Run the seed script to initialize default settings.`,
      );
    }

    if (vybraaRequestFeeCharge.calculationType === CalculationType.PERCENTAGE) {
      const requestFeeCharge =
        requestPrice * (Number(vybraaRequestFeeCharge.value) / 100);

      this.logger.log(`Request fee charge: ${requestFeeCharge}`);
      this.logger.log(`Request price: ${requestPrice}`);
      this.logger.log(`Celebrity balance: ${requestPrice - requestFeeCharge}`);

      return {
        vybraaRequestFeeCharge: requestFeeCharge,
        celebrityBalance: requestPrice - requestFeeCharge,
      };
    }

    if (vybraaRequestFeeCharge.calculationType === CalculationType.FIXED) {
      const celebrityBalance =
        requestPrice - Number(vybraaRequestFeeCharge.value);
      return {
        vybraaRequestFeeCharge: Number(vybraaRequestFeeCharge.value),
        celebrityBalance: celebrityBalance,
      };
    }
  }

  async convertToBaseCurrency(amount: number, currency: string = 'usd') {
    console.log('currency', currency);
    console.log('base currency', configuration().baseCurrency);
    if (currency.toLowerCase() === 'usd') {
      return amount;
    } else {
      // Look up exchange rate from base currency (USD) to the given currency
      const exchangeRate = await this.prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: configuration().baseCurrency?.toUpperCase() || 'USD',
          toCurrency: currency.toUpperCase(),
        },
      });

      if (!exchangeRate) {
        throw new NotFoundException(
          `Exchange rate not found for ${configuration().baseCurrency?.toUpperCase() || 'USD'} to ${currency.toUpperCase()}. Please ensure exchange rates are properly configured in the database.`,
        );
      }

      // To convert from the given currency back to base currency (USD), we divide
      // Example: If rate is 1500 (1 USD = 1500 NGN), then 1500 NGN / 1500 = 1 USD
      return amount / Number(exchangeRate.rate);
    }
  }
}
