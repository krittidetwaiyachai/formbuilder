/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'GROUP';

-- AlterTable
ALTER TABLE "fields" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "shrink" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "logic_rules" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logicType" TEXT NOT NULL DEFAULT 'and',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logic_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logic_conditions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "logic_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logic_actions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,

    CONSTRAINT "logic_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FormCollaborators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FormCollaborators_AB_unique" ON "_FormCollaborators"("A", "B");

-- CreateIndex
CREATE INDEX "_FormCollaborators_B_index" ON "_FormCollaborators"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_rules" ADD CONSTRAINT "logic_rules_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_conditions" ADD CONSTRAINT "logic_conditions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "logic_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_conditions" ADD CONSTRAINT "logic_conditions_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_actions" ADD CONSTRAINT "logic_actions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "logic_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_actions" ADD CONSTRAINT "logic_actions_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormCollaborators" ADD CONSTRAINT "_FormCollaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormCollaborators" ADD CONSTRAINT "_FormCollaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
