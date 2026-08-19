import crypto from "node:crypto";
import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  country: string;
  currency: string;
  emailVerified: boolean;
  isAdmin: boolean;
};

const SESSION_COOKIE_NAME = "wealth-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const MAX_ROWS = 400;

const ADMIN_EMAILS = ["hmoslund@outlook.com"];

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
}

export function createDefaultBlocks() {
  return {
    A: [],
    A2: [],
    B: [],
    B2: [],
    C: [],
    C2: [],
    C3: [],
    D: [],
    D2: [],
    E: [],
    J: [],
    K: [],
    L: [],
    G: [],
  };
}

export function normalizeBlockRows(blockRows: Array<{ value?: number | null }> = []) {
  return blockRows.map((row) => ({
    ...row,
    value: Math.round(Number(row.value ?? 0) / 100) * 100,
  }));
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashValue: string) {
  return compare(password, hashValue);
}

export function getCurrency(country: string) {
  if (country === "US") return "USD";
  if (country === "UK") return "GBP";
  if (country === "FI") return "EUR";
  if (country === "DK") return "DKK";
  if (country === "SE") return "SEK";
  if (country === "NO") return "NOK";
  return country.toUpperCase();
}

export function getCountryLabel(country: string) {
  return country.toUpperCase();
}

export function calculateWealth(blocks: Record<string, Array<{ value?: number | null }>>) {
  const sum = (key: string) =>
    (blocks[key] ?? []).reduce((total, row) => total + Number(row.value ?? 0), 0);

  const assets = sum("A") + sum("B") + sum("C") + sum("D") + sum("E");
  const liabilities = sum("A2") + sum("B2") + sum("C2") + sum("C3") + sum("D2");
  const cashflow = sum("J") - sum("K");
  const netWorth = assets - liabilities;

  return {
    assets,
    liabilities,
    cashflow,
    netWorth,
  };
}

export function toCurrency(value: number, currency: string) {
  return `${currency}${value.toLocaleString("en-US")}`;
}

export async function createSessionForUser(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user as AppUser;
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user as AppUser;
}

export async function clearSessionCookie() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function issueVerificationToken(userId: string) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function issueResetToken(userId: string) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}
