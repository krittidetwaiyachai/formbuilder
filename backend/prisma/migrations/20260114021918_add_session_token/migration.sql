-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "sessionToken" TEXT;
