-- DropForeignKey
ALTER TABLE "response_answers" DROP CONSTRAINT "response_answers_fieldId_fkey";

-- AlterTable
ALTER TABLE "form_responses" ADD COLUMN     "respondentEmail" TEXT;

-- AlterTable
ALTER TABLE "response_answers" ALTER COLUMN "fieldId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;
