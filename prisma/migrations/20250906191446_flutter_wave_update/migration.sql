-- AlterTable
ALTER TABLE "FlutterWaveKey" ADD COLUMN     "client_id" TEXT,
ADD COLUMN     "client_secret" TEXT,
ADD COLUMN     "secret_key" TEXT,
ALTER COLUMN "key" DROP NOT NULL;
