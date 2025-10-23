import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const currencies = [
  // Major Reserve Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },

  // European Currencies
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalPlaces: 2 },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimalPlaces: 2 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimalPlaces: 2 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimalPlaces: 0 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimalPlaces: 2 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', decimalPlaces: 2 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', decimalPlaces: 2 },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', decimalPlaces: 2 },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', decimalPlaces: 2 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimalPlaces: 2 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimalPlaces: 2 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimalPlaces: 2 },

  // Asian Currencies
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2 },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', decimalPlaces: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalPlaces: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalPlaces: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalPlaces: 0 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimalPlaces: 0 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimalPlaces: 2 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimalPlaces: 2 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', decimalPlaces: 2 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', decimalPlaces: 2 },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', decimalPlaces: 2 },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', decimalPlaces: 2 },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', decimalPlaces: 2 },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', decimalPlaces: 2 },

  // Middle Eastern & African Currencies
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimalPlaces: 2 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimalPlaces: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimalPlaces: 3 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', decimalPlaces: 3 },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', decimalPlaces: 3 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', decimalPlaces: 3 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimalPlaces: 2 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', decimalPlaces: 2 },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimalPlaces: 3 },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', decimalPlaces: 2 },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', decimalPlaces: 3 },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', decimalPlaces: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimalPlaces: 2 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', decimalPlaces: 2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimalPlaces: 2 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimalPlaces: 0 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimalPlaces: 0 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2 },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', decimalPlaces: 2 },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', decimalPlaces: 2 },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', decimalPlaces: 2 },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', decimalPlaces: 2 },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', decimalPlaces: 2 },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', decimalPlaces: 2 },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', decimalPlaces: 2 },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', decimalPlaces: 0 },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', decimalPlaces: 0 },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimalPlaces: 2 },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', decimalPlaces: 0 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimalPlaces: 0 },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', decimalPlaces: 0 },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', decimalPlaces: 2 },
  {
    code: 'XAF',
    name: 'Central African CFA Franc',
    symbol: 'FCFA',
    decimalPlaces: 0,
  },
  {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    decimalPlaces: 0,
  },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', decimalPlaces: 0 },

  // Americas Currencies
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalPlaces: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2 },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', decimalPlaces: 2 },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', decimalPlaces: 0 },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', decimalPlaces: 2 },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', decimalPlaces: 2 },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', decimalPlaces: 2 },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', decimalPlaces: 0 },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', decimalPlaces: 2 },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', decimalPlaces: 2 },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', decimalPlaces: 2 },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', decimalPlaces: 2 },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', decimalPlaces: 2 },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', decimalPlaces: 2 },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', decimalPlaces: 2 },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', decimalPlaces: 2 },
  {
    code: 'TTD',
    name: 'Trinidad and Tobago Dollar',
    symbol: 'TT$',
    decimalPlaces: 2,
  },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', decimalPlaces: 2 },
  {
    code: 'XCD',
    name: 'East Caribbean Dollar',
    symbol: 'EC$',
    decimalPlaces: 2,
  },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', decimalPlaces: 2 },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', decimalPlaces: 2 },
  { code: 'CUP', name: 'Cuban Peso', symbol: '$', decimalPlaces: 2 },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', decimalPlaces: 2 },

  // Oceania Currencies
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalPlaces: 2 },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', decimalPlaces: 2 },
  {
    code: 'PGK',
    name: 'Papua New Guinean Kina',
    symbol: 'K',
    decimalPlaces: 2,
  },
  {
    code: 'SBD',
    name: 'Solomon Islands Dollar',
    symbol: 'SI$',
    decimalPlaces: 2,
  },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', decimalPlaces: 0 },
  { code: 'WST', name: 'Samoan Tālā', symbol: 'T', decimalPlaces: 2 },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', decimalPlaces: 2 },
  { code: 'KID', name: 'Kiribati Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$', decimalPlaces: 2 },

  // Cryptocurrencies
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimalPlaces: 8 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimalPlaces: 18 },
  { code: 'USDT', name: 'Tether', symbol: '₮', decimalPlaces: 2 },
  { code: 'USDC', name: 'USD Coin', symbol: '$', decimalPlaces: 2 },
  { code: 'BNB', name: 'Binance Coin', symbol: 'BNB', decimalPlaces: 8 },
];

async function main() {
  console.log('🌍 Starting currency seeding...');

  for (const currency of currencies) {
    try {
      await prisma.currency.upsert({
        where: { code: currency.code },
        update: currency,
        create: currency,
      });
      console.log(`✅ Seeded currency: ${currency.code} - ${currency.name}`);
    } catch (error) {
      console.error(`❌ Error seeding currency ${currency.code}:`, error);
    }
  }

  console.log('🎉 Currency seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
