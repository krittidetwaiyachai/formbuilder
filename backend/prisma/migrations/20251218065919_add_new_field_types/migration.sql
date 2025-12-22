-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FieldType" ADD VALUE 'RATE';
ALTER TYPE "FieldType" ADD VALUE 'HEADER';
ALTER TYPE "FieldType" ADD VALUE 'FULLNAME';
ALTER TYPE "FieldType" ADD VALUE 'ADDRESS';
ALTER TYPE "FieldType" ADD VALUE 'PARAGRAPH';
ALTER TYPE "FieldType" ADD VALUE 'SUBMIT';
ALTER TYPE "FieldType" ADD VALUE 'DIVIDER';
ALTER TYPE "FieldType" ADD VALUE 'SECTION_COLLAPSE';
ALTER TYPE "FieldType" ADD VALUE 'PAGE_BREAK';
