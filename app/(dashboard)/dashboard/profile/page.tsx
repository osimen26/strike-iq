"use client";

import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "./actions";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        setName(data.user.user_metadata?.full_name || "");
      }
      setIsPending(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("emailNotifications", String(emailNotifications));
    formData.append("pushNotifications", String(pushNotifications));

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Profile updated!" });
    } else {
      setMessage({ type: "error", text: result.error || "Something went wrong." });
    }
    
    setIsSaving(false);
  };

  if (isPending) {
    return <div className="text-white">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading">My Profile</h1>
        <p className="text-[var(--color-accent-mutedSage)] mt-1">Manage your account settings and preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-[var(--color-brand-emerald)]/10 border-[var(--color-brand-emerald)]/20 text-[var(--color-brand-mint)]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info */}
        <div className="p-6 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/5 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[var(--color-brand-emerald)]"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[var(--color-brand-emerald)] rounded border-gray-600 bg-gray-700 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-gray-300">Receive email alerts for top predictions</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[var(--color-brand-emerald)] rounded border-gray-600 bg-gray-700 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-gray-300">Receive browser push notifications for live matches</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg font-semibold bg-[var(--color-brand-actionGreen)] text-white hover:bg-[var(--color-brand-actionGreenHover)] transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
