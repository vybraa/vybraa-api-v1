/*
  Warnings:

  - You are about to drop the column `countryCode` on the `CelebrityProfile` table. All the data in the column will be lost.
  - Added the required column `countryCodeId` to the `CelebrityProfile` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "CountryCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dialCode" TEXT NOT NULL,
    "flagEmoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryCode_code_key" ON "CountryCode"("code");

-- Insert initial country codes
INSERT INTO "CountryCode" ("id", "code", "name", "dialCode", "flagEmoji", "isActive", "createdAt", "updatedAt") VALUES
('cc-ng', 'NG', 'Nigeria', '+234', '🇳🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-us', 'US', 'United States', '+1', '🇺🇸', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gb', 'GB', 'United Kingdom', '+44', '🇬🇧', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ca', 'CA', 'Canada', '+1', '🇨🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-au', 'AU', 'Australia', '+61', '🇦🇺', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-de', 'DE', 'Germany', '+49', '🇩🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-fr', 'FR', 'France', '+33', '🇫🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-it', 'IT', 'Italy', '+39', '🇮🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-es', 'ES', 'Spain', '+34', '🇪🇸', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-nl', 'NL', 'Netherlands', '+31', '🇳🇱', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-se', 'SE', 'Sweden', '+46', '🇸🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-no', 'NO', 'Norway', '+47', '🇳🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-dk', 'DK', 'Denmark', '+45', '🇩🇰', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-fi', 'FI', 'Finland', '+358', '🇫🇮', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ch', 'CH', 'Switzerland', '+41', '🇨🇭', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-at', 'AT', 'Austria', '+43', '🇦🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-be', 'BE', 'Belgium', '+32', '🇧🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ie', 'IE', 'Ireland', '+353', '🇮🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-pt', 'PT', 'Portugal', '+351', '🇵🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gr', 'GR', 'Greece', '+30', '🇬🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-pl', 'PL', 'Poland', '+48', '🇵🇱', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cz', 'CZ', 'Czech Republic', '+420', '🇨🇿', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-hu', 'HU', 'Hungary', '+36', '🇭🇺', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ro', 'RO', 'Romania', '+40', '🇷🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bg', 'BG', 'Bulgaria', '+359', '🇧🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-hr', 'HR', 'Croatia', '+385', '🇭🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-si', 'SI', 'Slovenia', '+386', '🇸🇮', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sk', 'SK', 'Slovakia', '+421', '🇸🇰', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ee', 'EE', 'Estonia', '+372', '🇪🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-lv', 'LV', 'Latvia', '+371', '🇱🇻', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-lt', 'LT', 'Lithuania', '+370', '🇱🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cy', 'CY', 'Cyprus', '+357', '🇨🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mt', 'MT', 'Malta', '+356', '🇲🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-lu', 'LU', 'Luxembourg', '+352', '🇱🇺', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-is', 'IS', 'Iceland', '+354', '🇮🇸', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-li', 'LI', 'Liechtenstein', '+423', '🇱🇮', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mc', 'MC', 'Monaco', '+377', '🇲🇨', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sm', 'SM', 'San Marino', '+378', '🇸🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-va', 'VA', 'Vatican City', '+379', '🇻🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ad', 'AD', 'Andorra', '+376', '🇦🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-kz', 'KZ', 'Kazakhstan', '+7', '🇰🇿', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ru', 'RU', 'Russia', '+7', '🇷🇺', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ua', 'UA', 'Ukraine', '+380', '🇺🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-by', 'BY', 'Belarus', '+375', '🇧🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-md', 'MD', 'Moldova', '+373', '🇲🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ge', 'GE', 'Georgia', '+995', '🇬🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-am', 'AM', 'Armenia', '+374', '🇦🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-az', 'AZ', 'Azerbaijan', '+994', '🇦🇿', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-tr', 'TR', 'Turkey', '+90', '🇹🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-il', 'IL', 'Israel', '+972', '🇮🇱', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-jo', 'JO', 'Jordan', '+962', '🇯🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-lb', 'LB', 'Lebanon', '+961', '🇱🇧', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sy', 'SY', 'Syria', '+963', '🇸🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-iq', 'IQ', 'Iraq', '+964', '🇮🇶', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ir', 'IR', 'Iran', '+98', '🇮🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-af', 'AF', 'Afghanistan', '+93', '🇦🇫', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-pk', 'PK', 'Pakistan', '+92', '🇵🇰', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-in', 'IN', 'India', '+91', '🇮🇳', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bd', 'BD', 'Bangladesh', '+880', '🇧🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-lk', 'LK', 'Sri Lanka', '+94', '🇱🇰', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-np', 'NP', 'Nepal', '+977', '🇳🇵', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bt', 'BT', 'Bhutan', '+975', '🇧🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mv', 'MV', 'Maldives', '+960', '🇲🇻', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mm', 'MM', 'Myanmar', '+95', '🇲🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-th', 'TH', 'Thailand', '+66', '🇹🇭', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-la', 'LA', 'Laos', '+856', '🇱🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-kh', 'KH', 'Cambodia', '+855', '🇰🇭', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-vn', 'VN', 'Vietnam', '+84', '🇻🇳', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-my', 'MY', 'Malaysia', '+60', '🇲🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sg', 'SG', 'Singapore', '+65', '🇸🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-id', 'ID', 'Indonesia', '+62', '🇮🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ph', 'PH', 'Philippines', '+63', '🇵🇭', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-br', 'BR', 'Brazil', '+55', '🇧🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ar', 'AR', 'Argentina', '+54', '🇦🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cl', 'CL', 'Chile', '+56', '🇨🇱', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-pe', 'PE', 'Peru', '+51', '🇵🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-co', 'CO', 'Colombia', '+57', '🇨🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ve', 'VE', 'Venezuela', '+58', '🇻🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ec', 'EC', 'Ecuador', '+593', '🇪🇨', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bo', 'BO', 'Bolivia', '+591', '🇧🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-py', 'PY', 'Paraguay', '+595', '🇵🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-uy', 'UY', 'Uruguay', '+598', '🇺🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gy', 'GY', 'Guyana', '+592', '🇬🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sr', 'SR', 'Suriname', '+597', '🇸🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-fk', 'FK', 'Falkland Islands', '+500', '🇫🇰', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-za', 'ZA', 'South Africa', '+27', '🇿🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-eg', 'EG', 'Egypt', '+20', '🇪🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ly', 'LY', 'Libya', '+218', '🇱🇾', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-tn', 'TN', 'Tunisia', '+216', '🇹🇳', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-dz', 'DZ', 'Algeria', '+213', '🇩🇿', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ma', 'MA', 'Morocco', '+212', '🇲🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sd', 'SD', 'Sudan', '+249', '🇸🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-et', 'ET', 'Ethiopia', '+251', '🇪🇹', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ke', 'KE', 'Kenya', '+254', '🇰🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-tz', 'TZ', 'Tanzania', '+255', '🇹🇿', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ug', 'UG', 'Uganda', '+256', '🇺🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-rw', 'RW', 'Rwanda', '+250', '🇷🇼', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bi', 'BI', 'Burundi', '+257', '🇧🇮', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cd', 'CD', 'Democratic Republic of the Congo', '+243', '🇨🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cg', 'CG', 'Republic of the Congo', '+242', '🇨🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ga', 'GA', 'Gabon', '+241', '🇬🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cm', 'CM', 'Cameroon', '+237', '🇨🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cf', 'CF', 'Central African Republic', '+236', '🇨🇫', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-td', 'TD', 'Chad', '+235', '🇹🇩', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ne', 'NE', 'Niger', '+227', '🇳🇪', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ml', 'ML', 'Mali', '+223', '🇲🇱', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bf', 'BF', 'Burkina Faso', '+226', '🇧🇫', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ci', 'CI', 'Ivory Coast', '+225', '🇨🇮', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gh', 'GH', 'Ghana', '+233', '🇬🇭', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-tg', 'TG', 'Togo', '+228', '🇹🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bj', 'BJ', 'Benin', '+229', '🇧🇯', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gw', 'GW', 'Guinea-Bissau', '+245', '🇬🇼', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gn', 'GN', 'Guinea', '+224', '🇬🇳', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sl', 'SL', 'Sierra Leone', '+232', '🇸🇱', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-lr', 'LR', 'Liberia', '+231', '🇱🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-cv', 'CV', 'Cape Verde', '+238', '🇨🇻', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-gm', 'GM', 'Gambia', '+220', '🇬🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sn', 'SN', 'Senegal', '+221', '🇸🇳', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mr', 'MR', 'Mauritania', '+222', '🇲🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ao', 'AO', 'Angola', '+244', '🇦🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-na', 'NA', 'Namibia', '+264', '🇳🇦', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-bw', 'BW', 'Botswana', '+267', '🇧🇼', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-zm', 'ZM', 'Zambia', '+260', '🇿🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-zw', 'ZW', 'Zimbabwe', '+263', '🇿🇼', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mz', 'MZ', 'Mozambique', '+258', '🇲🇿', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mg', 'MG', 'Madagascar', '+261', '🇲🇬', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-mu', 'MU', 'Mauritius', '+230', '🇲🇺', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-sc', 'SC', 'Seychelles', '+248', '🇸🇨', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-km', 'KM', 'Comoros', '+269', '🇰🇲', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-dj', 'DJ', 'Djibouti', '+253', '🇩🇯', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-so', 'SO', 'Somalia', '+252', '🇸🇴', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-er', 'ER', 'Eritrea', '+291', '🇪🇷', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cc-ss', 'SS', 'South Sudan', '+211', '🇸🇸', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add countryCodeId column to CelebrityProfile
ALTER TABLE "CelebrityProfile" ADD COLUMN "countryCodeId" TEXT;

-- Update existing CelebrityProfile records to use Nigeria as default
UPDATE "CelebrityProfile" SET "countryCodeId" = 'cc-ng' WHERE "countryCodeId" IS NULL;

-- Make countryCodeId NOT NULL
ALTER TABLE "CelebrityProfile" ALTER COLUMN "countryCodeId" SET NOT NULL;

-- Drop the old countryCode column
ALTER TABLE "CelebrityProfile" DROP COLUMN "countryCode";

-- AddForeignKey
ALTER TABLE "CelebrityProfile" ADD CONSTRAINT "CelebrityProfile_countryCodeId_fkey" FOREIGN KEY ("countryCodeId") REFERENCES "CountryCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

