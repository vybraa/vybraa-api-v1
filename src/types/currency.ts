/**
 * Currency-related TypeScript interfaces
 */

export interface Currency {
  id: string;
  code: string; // ISO 4217 currency code (e.g., 'USD', 'EUR')
  name: string; // Full currency name (e.g., 'US Dollar', 'Euro')
  symbol: string; // Currency symbol (e.g., '$', '€', '£')
  decimalPlaces: number; // Number of decimal places (e.g., 2 for USD, 0 for JPY)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string; // Base currency (usually USD)
  toCurrency: string; // Target currency
  rate: number; // Exchange rate value
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyWithFlag extends Currency {
  flagCode: string; // ISO 3166-1 alpha-2 country code for flag display
}

export interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface ExchangeRateFormData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  isActive: boolean;
}

// Currency categories for organization
export enum CurrencyCategory {
  RESERVE = 'reserve',
  EUROPEAN = 'european',
  ASIAN = 'asian',
  MIDDLE_EASTERN_AFRICAN = 'middle_eastern_african',
  AMERICAS = 'americas',
  OCEANIA = 'oceania',
  CRYPTO = 'crypto',
}

export interface CurrencyCategoryInfo {
  category: CurrencyCategory;
  name: string;
  description: string;
  currencies: string[]; // Array of currency codes in this category
}

// Flag mapping types
export interface CurrencyFlagMapping {
  currencyCode: string;
  flagCode: string;
  countryName: string;
  region: string;
}

// Exchange rate calculation types
export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  convertedAmount: number;
  timestamp: Date;
}

// Currency validation types
export interface CurrencyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Currency search and filter types
export interface CurrencySearchFilters {
  category?: CurrencyCategory;
  isActive?: boolean;
  decimalPlaces?: number;
  region?: string;
  searchTerm?: string;
}

export interface CurrencySearchResult {
  currencies: CurrencyWithFlag[];
  totalCount: number;
  filteredCount: number;
  categories: CurrencyCategoryInfo[];
}
