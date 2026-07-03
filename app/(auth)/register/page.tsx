"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user && !data.session) {
      // Email verification is turned on in Supabase!
      setVerificationSent(true);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-main text-brand-mint">
      
      {/* Header */}
      <div className="text-center w-full flex flex-col gap-2">
        <h2 className="text-brand-mint font-heading text-3xl md:text-4xl">Sign Up Account</h2>
        <p className="text-brand-mint/80 font-main text-sm">Enter your personal data to create your account.</p>
      </div>

      {/* Social Logins */}
      <div className="flex w-full gap-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-3 border border-border-glass bg-background-glass rounded-lg p-3 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-brand-mint text-sm font-medium">Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center w-full gap-3">
        <div className="flex-1 border-t border-border-glass"></div>
        <span className="text-brand-mint/60 text-sm font-medium uppercase">Or</span>
        <div className="flex-1 border-t border-border-glass"></div>
      </div>

      {verificationSent ? (
        <div className="bg-emerald-950/40 border border-[var(--color-brand-emerald)] p-6 rounded-xl text-center flex flex-col gap-3 my-4 shadow-[0_0_25px_rgba(0,229,153,0.15)]">
          <div className="w-12 h-12 bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            📧
          </div>
          <h3 className="text-white font-bold text-lg">Verification Email Sent!</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            We sent a secure activation link to <span className="text-[var(--color-brand-emerald)] font-semibold">{email}</span>. Please check your inbox and click the link to activate your VIP account before logging in.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all"
          >
            Go to Login Page
          </Link>
        </div>
      ) : (
      <form onSubmit={handleRegister} className="flex flex-col gap-5 w-full">
        {error && (
          <div className="text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* First & Last Name */}
        <div className="flex flex-col sm:flex-row w-full gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-brand-mint/90 text-sm font-medium">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-background-glass border border-border-glass rounded-lg px-4 py-3 text-brand-mint text-sm placeholder:text-brand-mint/40 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-colors"
              placeholder="eg. John"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-brand-mint/90 text-sm font-medium">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-background-glass border border-border-glass rounded-lg px-4 py-3 text-brand-mint text-sm placeholder:text-brand-mint/40 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-colors"
              placeholder="eg. Francisco"
            />
          </div>
        </div>

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

        {/* Password */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-brand-mint/90 text-sm font-medium mb-0.5">Password</label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background-glass border border-border-glass rounded-lg pl-4 pr-12 py-3 text-brand-mint text-sm placeholder:text-brand-mint/40 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-colors"
              placeholder="Enter your password"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-mint/60 hover:text-brand-mint transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              )}
            </button>
          </div>
          <p className="text-brand-mint/70 text-xs mt-1">Must be at least 8 characters.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-brand-emerald)] text-[var(--color-brand-mint)] font-semibold text-[16px] py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(16,137,96,0.3)]"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      )}

      {/* Footer */}
      <p className="text-center text-sm text-brand-mint/70">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-mint font-semibold hover:underline decoration-brand-actionGreen underline-offset-4">
          Log in
        </Link>
      </p>

    </div>
  );
}
