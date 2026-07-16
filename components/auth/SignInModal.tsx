"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ZapIcon, LockIcon } from "@/components/icons/Icons";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function SignInModal({ isOpen, onClose, reason = "copy this booking code and access live quantitative signals" }: SignInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetPath = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to initialize Google login");
      setLoading(false);
    }
  };

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/dashboard";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-xl p-6 md:p-8 z-10 flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-[var(--color-brand-emerald)]">
            <LockIcon size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-heading uppercase tracking-tight">
            Sign In Required
          </h2>
          <p className="text-zinc-300 text-sm font-mono leading-relaxed max-w-sm">
            Please sign in to <span className="text-[var(--color-brand-emerald)] font-bold">{reason}</span>.
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Google 1-Click */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{loading ? "Connecting..." : "Continue with Google (1-Click)"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 border-t border-zinc-800"></div>
            <span className="text-zinc-500 text-xs font-mono uppercase">OR</span>
            <div className="flex-1 border-t border-zinc-800"></div>
          </div>

          {/* Email Login & Sign Up */}
          <Link
            href={`/login?redirect=${encodeURIComponent(currentPath)}`}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#138561] hover:bg-[#0f6b4d] text-white transition-all text-center flex items-center justify-center gap-2"
          >
            <ZapIcon size={16} />
            <span>Log In with Email</span>
          </Link>

          <Link
            href={`/register?redirect=${encodeURIComponent(currentPath)}`}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#121215] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-center"
          >
            Create Free Account
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] font-mono text-zinc-500 text-center border-t border-zinc-900 pt-4">
          By signing in, you agree to Strike IQ&apos;s data verification & odds terms.
        </p>
      </div>
    </div>
  );
}
