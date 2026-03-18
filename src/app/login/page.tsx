"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚌</div>
          <h1 className="text-2xl font-bold text-gray-900">Terminal Agent Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Enviable Transport</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required
            className="w-full h-14 px-4 text-base rounded-xl border border-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] outline-none" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
            className="w-full h-14 px-4 text-base rounded-xl border border-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] outline-none" />
          <button type="submit" disabled={loading}
            className="w-full h-14 bg-[#0057FF] text-white text-base font-semibold rounded-xl hover:bg-[#0046CC] disabled:opacity-50 flex items-center justify-center">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
