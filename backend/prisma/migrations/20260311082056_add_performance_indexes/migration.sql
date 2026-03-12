-- CreateIndex
CREATE INDEX "form_responses_formId_submittedAt_idx" ON "form_responses"("formId", "submittedAt");

-- CreateIndex
CREATE INDEX "response_answers_responseId_idx" ON "response_answers"("responseId");

-- CreateIndex
CREATE INDEX "response_answers_fieldId_idx" ON "response_answers"("fieldId");
