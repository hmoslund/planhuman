import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// BuyMeACoffee webhook — marks a user as a Donor when they donate.
// Configure the webhook URL as ".../api/webhooks/buymeacoffee?secret=YOUR_SECRET"
// and set BMAC_SECRET in your environment to match.
export async function POST(request: Request) {
  try {
    const secret = process.env.BMAC_SECRET;
    if (secret) {
      const url = new URL(request.url);
      const provided = url.searchParams.get("secret") ?? request.headers.get("x-bmac-secret") ?? "";
      if (provided !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => null);
    const rawEmail =
      body?.supporter_email ?? body?.email ?? body?.data?.email ?? body?.data?.supporter_email ?? body?.extra?.email ?? "";
    const email = String(rawEmail).trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "email missing" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.donated) {
      await prisma.user.update({ where: { id: user.id }, data: { donated: true, donatedAt: new Date() } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}