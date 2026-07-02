"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-3xl">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Welcome to TicketWave KE! Check your email at{" "}
            <span className="text-green-400">{form.email}</span> to verify your account before logging in.
          </p>
          <Link
            href="/login"
            className="block w-full bg-green-400 text-black py-3 rounded-full font-bold hover:bg-green-300 transition text-sm text-center">
            Go to Login
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
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-gray-400 text-sm">
              Join TicketWave KE and start discovering amazing events.
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
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                placeholder="Felix Muthoka"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-green-400/50 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email Address</label>
              <input
                required
                type="email"
                placeholder="felix@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-green-400/50 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-16 text-white text-sm placeholder-gray-600 focus:border-green-400/50 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white transition font-medium">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Use at least 8 characters with uppercase, lowercase, a number and a special character.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-black py-3.5 rounded-full font-bold text-sm hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* GOOGLE SIGN IN */}
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin + "/events" },
              });
            }}
            className="w-full flex items-center justify-center gap-3 border border-white/10 text-white py-3 rounded-full text-sm font-medium hover:bg-white/5 transition">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

        </div>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:underline font-medium">
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}