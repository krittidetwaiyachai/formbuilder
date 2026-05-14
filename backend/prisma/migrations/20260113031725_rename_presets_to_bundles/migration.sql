/*
  Warnings:

  - You are about to drop the `preset_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `presets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "preset_fields" DROP CONSTRAINT "preset_fields_formId_fkey";

-- DropForeignKey
ALTER TABLE "preset_fields" DROP CONSTRAINT "preset_fields_presetId_fkey";

-- DropTable
DROP TABLE "preset_fields";

-- DropTable
DROP TABLE "presets";

-- CreateTable
CREATE TABLE "bundles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPII" BOOLEAN NOT NULL DEFAULT false,
    "sensitivityLevel" "SensitivityLevel" NOT NULL DEFAULT 'LOW',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_fields" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "formId" TEXT,
    "type" "FieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "validation" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bundles_name_version_key" ON "bundles"("name", "version");

-- AddForeignKey
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_fields" ADD CONSTRAINT "bundle_fields_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_fields" ADD CONSTRAINT "bundle_fields_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
