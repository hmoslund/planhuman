import { NextResponse } from "next/server";
import { calculateWealth, createDefaultBlocks, getUserFromRequest, normalizeBlockRows } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.wealthRecord.findFirst({ where: { userId: user.id } });
    const blocks = (record?.blocks as Record<string, unknown>) ?? createDefaultBlocks();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: user.currency,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
      },
      record: {
        id: record?.id ?? null,
        blocks,
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

    const existing = await prisma.wealthRecord.findFirst({ where: { userId: user.id } });
    if (existing) {
      const updated = await prisma.wealthRecord.update({
        where: { id: existing.id },
        data: { blocks: normalizedBlocks },
      });

      return NextResponse.json({
        message: "Wealth record saved.",
        record: {
          id: updated.id,
          blocks: normalizedBlocks,
          summary: calculateWealth(normalizedBlocks as Record<string, Array<{ value?: number | null }>>),
        },
      });
    }

    const created = await prisma.wealthRecord.create({
      data: {
        userId: user.id,
        blocks: normalizedBlocks,
      },
    });

    return NextResponse.json({
      message: "Wealth record saved.",
      record: {
        id: created.id,
        blocks: normalizedBlocks,
        summary: calculateWealth(normalizedBlocks as Record<string, Array<{ value?: number | null }>>),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save wealth data." }, { status: 500 });
  }
}
