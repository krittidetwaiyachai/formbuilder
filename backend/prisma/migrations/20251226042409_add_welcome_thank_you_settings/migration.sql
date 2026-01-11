-- DropForeignKey
ALTER TABLE "response_answers" DROP CONSTRAINT "response_answers_fieldId_fkey";

-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "pageSettings" JSONB,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "thankYouSettings" JSONB,
ADD COLUMN     "welcomeSettings" JSONB;

-- AddForeignKey
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
