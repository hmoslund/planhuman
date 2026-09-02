import { NextResponse } from "next/server";
import { calculateWealth, createDefaultBlocks, getUserFromRequest, MAX_ROWS, normalizeBlockRows } from "@/lib/auth";
import { DEFAULT_SETTINGS, normalizeCurrency, type PlannerSettings } from "@/lib/wealth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.wealthRecord.findFirst({ where: { userId: user.id } });
    const blocks = (record?.blocks as Record<string, unknown>) ?? createDefaultBlocks();
    const settings = { ...DEFAULT_SETTINGS, ...((record?.settings as Record<string, unknown>) ?? {}) };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        alias: user.alias,
        name: user.name,
        country: user.country,
        currency: normalizeCurrency(user.currency),
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        donated: user.donated,
        userNumber: user.userNumber,
      },
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

    const settings = { ...DEFAULT_SETTINGS, ...((body.settings as Partial<PlannerSettings>) ?? {}) };
    const currency = body.currency ? normalizeCurrency(body.currency) : undefined;

    if (currency) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currency },
      });
    }

    const existing = await prisma.wealthRecord.findFirst({ where: { userId: user.id } });
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
