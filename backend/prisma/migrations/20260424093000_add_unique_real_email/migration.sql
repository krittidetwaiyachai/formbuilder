CREATE UNIQUE INDEX "users_realEmail_key"
ON "users" ("realEmail")
WHERE "realEmail" IS NOT NULL;
