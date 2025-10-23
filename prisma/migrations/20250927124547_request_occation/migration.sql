/*
  Warnings:

  - The values [OTHER] on the enum `RequestOccasion` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestOccasion_new" AS ENUM ('BIRTHDAY_SHOUTOUT', 'ADVICE', 'ANNIVERSARY', 'MARRIAGE_PROPOSAL');
ALTER TABLE "requests" ALTER COLUMN "occasion" TYPE "RequestOccasion_new" USING ("occasion"::text::"RequestOccasion_new");
ALTER TYPE "RequestOccasion" RENAME TO "RequestOccasion_old";
ALTER TYPE "RequestOccasion_new" RENAME TO "RequestOccasion";
DROP TYPE "RequestOccasion_old";
COMMIT;
