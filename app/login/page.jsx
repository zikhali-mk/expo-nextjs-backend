"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#08050f] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10 border border-lime-400/20">
            <LogIn className="h-7 w-7 text-lime-400" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to your Debian Fx Trader account
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3.5 font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Your session will remain active for 30 days.
          </p>
        </div>
      </div>
    </main>
  );
}

