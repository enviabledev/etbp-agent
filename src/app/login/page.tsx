"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, loginWithToken } from "@/lib/auth";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"password" | "token">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setError(axiosErr?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleTokenLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || token.length !== 6) {
      setError("Enter your email and 6-digit token");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginWithToken(email, token);
      router.push("/");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setError(axiosErr?.response?.data?.detail || "Invalid or expired token");
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

        {/* Method toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setLoginMethod("password"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              loginMethod === "password"
                ? "bg-[#0057FF] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod("token"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              loginMethod === "token"
                ? "bg-[#0057FF] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Agent Token
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {loginMethod === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-14 px-4 text-base rounded-xl border border-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full h-14 px-4 text-base rounded-xl border border-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#0057FF] text-white text-base font-semibold rounded-xl hover:bg-[#0046CC] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTokenLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-14 px-4 text-base rounded-xl border border-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] outline-none"
            />
            <input
              type="text"
              value={token}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setToken(val);
              }}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              required
              className="w-full h-14 px-4 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] outline-none"
            />
            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full h-14 bg-[#0057FF] text-white text-base font-semibold rounded-xl hover:bg-[#0046CC] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Login with Token"}
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
              Generate a token from the Agent Mobile app &rarr; Auth Token
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
