-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramId" TEXT;

-- CreateTable
CREATE TABLE "PreallocatedUid" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "PreallocatedUid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreallocatedUid_uuid_key" ON "PreallocatedUid"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PreallocatedUid_userId_key" ON "PreallocatedUid"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- AddForeignKey
ALTER TABLE "PreallocatedUid" ADD CONSTRAINT "PreallocatedUid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

