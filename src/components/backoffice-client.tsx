"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toCurrency } from "@/lib/wealth";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  country: string;
  emailVerified: boolean;
  rowCount: number;
  summary: {
    netWorth: number;
    assets: number;
    liabilities: number;
    cashflow: number;
  };
};

export function BackofficeClient() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function loadUsers() {
    const response = await fetch("/api/backoffice");
    if (response.status === 403) {
      router.replace("/dashboard");
      return;
    }

    const data = await response.json();
    setUsers(data.users ?? []);
  }

  useEffect(() => {
    loadUsers();
  }, [router]);

  async function deleteUser(userId: string) {
    const response = await fetch(`/api/backoffice?userId=${userId}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(data.message ?? data.error ?? "Action complete.");
    await loadUsers();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Back office</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manage users</h1>
          </div>
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => router.push("/dashboard")}>
            Return to dashboard
          </button>
        </div>

        {message && <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Country</th>
                <th className="px-4 py-3 font-semibold">Rows</th>
                <th className="px-4 py-3 font-semibold">Net worth</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.country}</td>
                  <td className="px-4 py-3">{user.rowCount}</td>
                  <td className="px-4 py-3">{toCurrency(user.summary.netWorth, user.country === "UK" ? "£" : user.country === "FI" ? "€" : "kr")}</td>
                  <td className="px-4 py-3">{user.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700" onClick={() => deleteUser(user.id)}>
                      Delete user
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
