/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `vybraa_config_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vybraa_config_settings_slug_key" ON "vybraa_config_settings"("slug");
