/**
 * Currency Code to Flag Code Mapping
 * Maps ISO 4217 currency codes to ISO 3166-1 alpha-2 country codes for flag display
 *
 * Note: Some currencies are used by multiple countries, so we map to the primary/issuing country
 */

export const CURRENCY_TO_FLAG_MAP: Record<string, string> = {
  // Major Reserve Currencies
  USD: 'us', // United States
  EUR: 'eu', // European Union (special case)
  GBP: 'gb', // United Kingdom
  JPY: 'jp', // Japan
  CHF: 'ch', // Switzerland
  CAD: 'ca', // Canada
  AUD: 'au', // Australia
  CNY: 'cn', // China

  // European Currencies
  SEK: 'se', // Sweden
  NOK: 'no', // Norway
  DKK: 'dk', // Denmark
  PLN: 'pl', // Poland
  CZK: 'cz', // Czech Republic
  HUF: 'hu', // Hungary
  RON: 'ro', // Romania
  BGN: 'bg', // Bulgaria
  HRK: 'hr', // Croatia
  RSD: 'rs', // Serbia
  UAH: 'ua', // Ukraine
  RUB: 'ru', // Russia
  TRY: 'tr', // Turkey
  ILS: 'il', // Israel

  // Asian Currencies
  KRW: 'kr', // South Korea
  SGD: 'sg', // Singapore
  HKD: 'hk', // Hong Kong
  TWD: 'tw', // Taiwan
  THB: 'th', // Thailand
  MYR: 'my', // Malaysia
  IDR: 'id', // Indonesia
  PHP: 'ph', // Philippines
  VND: 'vn', // Vietnam
  INR: 'in', // India
  PKR: 'pk', // Pakistan
  BDT: 'bd', // Bangladesh
  LKR: 'lk', // Sri Lanka
  NPR: 'np', // Nepal
  MMK: 'mm', // Myanmar
  KHR: 'kh', // Cambodia
  LAK: 'la', // Laos
  MNT: 'mn', // Mongolia

  // Middle Eastern & African Currencies
  AED: 'ae', // UAE
  SAR: 'sa', // Saudi Arabia
  QAR: 'qa', // Qatar
  KWD: 'kw', // Kuwait
  BHD: 'bh', // Bahrain
  OMR: 'om', // Oman
  JOD: 'jo', // Jordan
  EGP: 'eg', // Egypt
  MAD: 'ma', // Morocco
  TND: 'tn', // Tunisia
  DZD: 'dz', // Algeria
  LYD: 'ly', // Libya
  SDG: 'sd', // Sudan
  NGN: 'ng', // Nigeria
  GHS: 'gh', // Ghana
  KES: 'ke', // Kenya
  UGX: 'ug', // Uganda
  TZS: 'tz', // Tanzania
  ZAR: 'za', // South Africa
  NAD: 'na', // Namibia
  BWP: 'bw', // Botswana
  ZMW: 'zm', // Zambia
  MWK: 'mw', // Malawi
  MZN: 'mz', // Mozambique
  MUR: 'mu', // Mauritius
  SCR: 'sc', // Seychelles
  KMF: 'km', // Comoros
  DJF: 'dj', // Djibouti
  ETB: 'et', // Ethiopia
  SOS: 'so', // Somalia
  RWF: 'rw', // Rwanda
  BIF: 'bi', // Burundi
  CDF: 'cd', // Democratic Republic of Congo
  XAF: 'cm', // Central African CFA (Cameroon as representative)
  XOF: 'sn', // West African CFA (Senegal as representative)
  XPF: 'pf', // CFP Franc (French Polynesia as representative)

  // Americas Currencies
  MXN: 'mx', // Mexico
  BRL: 'br', // Brazil
  ARS: 'ar', // Argentina
  CLP: 'cl', // Chile
  COP: 'co', // Colombia
  PEN: 'pe', // Peru
  UYU: 'uy', // Uruguay
  PYG: 'py', // Paraguay
  BOB: 'bo', // Bolivia
  GTQ: 'gt', // Guatemala
  HNL: 'hn', // Honduras
  NIO: 'ni', // Nicaragua
  CRC: 'cr', // Costa Rica
  PAB: 'pa', // Panama
  DOP: 'do', // Dominican Republic
  JMD: 'jm', // Jamaica
  TTD: 'tt', // Trinidad and Tobago
  BBD: 'bb', // Barbados
  XCD: 'ag', // East Caribbean (Antigua and Barbuda as representative)
  GYD: 'gy', // Guyana
  SRD: 'sr', // Suriname
  VES: 've', // Venezuela
  CUP: 'cu', // Cuba
  HTG: 'ht', // Haiti

  // Oceania Currencies
  NZD: 'nz', // New Zealand
  FJD: 'fj', // Fiji
  PGK: 'pg', // Papua New Guinea
  SBD: 'sb', // Solomon Islands
  VUV: 'vu', // Vanuatu
  WST: 'ws', // Samoa
  TOP: 'to', // Tonga
  KID: 'ki', // Kiribati
  TVD: 'tv', // Tuvalu

  // Cryptocurrencies (using generic or representative flags)
  BTC: 'btc', // Bitcoin (special case)
  ETH: 'eth', // Ethereum (special case)
  USDT: 'us', // Tether (US-based)
  USDC: 'us', // USD Coin (US-based)
  BNB: 'bn', // Binance Coin (Brunei as representative)
};

/**
 * Get flag code for a currency code
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @returns ISO 3166-1 alpha-2 country code for flag display
 */
export function getFlagCodeForCurrency(currencyCode: string): string {
  const flagCode = CURRENCY_TO_FLAG_MAP[currencyCode.toUpperCase()];

  if (!flagCode) {
    // Fallback to currency code if no mapping found
    return currencyCode.toLowerCase();
  }

  return flagCode;
}

/**
 * Check if a currency code has a valid flag mapping
 * @param currencyCode - ISO 4217 currency code
 * @returns boolean indicating if flag mapping exists
 */
export function hasFlagMapping(currencyCode: string): boolean {
  return currencyCode.toUpperCase() in CURRENCY_TO_FLAG_MAP;
}

/**
 * Get all available currency codes that have flag mappings
 * @returns Array of currency codes with flag mappings
 */
export function getCurrenciesWithFlags(): string[] {
  return Object.keys(CURRENCY_TO_FLAG_MAP);
}

/**
 * Get flag code for Euro (special case - EU flag)
 * @returns 'eu' for European Union flag
 */
export function getEuroFlagCode(): string {
  return 'eu';
}

/**
 * Get flag code for USD (United States)
 * @returns 'us' for United States flag
 */
export function getUSDFlagCode(): string {
  return 'us';
}

/**
 * Get flag code for cryptocurrencies
 * @param cryptoCode - Cryptocurrency code (e.g., 'BTC', 'ETH')
 * @returns Appropriate flag code or fallback
 */
export function getCryptoFlagCode(cryptoCode: string): string {
  const code = cryptoCode.toUpperCase();

  switch (code) {
    case 'BTC':
      return 'btc'; // Bitcoin special case
    case 'ETH':
      return 'eth'; // Ethereum special case
    case 'USDT':
    case 'USDC':
      return 'us'; // US-based stablecoins
    case 'BNB':
      return 'bn'; // Binance (Brunei)
    default:
      return 'crypto'; // Generic crypto fallback
  }
}
