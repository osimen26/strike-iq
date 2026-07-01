"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function SubscriptionPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.user_metadata?.plan === 'pro') {
        setIsPro(true);
      }
    });
  }, []);

  const handleMockUpgrade = async () => {
    setLoading(true);
    try {
      // For MVP testing, we instantly upgrade the user to "pro" in their metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { plan: 'pro' }
      });
      
      if (error) throw error;
      
      setIsPro(true);
      alert("Success! You have been upgraded to the Pro Plan for testing.");
      
      // Reload the page to reflect the new state across the app
      window.location.href = "/dashboard";
      
    } catch (err: any) {
      console.error("Upgrade error:", err.message);
      alert("Failed to upgrade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white font-heading tracking-tight">Upgrade Your Intelligence</h1>
        <p className="text-[var(--color-accent-mutedSage)] mt-2">Get full access to AI rationale, real-time alerts, and highest-confidence picks.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isAnnual ? 'bg-[var(--color-brand-emerald)] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-[var(--color-brand-emerald)] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Annually <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] uppercase">Save 10%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <div className="p-8 rounded-2xl bg-[var(--color-background-surface)] border border-white/5 hover:border-white/10 transition-colors flex flex-col">
          <h3 className="text-xl font-heading text-white mb-2">Basic Tier</h3>
          <p className="text-sm text-gray-400 mb-6">Standard predictions without AI reasoning.</p>
          <div className="text-4xl font-bold text-white mb-8 font-heading">Free</div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-sm text-gray-300"><span className="text-gray-500 mr-3">✓</span> Match Predictions (Limited)</li>
            <li className="flex items-center text-sm text-gray-300"><span className="text-gray-500 mr-3">✓</span> Top 5 Leagues Only</li>
            <li className="flex items-center text-sm text-gray-500 line-through"><span className="mr-3">✕</span> AI Confidence Scores</li>
            <li className="flex items-center text-sm text-gray-500 line-through"><span className="mr-3">✕</span> Detailed Match Analysis</li>
          </ul>
          
          <button className="w-full py-3 rounded-xl border border-white/10 text-white font-bold bg-white/5 cursor-not-allowed">
            {isPro ? "Downgrade" : "Current Plan"}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[var(--color-brand-emerald)]/10 to-[var(--color-background-surface)] border border-[var(--color-brand-emerald)]/30 hover:border-[var(--color-brand-emerald)]/60 transition-colors flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-emerald)]/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <h3 className="text-xl font-heading text-[var(--color-brand-mint)] mb-2 flex items-center gap-2">
            Pro Intelligence <span className="text-xl">👑</span>
          </h3>
          <p className="text-sm text-gray-400 mb-6">Full access to the predictive model.</p>
          
          <div className="flex items-baseline mb-8">
            <span className="text-4xl font-bold text-white font-heading">${isAnnual ? '8.99' : '9.99'}</span>
            <span className="text-gray-400 ml-2">/mo</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1 relative z-10">
            <li className="flex items-center text-sm text-white"><span className="text-[var(--color-brand-mint)] mr-3 font-bold">✓</span> Unlimited Match Predictions</li>
            <li className="flex items-center text-sm text-white"><span className="text-[var(--color-brand-mint)] mr-3 font-bold">✓</span> All Football Leagues & NBA</li>
            <li className="flex items-center text-sm text-white"><span className="text-[var(--color-brand-mint)] mr-3 font-bold">✓</span> Exact AI Confidence Scores</li>
            <li className="flex items-center text-sm text-white"><span className="text-[var(--color-brand-mint)] mr-3 font-bold">✓</span> Detailed Match Analysis & Rationale</li>
          </ul>
          
          <button 
            onClick={handleMockUpgrade}
            disabled={isPro || loading}
            className={`relative z-10 w-full py-3 rounded-xl text-white font-bold shadow-lg transition-colors ${
              isPro 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-[var(--color-brand-actionGreen)] hover:bg-[var(--color-brand-actionGreenHover)] shadow-black/50'
            }`}
          >
            {loading ? "Processing..." : isPro ? "Active Plan" : "Upgrade Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
