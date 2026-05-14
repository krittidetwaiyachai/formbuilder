/*
  Warnings:

  - You are about to drop the column `sensitivityLevel` on the `bundles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bundle_fields" ADD COLUMN     "isPII" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "bundles" DROP COLUMN "sensitivityLevel",
ADD COLUMN     "options" JSONB;

-- AlterTable
ALTER TABLE "fields" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "imageWidth" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- DropEnum
DROP TYPE "SensitivityLevel";

-- CreateIndex
CREATE INDEX "form_responses_formId_userId_idx" ON "form_responses"("formId", "userId");

-- CreateIndex
CREATE INDEX "form_responses_formId_fingerprint_idx" ON "form_responses"("formId", "fingerprint");

-- CreateIndex
CREATE INDEX "form_responses_formId_respondentEmail_idx" ON "form_responses"("formId", "respondentEmail");
