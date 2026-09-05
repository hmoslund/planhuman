import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { CURRENCIES } from "@/lib/wealth";
import prisma from "@/lib/prisma";

const MAX_LOGO_BYTES = 500 * 1024;
const MAX_TEXT_LENGTH = 300;

function isValidCurrency(value: string): value is (typeof CURRENCIES)[number] {
  return (CURRENCIES as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sponsors = await prisma.sponsor.findMany({ orderBy: { currency: "asc" } });
    return NextResponse.json({ sponsors });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load sponsors." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const currency = String(body.currency ?? "").toUpperCase();
    if (!isValidCurrency(currency)) {
      return NextResponse.json({ error: "Unknown currency." }, { status: 400 });
    }

    const link = String(body.link ?? "").trim();
    if (!link) {
      return NextResponse.json({ error: "A sponsor link is required." }, { status: 400 });
    }
    try {
      const parsed = new URL(link);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("bad protocol");
    } catch {
      return NextResponse.json({ error: "Sponsor link must be a valid http(s) URL." }, { status: 400 });
    }

    const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT_LENGTH) : null;

    // logoData stays `undefined` when the admin didn't touch the logo this save,
    // so the upsert's update branch can leave the previously uploaded image alone.
    let logoData: string | null | undefined;
    if (body.logoData === null) {
      logoData = null;
    } else if (typeof body.logoData === "string" && body.logoData.length > 0) {
      if (!/^data:image\/(png|jpe?g|webp|svg\+xml);base64,/.test(body.logoData)) {
        return NextResponse.json({ error: "Logo must be an uploaded image file." }, { status: 400 });
      }
      const base64Length = body.logoData.split(",")[1]?.length ?? 0;
      const approxBytes = (base64Length * 3) / 4;
      if (approxBytes > MAX_LOGO_BYTES) {
        return NextResponse.json({ error: "Logo image is too large (max 500KB)." }, { status: 400 });
      }
      logoData = body.logoData;
    }

    const sponsor = await prisma.sponsor.upsert({
      where: { currency },
      create: { currency, link, text, logoData: logoData ?? null },
      update: { link, text, ...(logoData !== undefined ? { logoData } : {}) },
    });

    return NextResponse.json({ message: "Sponsor saved.", sponsor });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save sponsor." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const currency = url.searchParams.get("currency")?.toUpperCase();
    if (!currency) {
      return NextResponse.json({ error: "currency is required." }, { status: 400 });
    }

    await prisma.sponsor.deleteMany({ where: { currency } });
    return NextResponse.json({ message: "Sponsor removed." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to remove sponsor." }, { status: 500 });
  }
}
