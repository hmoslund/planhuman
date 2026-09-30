import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { COUNTRY_CODES } from "@/lib/wealth";
import prisma from "@/lib/prisma";

function isValidCountry(value: string): value is (typeof COUNTRY_CODES)[number] {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const rows = await prisma.countryFacts.findMany();
    const byCountry = Object.fromEntries(rows.map((row) => [row.country, row]));

    const countryFacts = COUNTRY_CODES.map(
      (country) =>
        byCountry[country] ?? {
          country,
          inflationRate: null,
          pensionYieldPct: null,
          pensionAge: null,
          pensionTypeNames: null,
          factoids: null,
          housingMarketOutlook: null,
          asOf: null,
          updatedBy: null,
          updatedAt: null,
        }
    );

    return NextResponse.json({ countryFacts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load country facts." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const country = String(body.country ?? "").toUpperCase();
    if (!isValidCountry(country)) {
      return NextResponse.json({ error: "Unknown country." }, { status: 400 });
    }

    const inflationRate = typeof body.inflationRate === "number" ? body.inflationRate : null;
    const pensionYieldPct = typeof body.pensionYieldPct === "number" ? body.pensionYieldPct : null;
    const pensionAge = typeof body.pensionAge === "number" ? Math.round(body.pensionAge) : null;
    const pensionTypeNames = typeof body.pensionTypeNames === "string" ? body.pensionTypeNames.trim() || null : null;
    const factoids = typeof body.factoids === "string" ? body.factoids.trim() || null : null;
    const housingMarketOutlook = typeof body.housingMarketOutlook === "string" ? body.housingMarketOutlook.trim() || null : null;

    // asOf/updatedBy are always set server-side from the authenticated admin — never trust
    // client-supplied audit fields.
    const asOf = new Date();
    const updatedBy = user.alias ?? user.email ?? user.id;

    const countryFacts = await prisma.countryFacts.upsert({
      where: { country },
      create: { country, inflationRate, pensionYieldPct, pensionAge, pensionTypeNames, factoids, housingMarketOutlook, asOf, updatedBy },
      update: { inflationRate, pensionYieldPct, pensionAge, pensionTypeNames, factoids, housingMarketOutlook, asOf, updatedBy },
    });

    return NextResponse.json({ message: "Country facts saved.", countryFacts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save country facts." }, { status: 500 });
  }
}
