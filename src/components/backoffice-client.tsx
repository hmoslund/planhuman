"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  country: string;
  emailVerified: boolean;
  userNumber: number | null;
  isProtected: boolean;
  userType: string;
  donated: boolean;
  rowCount: number;
};

const MAX_ROWS = 400;

function currencyFor(country: string) {
  if (country === "UK") return "£";
  if (country === "US") return "$";
  if (country === "FI") return "€";
  if (country === "SE") return "kr";
  if (country === "NO") return "kr";
  return "DKR ";
}

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

  async function toggleDonated(userId: string, current: boolean) {
    const response = await fetch(`/api/backoffice?userId=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donated: !current }),
    });
    const data = await response.json();
    setMessage(data.message ?? data.error ?? "Action complete.");
    await loadUsers();
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Delete this user and all of their data? This cannot be undone.")) return;
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
            <p className="mt-2 text-sm text-slate-600">
              Donations from BuyMeACoffee are marked automatically via webhook; you can also toggle a donation manually.
            </p>
          </div>
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => router.push("/dashboard")}>
            Return to dashboard
          </button>
        </div>

        {message && <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">User #</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Donated</th>
                <th className="px-4 py-3 font-semibold">Rows</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className={user.isProtected ? "bg-sky-50/60" : ""}>
                  <td className="px-4 py-3">{user.userNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    {user.name || <span className="text-slate-400">—</span>}
                    {user.isProtected && (
                      <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.donated ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.isProtected}
                      onClick={() => toggleDonated(user.id, user.donated)}
                    >
                      {user.donated ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {user.rowCount}
                    <span className="text-slate-400"> / {MAX_ROWS}</span>
                  </td>
                  <td className="px-4 py-3">{user.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    {user.isProtected ? (
                      <span className="text-xs text-slate-400">Protected</span>
                    ) : (
                      <button
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete user
                      </button>
                    )}
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
