-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT,
    ALTER COLUMN "email" DROP NOT NULL,
    ALTER COLUMN "passwordHash" DROP NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
