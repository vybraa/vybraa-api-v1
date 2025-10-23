# CountryCode Migration Summary

This document summarizes the changes made to migrate from a simple string-based `countryCode` field to a proper `CountryCode` table with foreign key relationships.

## Database Changes

### 1. New CountryCode Table

- **Table**: `CountryCode`
- **Fields**:
  - `id`: UUID primary key
  - `code`: Unique country code (e.g., "NG", "US", "GB")
  - `name`: Country name (e.g., "Nigeria", "United States")
  - `dialCode`: Phone dial code (e.g., "+234", "+1", "+44")
  - `flagEmoji`: Flag emoji (e.g., "🇳🇬", "🇺🇸")
  - `isActive`: Boolean flag for active countries
  - `createdAt` & `updatedAt`: Timestamps

### 2. Updated CelebrityProfile Table

- **Removed**: `countryCode` (string)
- **Added**: `countryCodeId` (UUID, foreign key to CountryCode.id)
- **Relationship**: Many-to-one with CountryCode table

### 3. Migration Details

- **Migration File**: `20250820182410_add_country_code_table`
- **Data Migration**: Existing records defaulted to Nigeria (cc-ng)
- **Countries Added**: 100+ countries with proper dial codes and flags

## API Changes

### 1. New Entities

- `CountryCode` entity with full country information
- Updated `OnboardingStep1Response` and `CelebrityProfileResponse` to include full CountryCode objects

### 2. New DTOs

- Updated `OnboardingStep1Dto` to use `countryCodeId` instead of `countryCode`

### 3. New Services

- `CountryCodeService` with methods:
  - `findAll()`: Get all active countries
  - `findById()`: Get country by ID
  - `findByCode()`: Get country by code
  - `findByDialCode()`: Get country by dial code
  - `searchByName()`: Search countries by name

### 4. New Controllers

- `CountryCodeController` with endpoints:
  - `GET /country-codes`: List all countries
  - `GET /country-codes/search?name=`: Search countries
  - `GET /country-codes/:id`: Get country by ID
  - `GET /country-codes/code/:code`: Get country by code
  - `GET /country-codes/dial/:dialCode`: Get country by dial code

### 5. Updated Services

- `OnboardingService` now uses `countryCodeId` and includes CountryCode in responses
- All database queries updated to use the new foreign key relationship

## Mobile UI Changes

### 1. Updated Types

- `CountryCode` interface with full country information
- `OnboardingStep1Data` now uses `countryCodeId` instead of `countryCode`
- `CelebrityProfile` now includes full `CountryCode` object

### 2. New Services

- `CountryCodeService` for fetching country data from API

### 3. Updated Screens

- `celebrity-step1.tsx`: Updated to use `countryCodeId` and display proper dial codes
- `personal-details.tsx`: Maintained compatibility with existing structure

## Benefits of the Migration

### 1. Data Integrity

- Foreign key constraints ensure valid country codes
- Centralized country data management
- Consistent country information across the application

### 2. Enhanced Functionality

- Support for country flags and proper names
- Search and filter capabilities for countries
- Easy addition of new countries

### 3. Better User Experience

- Proper country selection with flags
- Consistent country code display
- Better internationalization support

### 4. Scalability

- Easy to add new countries
- Support for country-specific features
- Better data organization

## Usage Examples

### API Usage

```typescript
// Get all countries
GET /country-codes

// Search countries
GET /country-codes/search?name=nigeria

// Get specific country
GET /country-codes/cc-ng
```

### Mobile UI Usage

```typescript
// Fetch countries
const countries = await countryCodeService.getAllCountryCodes();

// Use in onboarding
const onboardingData = {
  countryCodeId: 'cc-ng', // Nigeria
  // ... other fields
};
```

## Migration Notes

1. **Backward Compatibility**: Existing mobile UI code will need updates to use the new structure
2. **Data Validation**: All country code inputs now validate against the CountryCode table
3. **Performance**: Country data is cached and optimized for quick lookups
4. **Internationalization**: Ready for multi-language country names and localized content

## Next Steps

1. **Testing**: Verify all API endpoints work correctly
2. **Mobile UI Updates**: Complete the migration of all mobile UI components
3. **Documentation**: Update API documentation with new endpoints
4. **Monitoring**: Monitor for any issues with the new structure
5. **Enhancement**: Consider adding country-specific features (timezones, currencies, etc.)

