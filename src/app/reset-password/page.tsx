"use client";

import { Suspense, FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Choose a new password.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = searchParams.get("token");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    setMessage(data.message ?? data.error ?? "Password reset failed.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Reset password</p>
        <h1 className="mt-3 text-3xl font-semibold">Set a new password</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{message}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            required
          />
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white" type="submit">
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
