-- CreateTable
CREATE TABLE "TelegramAccount" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "tgid" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "username" TEXT,
    CONSTRAINT "TelegramAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAccount_tgid_key" ON "TelegramAccount"("tgid");

-- CreateTable
CREATE TABLE "Credentials" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passHash" TEXT NOT NULL,
    CONSTRAINT "Credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_email_key" ON "Credentials"("email");
