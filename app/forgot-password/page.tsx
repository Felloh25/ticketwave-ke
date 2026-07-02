"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-3xl">
            📧
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            If an account exists for <span className="text-green-400">{email}</span>, we&apos;ve sent a link to reset your password. It may take a minute to arrive — check spam too.
          </p>
          <Link
            href="/login"
            className="block w-full bg-green-400 text-black py-3 rounded-full font-bold hover:bg-green-300 transition text-sm text-center">
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* CARD */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* HEADER */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-sm">TW</span>
              </div>
              <span className="text-lg font-bold text-white">
                TicketWave<span className="text-green-400">KE</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Forgot your password?</h1>
            <p className="text-gray-400 text-sm">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email Address</label>
              <input
                required
                type="email"
                placeholder="felix@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-green-400/50 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-black py-3.5 rounded-full font-bold text-sm hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mt-2">
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>

          </form>

        </div>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Remembered your password?{" "}
          <Link href="/login" className="text-green-400 hover:underline font-medium">
            Log in
          </Link>
        </p>

      </div>
    </main>
  );
}
