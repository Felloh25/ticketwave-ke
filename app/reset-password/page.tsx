"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Supabase exchanges the recovery token in the URL for a session
    // automatically, then fires this event once it's done.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Fallback: if a session already exists (link already processed),
    // allow the form to show instead of hanging on "verifying".
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        setLinkInvalid(true);
      }
    }, 2500);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: form.password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Redirecting you to login...
          </p>
        </div>
      </main>
    );
  }

  if (linkInvalid) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Link Expired</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            This reset link is invalid or has expired. Reset links only work once and expire after a while — please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="block w-full bg-green-400 text-black py-3 rounded-full font-bold hover:bg-green-300 transition text-sm text-center">
            Request New Link
          </Link>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <p className="text-gray-400 text-sm">Verifying your reset link...</p>
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
            <h1 className="text-2xl font-bold text-white mb-1">Set a new password</h1>
            <p className="text-gray-400 text-sm">
              Choose a strong password for your account.
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
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a new password"
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
                Use at least 8 characters.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Confirm Password</label>
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-green-400/50 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-black py-3.5 rounded-full font-bold text-sm hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mt-2">
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}