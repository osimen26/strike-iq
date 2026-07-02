"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("If an account exists, a password reset link has been sent to your email.");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col gap-8 font-main text-brand-mint">
      
      {/* Header */}
      <div className="text-center w-full flex flex-col gap-2">
        <h2 className="text-brand-mint font-heading text-3xl md:text-4xl">Reset Password</h2>
        <p className="text-brand-mint/80 font-main text-sm">Enter your email to receive a password reset link.</p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-5 w-full">
        {error && (
          <div className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-3 rounded-lg border border-red-400/20">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-brand-emerald text-sm font-medium text-center bg-brand-emerald/10 py-3 rounded-lg border border-brand-emerald/20">
            {success}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-brand-mint/90 text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background-glass border border-border-glass rounded-lg px-4 py-3 text-brand-mint text-sm placeholder:text-brand-mint/40 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-colors"
            placeholder="eg. johnfrans@gmail.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full bg-[var(--color-brand-emerald)] text-[var(--color-brand-mint)] font-semibold text-[16px] py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(16,137,96,0.3)]"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-brand-mint/70">
        Remembered your password?{" "}
        <Link href="/login" className="text-brand-mint font-semibold hover:underline decoration-brand-actionGreen underline-offset-4">
          Log in
        </Link>
      </p>

    </div>
  );
}
