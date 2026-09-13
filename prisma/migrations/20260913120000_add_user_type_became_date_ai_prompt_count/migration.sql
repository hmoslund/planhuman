-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" TEXT,
ADD COLUMN     "became_user_date" DATE,
ADD COLUMN     "ai_prompt_count" INTEGER NOT NULL DEFAULT 0;
