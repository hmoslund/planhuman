import { NextResponse } from "next/server";
import { calculateWealth, createDefaultBlocks, getUserFromRequest, MAX_ROWS, normalizeBlockRows } from "@/lib/auth";
import { COUNTRY_CODES, DEFAULT_SETTINGS, normalizeCurrency, sanitizeYearOverrides, type PlannerSettings } from "@/lib/wealth";
import { isPremiumUser } from "@/lib/premium";
import { getCountryFacts } from "@/lib/country-facts";
import prisma from "@/lib/prisma";

function isValidLanguage(value: unknown): value is (typeof COUNTRY_CODES)[number] {
  return typeof value === "string" && (COUNTRY_CODES as readonly string[]).includes(value);
}

async function getEffectiveCountryFacts(country: string) {
  const dbFacts = await prisma.countryFacts.findUnique({ where: { country } });
  const fallback = getCountryFacts(country);

  return {
    factoids: dbFacts?.factoids || fallback.facts,
    pensionTypeNames: dbFacts?.pensionTypeNames || fallback.localTerms,
    inflationRate: dbFacts?.inflationRate ?? null,
    pensionYieldPct: dbFacts?.pensionYieldPct ?? null,
    pensionAge: dbFacts?.pensionAge ?? null,
    housingMarketOutlook: dbFacts?.housingMarketOutlook ?? null,
    asOf: dbFacts?.asOf ?? null,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.wealthRecord.findFirst({ where: { userId: user.id } });
    const blocks = (record?.blocks as Record<string, unknown>) ?? createDefaultBlocks();
    const settings = { ...DEFAULT_SETTINGS, ...((record?.settings as Record<string, unknown>) ?? {}) };
    const countryFacts = await getEffectiveCountryFacts(user.country);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        alias: user.alias,
        name: user.name,
        country: user.country,
        currency: normalizeCurrency(user.currency),
        language: user.language,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        donated: user.donated,
        userNumber: user.userNumber,
        type: user.type,
        aiPromptCount: user.aiPromptCount,
      },
      countryFacts,
      record: {
        id: record?.id ?? null,
        blocks,
        settings,
        summary: calculateWealth(blocks as Record<string, Array<{ value?: number | null }>>),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load wealth data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const normalizedBlocks = Object.fromEntries(
      Object.entries(body.blocks ?? {}).map(([key, rows]) => [key, normalizeBlockRows(rows as Array<{ value?: number | null }>)])
    );

    const totalRows = Object.values(normalizedBlocks).reduce((count, rows) => count + (rows?.length ?? 0), 0);
    if (totalRows > MAX_ROWS) {
      return NextResponse.json({ error: `Row limit reached (${MAX_ROWS}).` }, { status: 400 });
    }

    const existing = await prisma.wealthRecord.findFirst({ where: { userId: user.id } });

    // Adding a new goal is a premium feature. Existing goals a user already has are never
    // touched here — editing, completing, or removing them is still allowed for everyone —
    // but a non-premium user can't grow the Goals (G) block past what they already had.
    if (!isPremiumUser(user)) {
      const existingGoalCount = ((existing?.blocks as Record<string, unknown[]> | undefined)?.G ?? []).length;
      const incomingGoalCount = normalizedBlocks.G?.length ?? 0;
      if (incomingGoalCount > existingGoalCount) {
        return NextResponse.json(
          { error: "Adding goals is a premium feature. Upgrade to add more goals." },
          { status: 403 }
        );
      }
    }

    const settings = { ...DEFAULT_SETTINGS, ...((body.settings as Partial<PlannerSettings>) ?? {}) };
    // The two projection tables' balance columns ("pension and reserves", "assets and
    // investments") are always derived, never stored — there is no field for them here
    // to begin with. These two per-year input maps are the only pieces of that feature
    // written to the database, and they're re-validated here regardless of what the
    // client claims, so a direct API call can't smuggle in bad keys/values.
    settings.pensionSavingsOverrides = sanitizeYearOverrides((body.settings as Partial<PlannerSettings> | undefined)?.pensionSavingsOverrides);
    settings.cashflowOverrides = sanitizeYearOverrides((body.settings as Partial<PlannerSettings> | undefined)?.cashflowOverrides);
    const currency = body.currency ? normalizeCurrency(body.currency) : undefined;
    // "language" is explicit user intent, distinct from "not sent": null means the user
    // picked "Automatic" and wants to fall back to their country's default language again.
    const language = "language" in body ? (isValidLanguage(body.language) ? body.language : null) : undefined;

    if (currency || language !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { ...(currency ? { currency } : {}), ...(language !== undefined ? { language } : {}) },
      });
    }

    if (existing) {
      const updated = await prisma.wealthRecord.update({
        where: { id: existing.id },
        data: { blocks: normalizedBlocks, settings },
      });

      return NextResponse.json({
        message: "Wealth record saved.",
        record: {
          id: updated.id,
          blocks: normalizedBlocks,
          settings,
          summary: calculateWealth(normalizedBlocks as Record<string, Array<{ value?: number | null }>>),
        },
      });
    }

    const created = await prisma.wealthRecord.create({
      data: {
        userId: user.id,
        blocks: normalizedBlocks,
        settings,
      },
    });

    return NextResponse.json({
      message: "Wealth record saved.",
      record: {
        id: created.id,
        blocks: normalizedBlocks,
        settings,
        summary: calculateWealth(normalizedBlocks as Record<string, Array<{ value?: number | null }>>),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save wealth data." }, { status: 500 });
  }
}
