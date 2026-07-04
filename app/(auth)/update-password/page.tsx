"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-main text-white">
      
      {/* Header */}
      <div className="text-center w-full flex flex-col gap-2">
        <h2 className="text-white font-heading text-3xl md:text-4xl">Update Password</h2>
        <p className="text-zinc-400 font-main text-sm">Enter a new secure password for your account.</p>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-5 w-full">
        {error && (
          <div className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-3 rounded-lg border border-red-400/20">
            {error}
          </div>
        )}

        {/* New Password */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-zinc-300 text-sm font-medium">New Password</label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background-glass border border-border-glass rounded-lg pl-4 pr-12 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-[#138561] focus:ring-1 focus:ring-[#138561] transition-colors"
              placeholder="Enter your new password"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-zinc-300 text-sm font-medium">Confirm Password</label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background-glass border border-border-glass rounded-lg pl-4 pr-12 py-3 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-[#138561] focus:ring-1 focus:ring-[#138561] transition-colors"
              placeholder="Confirm your new password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#138561] text-white font-semibold text-[16px] py-3.5 rounded-lg hover:bg-[#0f6b4d] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(19,133,97,0.3)]"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
