"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddPredictionPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    league: "",
    sport: "football",
    matchDate: "",
    matchTime: "",
    prediction: "",
    confidence: 85,
    analysis: "",
    tags: "", // comma separated
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Split tags string into an array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // We'll post to our secure API route
      const res = await fetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags: tagsArray }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save prediction.");
      }

      setSuccess(true);
      // Reset form
      setFormData({
        homeTeam: "", awayTeam: "", league: "", sport: "football",
        matchDate: "", matchTime: "", prediction: "", confidence: 85, analysis: "", tags: "",
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-white">Add Pro Prediction</h1>
        <p className="text-gray-400 mt-2">Publish a manual, high-confidence prediction for Pro users.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10">
        
        {success && (
          <div className="p-4 bg-[var(--color-brand-emerald)]/20 border border-[var(--color-brand-emerald)] text-[var(--color-brand-emerald)] rounded-lg font-medium">
            ✅ Prediction successfully published to the Pro Feed!
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg font-medium">
            ❌ {error}
          </div>
        )}

        {/* Teams & League */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Home Team</label>
            <input required name="homeTeam" value={formData.homeTeam} onChange={handleChange} placeholder="e.g. Arsenal" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Away Team</label>
            <input required name="awayTeam" value={formData.awayTeam} onChange={handleChange} placeholder="e.g. Chelsea" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">League/Tournament</label>
            <input required name="league" value={formData.league} onChange={handleChange} placeholder="e.g. Premier League" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sport</label>
            <select name="sport" value={formData.sport} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors">
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Match Date</label>
            <input required name="matchDate" type="date" value={formData.matchDate} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Match Time (GMT)</label>
            <input required name="matchTime" type="time" value={formData.matchTime} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
        </div>

        {/* The Prediction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">AI Verdict / Prediction Pick</label>
            <input required name="prediction" value={formData.prediction} onChange={handleChange} placeholder="e.g. Arsenal to Win" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confidence Score (1-100)</label>
            <input required name="confidence" type="number" min="1" max="100" value={formData.confidence} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Tags (Comma Separated)</label>
          <input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. High Value, Pro Pick, Value Bet" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
        </div>

        {/* Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Rationale / Analysis</label>
          <textarea required name="analysis" value={formData.analysis} onChange={handleChange} rows={5} placeholder="Provide the deep analytical reasoning for this pick..." className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-actionGreen)] text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(33,205,141,0.3)] hover:shadow-[0_0_30px_rgba(33,205,141,0.5)]"
        >
          {loading ? "Publishing to Pro Feed..." : "Publish Pro Prediction"}
        </button>

      </form>
    </div>
  );
}
