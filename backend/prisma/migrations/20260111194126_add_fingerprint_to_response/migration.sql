-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'TABLE';

-- AlterTable
ALTER TABLE "form_responses" ADD COLUMN     "fingerprint" TEXT;
