-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT;

-- CreateTable
CREATE TABLE "CountryFacts" (
    "country" TEXT NOT NULL,
    "inflation_rate" DOUBLE PRECISION,
    "pension_yield_pct" DOUBLE PRECISION,
    "pension_age" INTEGER,
    "pension_type_names" TEXT,
    "factoids" TEXT,
    "housing_market_outlook" TEXT,
    "as_of" DATE,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryFacts_pkey" PRIMARY KEY ("country")
);
