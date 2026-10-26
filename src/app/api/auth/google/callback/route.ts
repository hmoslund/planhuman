import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { createDefaultBlocks, createSessionForUser, getCurrency, setSessionCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `/?error=google_signin_failed`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(`/?error=google_signin_failed`);
    }

    // Verify CSRF state against the cookie set by /start.
    const cookieStore = await cookies();
    const expectedState = cookieStore.get(STATE_COOKIE)?.value;
    if (!expectedState || expectedState !== state) {
      return NextResponse.redirect(`/?error=google_signin_failed`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`/?error=google_signin_not_configured`);
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;

    // Exchange authorization code for access token.
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`/?error=google_signin_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;
    if (!accessToken) {
      return NextResponse.redirect(`/?error=google_signin_failed`);
    }

    // Fetch Google profile (scopes: openid profile — email is NOT requested).
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return NextResponse.redirect(`/?error=google_signin_failed`);
    }

    const profile = await profileRes.json();
    const googleId = profile.id as string | undefined;
    if (!googleId) {
      return NextResponse.redirect(`/?error=google_signin_failed`);
    }

    // Look up existing Google-linked account.
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // No account yet — create one. We do NOT store email or any personal info.
      const alias = `g-${googleId.slice(-8)}`;
      const country = "DK";
      const currency = getCurrency(country);
      const randomPasswordHash = await crypto.randomBytes(32).toString("hex");

      user = await prisma.user.create({
        data: {
          alias,
          passwordHash: randomPasswordHash, // never used; field stays required
          googleId,
          authProvider: "google",
          country,
          currency,
          isAdmin: false,
        },
      });

      await prisma.wealthRecord.create({
        data: { userId: user.id, blocks: createDefaultBlocks() },
      });
    }

    // Clear the state cookie.
    cookieStore.set(STATE_COOKIE, "", { path: "/api/auth/google/callback", maxAge: 0 });

    const { token } = await createSessionForUser(user.id);
    const response = NextResponse.redirect("/dashboard");
    return setSessionCookie(response, token);
  } catch (error) {
    console.error("[google callback]", error);
    return NextResponse.redirect(`/?error=google_signin_failed`);
  }
}
