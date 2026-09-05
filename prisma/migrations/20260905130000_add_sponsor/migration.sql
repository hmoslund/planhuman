-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "logoData" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_currency_key" ON "Sponsor"("currency");
