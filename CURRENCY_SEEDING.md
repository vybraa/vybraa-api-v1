# 🌍 Currency Seeding Guide

This guide explains how to seed the database with world currencies for the exchange rates functionality.

## 📋 Overview

We've created a separate **Currency model** instead of relying solely on the CountryCode table because:

- **Different Data Types**: Countries and currencies are related but distinct entities
- **Many-to-Many Relationship**: One country can have multiple currencies (e.g., Eurozone countries)
- **Currency-Specific Fields**: Exchange rates, symbols, decimal places, etc.
- **Better Data Integrity**: Cleaner separation of concerns
- **Easier Maintenance**: Currency data changes less frequently than country data

## 🗄️ Database Schema

### Currency Model

```prisma
model Currency {
  id          String   @id @default(cuid())
  code        String   @unique // e.g., "USD", "EUR", "GBP"
  name        String   // e.g., "US Dollar", "Euro", "British Pound"
  symbol      String   // e.g., "$", "€", "£"
  decimalPlaces Int    @default(2)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  exchangeRates ExchangeRate[]

  @@map("currencies")
}
```

### ExchangeRate Model

```prisma
model ExchangeRate {
  id           String   @id @default(cuid())
  fromCurrency String   // Base currency (usually USD)
  toCurrency   String   // Target currency
  rate         Decimal  @db.Decimal(10, 6)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  currency     Currency @relation(fields: [toCurrency], references: [code])

  @@unique([fromCurrency, toCurrency])
  @@map("exchange_rates")
}
```

## 🚀 Seeding Process

### Option 1: SQL Seeder (Recommended for Production)

```bash
# Run the SQL seeder directly
psql -d your_database -f prisma/seed-currencies.sql
```

### Option 2: TypeScript Seeder (Recommended for Development)

```bash
# Install dependencies if not already installed
npm install

# Run the currency seeder
npm run seed:currencies
```

## 📊 Included Currencies

The seeder includes **115+ currencies** across all major categories:

### 🌟 Major Reserve Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CHF (Swiss Franc)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CNY (Chinese Yuan)

### 🌍 Regional Currencies

- **European**: SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, HRK, RSD, UAH, RUB, TRY, ILS
- **Asian**: KRW, SGD, HKD, TWD, THB, MYR, IDR, PHP, VND, INR, PKR, BDT, LKR, NPR, MMK, KHR, LAK, MNT
- **Middle Eastern & African**: AED, SAR, QAR, KWD, BHD, OMR, JOD, EGP, MAD, TND, DZD, LYD, SDG, NGN, GHS, KES, UGX, TZS, ZAR, NAD, BWP, ZMW, MWK, MZN, MUR, SCR, KMF, DJF, ETB, SOS, RWF, BIF, CDF, XAF, XOF, XPF
- **Americas**: MXN, BRL, ARS, CLP, COP, PEN, UYU, PYG, BOB, GTQ, HNL, NIO, CRC, PAB, DOP, JMD, TTD, BBD, XCD, GYD, SRD, VES, CUP, HTG
- **Oceania**: NZD, FJD, PGK, SBD, VUV, WST, TOP, KID, TVD

### 💰 Cryptocurrencies

- BTC (Bitcoin)
- ETH (Ethereum)
- USDT (Tether)
- USDC (USD Coin)
- BNB (Binance Coin)

## 🔧 Customization

### Adding New Currencies

Edit `prisma/seed-currencies.ts` and add new currencies to the `currencies` array:

```typescript
{ code: 'NEW', name: 'New Currency', symbol: 'NC', decimalPlaces: 2 }
```

### Modifying Existing Currencies

The seeder uses `upsert`, so you can modify existing currencies and they'll be updated when you run the seeder again.

## 🚨 Important Notes

1. **Decimal Places**: Some currencies like JPY, HUF, UGX, TZS, KMF, DJF, SOS, RWF, BIF, XAF, XOF, XPF, VUV have 0 decimal places
2. **Symbols**: Some currencies use the same symbol (e.g., $ for USD, MXN, CLP, COP, ARS, UYU, SRD, VES, CUP, GYD, HTG)
3. **Uniqueness**: Currency codes must be unique across the system
4. **Relationships**: Exchange rates reference currencies by their code

## 🔄 Running the Seeder

### First Time Setup

```bash
# 1. Create and run the migration
npx prisma migrate dev --name add_currency_and_exchange_rates

# 2. Seed the currencies
npm run seed:currencies
```

### Subsequent Runs

```bash
# The seeder will update existing currencies and add new ones
npm run seed:currencies
```

## 📝 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your database is running and accessible
2. **Migration Issues**: Run `npx prisma migrate reset` if you encounter schema conflicts
3. **Duplicate Codes**: The seeder handles duplicates gracefully using `upsert`

### Logs

The seeder provides detailed logging:

- ✅ Successfully seeded currencies
- ❌ Errors with specific currency codes
- 🎉 Completion message

## 🔗 Related Files

- `prisma/schema.prisma` - Database schema
- `prisma/seed-currencies.sql` - SQL seeder
- `prisma/seed-currencies.ts` - TypeScript seeder
- `package.json` - NPM scripts

## 📚 Next Steps

After seeding currencies, you can:

1. Create exchange rate records
2. Build the exchange rate management UI
3. Implement currency conversion logic
4. Add currency-specific validation rules
