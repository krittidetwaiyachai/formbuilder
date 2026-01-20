-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
