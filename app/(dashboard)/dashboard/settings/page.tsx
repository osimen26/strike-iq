"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  
  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Calls API to delete account
      alert("Account deletion requested.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading">Settings</h1>
        <p className="text-[var(--color-accent-mutedSage)] mt-1">Manage app preferences and security.</p>
      </div>

      <div className="space-y-6">
        {/* App Preferences */}
        <div className="p-6 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <h2 className="text-xl font-semibold text-white mb-4">Display Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Theme Mode</p>
              <p className="text-sm text-gray-400">Choose how Strike IQ looks to you.</p>
            </div>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-brand-emerald)]"
            >
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>

        {/* Security */}
        <div className="p-6 rounded-xl bg-[var(--color-background-surface)] border border-[var(--color-border-glass)]">
          <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div>
              <p className="text-white font-medium">Change Password</p>
              <p className="text-sm text-gray-400">Update your account password.</p>
            </div>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors text-sm">
              Update
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">Add an extra layer of security.</p>
            </div>
            <button className="px-4 py-2 bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-mint)] font-medium rounded-lg transition-colors text-sm">
              Enable 2FA
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-gray-400">Permanently delete your account and all associated data.</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
