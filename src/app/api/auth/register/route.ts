import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  createDefaultBlocks,
  createSessionForUser,
  generateRecoveryCode,
  getCurrency,
  hashPassword,
  isAdminAlias,
  normalizeAlias,
  setSessionCookie,
  suggestAliases,
} from "@/lib/auth";
import { checkSignupRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyFormToken } from "@/lib/form-token";
import { verifyTurnstileToken } from "@/lib/turnstile";
import prisma from "@/lib/prisma";

const VALID_COUNTRIES = ["DK", "SE", "NO", "FI", "UK"];
const ALIAS_PATTERN = /^[a-z0-9_-]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alias, password, country, formToken, turnstileToken, website } = body ?? {};

    // Honeypot: a real visitor never fills this hidden field. Reject with the same
    // generic error other validation failures use, so it gives bots no signal.
    if (typeof website === "string" && website.trim().length > 0) {
      console.error("[signup:honeypot] hidden field was filled — treating as bot");
      return NextResponse.json({ error: "Registration failed." }, { status: 400 });
    }

    if (!verifyFormToken(formToken)) {
      return NextResponse.json({ error: "Registration failed." }, { status: 400 });
    }

    if (!alias || !password || !country) {
      return NextResponse.json({ error: "Alias, password, and country are required." }, { status: 400 });
    }

    const normalizedAlias = normalizeAlias(alias);
    const normalizedCountry = String(country).toUpperCase();

    if (normalizedAlias.length < 3 || normalizedAlias.length > 32 || !ALIAS_PATTERN.test(normalizedAlias)) {
      return NextResponse.json(
        { error: "Alias must be 3-32 characters: lowercase letters, numbers, - or _." },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password should be at least 8 characters." }, { status: 400 });
    }

    if (!VALID_COUNTRIES.includes(normalizedCountry)) {
      return NextResponse.json({ error: "Please choose a valid country." }, { status: 400 });
    }

    const ip = getClientIp(request);

    const withinLimit = await checkSignupRateLimit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many signups from this network. Please try again later." },
        { status: 429 }
      );
    }

    const turnstileOk = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileOk) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { alias: normalizedAlias } });
    if (existing) {
      return NextResponse.json(
        { error: "That alias is taken.", suggestions: suggestAliases(normalizedAlias) },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeHash = await hashPassword(recoveryCode);
    const currency = getCurrency(normalizedCountry);

    const latest = await prisma.user.aggregate({ _max: { userNumber: true } });
    const userNumber = (latest._max.userNumber ?? 499) + 1;

    let user;
    try {
      user = await prisma.user.create({
        data: {
          alias: normalizedAlias,
          passwordHash,
          recoveryCodeHash,
          country: normalizedCountry,
          currency,
          userNumber,
          isAdmin: isAdminAlias(normalizedAlias),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json(
          { error: "That alias is taken.", suggestions: suggestAliases(normalizedAlias) },
          { status: 409 }
        );
      }
      throw error;
    }

    await prisma.wealthRecord.create({
      data: {
        userId: user.id,
        blocks: createDefaultBlocks(),
      },
    });

    const { token } = await createSessionForUser(user.id);
    const response = NextResponse.json({
      message: "Account created.",
      recoveryCode,
      user: {
        id: user.id,
        alias: user.alias,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: user.currency,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        donated: user.donated,
        userNumber: user.userNumber,
      },
    });

    return setSessionCookie(response, token);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
