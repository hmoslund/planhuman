-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "recoveryCodeHash" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SignupAttempt" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignupAttempt_ip_createdAt_idx" ON "SignupAttempt"("ip", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_alias_key" ON "User"("alias");

