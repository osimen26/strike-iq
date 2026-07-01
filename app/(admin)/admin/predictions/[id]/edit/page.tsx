"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditPredictionPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    tags: "",
  });

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const { data, error } = await supabase
          .from('pro_predictions')
          .select('*')
          .eq('id', params.id as string)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            homeTeam: data.home_team,
            awayTeam: data.away_team,
            league: data.league,
            sport: data.sport,
            matchDate: data.match_date,
            matchTime: data.match_time,
            prediction: data.prediction,
            confidence: data.confidence,
            analysis: data.analysis,
            tags: data.tags ? data.tags.join(', ') : "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load prediction details.");
      } finally {
        setFetching(false);
      }
    };
    
    if (params.id) {
      fetchPrediction();
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const res = await fetch(`/api/admin/predictions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags: tagsArray }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update prediction.");
      }

      setSuccess(true);
      
      // Redirect back to overview after a short delay
      setTimeout(() => {
        router.push("/admin");
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-gray-400">Loading prediction data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/admin" className="text-[var(--color-brand-emerald)] hover:underline text-sm font-bold mb-4 inline-block">
          ← Back to Overview
        </Link>
        <h1 className="text-3xl font-bold font-heading text-white">Edit Pro Prediction</h1>
        <p className="text-gray-400 mt-2">Update the details or confidence score for this pick.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl">
        
        {success && (
          <div className="p-4 bg-[var(--color-brand-emerald)]/20 border border-[var(--color-brand-emerald)] text-[var(--color-brand-emerald)] rounded-lg font-medium">
            ✅ Prediction successfully updated! Redirecting...
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
            <input required name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Away Team</label>
            <input required name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">League/Tournament</label>
            <input required name="league" value={formData.league} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
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
            <input required name="prediction" value={formData.prediction} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confidence Score (1-100)</label>
            <input required name="confidence" type="number" min="1" max="100" value={formData.confidence} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Tags (Comma Separated)</label>
          <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
        </div>

        {/* Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Rationale / Analysis</label>
          <textarea required name="analysis" value={formData.analysis} onChange={handleChange} rows={5} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>

      </form>
    </div>
  );
}
