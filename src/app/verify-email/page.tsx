"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    async function verify() {
      if (!token) {
        setMessage("The verification link is missing a token.");
        return;
      }

      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      setMessage(data.message ?? data.error ?? "Verification failed.");
    }

    verify();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <div className="max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Email verification</p>
        <h1 className="mt-3 text-3xl font-semibold">{message}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">You can now return to the app and continue to your dashboard.</p>
      </div>
    </main>
  );
}
