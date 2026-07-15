"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TargetIcon, TicketIcon, TrashIcon, ZapIcon } from "@/components/icons/Icons";

export default function EditPredictionPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [publishingCode, setPublishingCode] = useState(false);
  const [codePublishedMessage, setCodePublishedMessage] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this Pro Prediction?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/predictions/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prediction.");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    league: "",
    sport: "football",
    matchDate: "",
    matchTime: "",
    prediction: "",
    confidence: 85,
    bookingCode: "",
    bookmaker: "SportyBet",
    analysis: "",
    status: "PENDING",
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
            bookingCode: data.booking_code || "",
            bookmaker: data.bookmaker || "SportyBet",
            analysis: data.analysis,
            status: data.status || "PENDING",
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

  const addQuickTag = (tag: string) => {
    const existingTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!existingTags.includes(tag)) {
      const nextTags = [...existingTags, tag].join(", ");
      setFormData({ ...formData, tags: nextTags });
    }
  };

  const handlePublishBookingCode = async () => {
    if (!formData.bookingCode.trim()) {
      alert("Please enter a Booking Code before publishing.");
      return;
    }
    setPublishingCode(true);
    setCodePublishedMessage("");
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const res = await fetch(`/api/admin/predictions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags: tagsArray }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish booking code.");
      }
      setCodePublishedMessage("✅ VIP Booking Code published successfully to Pro Feed!");
      setTimeout(() => setCodePublishedMessage(""), 6000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishingCode(false);
    }
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
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-gray-400">Loading prediction details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/admin" className="text-[var(--color-brand-emerald)] hover:underline text-sm font-bold mb-4 inline-block">
          ← Back to Overview
        </Link>
        <h1 className="text-3xl font-bold font-heading text-white">Edit Pro Prediction</h1>
        <p className="text-gray-400 mt-2">Update prediction details, publish outcome status, or manage VIP slip codes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
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

        {/* Section 1: Fixture & Competition */}
        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <span className="text-base font-bold text-white tracking-wide">⚽ Fixture & Competition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Home Team</label>
              <input required name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Away Team</label>
              <input required name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">League / Tournament</label>
              <input required name="league" value={formData.league} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Sport Discipline</label>
              <select name="sport" value={formData.sport} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors">
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label htmlFor="editMatchDateInput" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                <span>📅</span> Match Date
              </label>
              <input
                id="editMatchDateInput"
                required
                name="matchDate"
                type="date"
                style={{ colorScheme: "dark" }}
                value={formData.matchDate}
                onChange={handleChange}
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]/30 transition-colors cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="editMatchTimeInput" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                <span>🕒</span> Match Time (GMT)
              </label>
              <input
                id="editMatchTimeInput"
                required
                name="matchTime"
                type="time"
                style={{ colorScheme: "dark" }}
                value={formData.matchTime}
                onChange={handleChange}
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]/30 transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Verdict & Confidence */}
        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <TargetIcon size={18} className="text-[var(--color-brand-emerald)]" />
            <span className="text-base font-bold text-white tracking-wide">AI Verdict & Confidence Rating</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">AI Verdict / Prediction Pick</label>
              <input required name="prediction" value={formData.prediction} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-300">Confidence Score (1-100)</label>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  Number(formData.confidence) >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                  Number(formData.confidence) >= 65 ? "bg-amber-500/20 text-amber-400" :
                  "bg-zinc-800 text-zinc-300"
                }`}>
                  {formData.confidence}% {Number(formData.confidence) >= 80 ? "HIGH EV" : Number(formData.confidence) >= 65 ? "VALUE" : "STANDARD"}
                </span>
              </div>
              <input required name="confidence" type="number" min="1" max="100" value={formData.confidence} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors font-mono" />
            </div>
          </div>
        </div>

        {/* Section 3: Pro VIP Booking Code & Platform */}
        <div className="bg-[#121215] border border-[var(--color-brand-emerald)]/40 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <TicketIcon size={16} className="text-[var(--color-brand-emerald)]" />
              <span className="text-sm font-mono font-bold text-[var(--color-brand-emerald)] uppercase tracking-wider">Pro VIP Betting Code (Visible ONLY to Pro Members)</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider bg-[var(--color-brand-emerald)]/10 text-[var(--color-brand-emerald)] px-2 py-0.5 rounded font-bold">Pro Feed Exclusive</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Booking Code / Slip Code</label>
              <input name="bookingCode" value={formData.bookingCode} onChange={handleChange} placeholder="e.g. BC98J2X or 7K9F2W" className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Betting Platform / Bookmaker</label>
              <select name="bookmaker" value={formData.bookmaker} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors">
                <option value="SportyBet">SportyBet</option>
                <option value="Bet9ja">Bet9ja</option>
                <option value="1xBet">1xBet</option>
                <option value="BetKing">BetKing</option>
                <option value="MSport">MSport</option>
                <option value="22Bet">22Bet</option>
                <option value="Betway">Betway</option>
                <option value="Other">Other / Multi-Platform</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-400">
              {codePublishedMessage ? (
                <span className="text-emerald-400 font-semibold">{codePublishedMessage}</span>
              ) : (
                "Instantly publish or update just the VIP Booking Code without leaving or submitting the rest of the form."
              )}
            </span>
            <button
              type="button"
              onClick={handlePublishBookingCode}
              disabled={publishingCode}
              className="px-4 py-2.5 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(19,133,97,0.3)] disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <ZapIcon size={14} />
              <span>{publishingCode ? "Publishing Code..." : "Publish VIP Code Only"}</span>
            </button>
          </div>
        </div>

        {/* Section 4: Outcome Status & Tags */}
        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <span className="text-base font-bold text-white tracking-wide">📊 Outcome Status & Tags</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Match Outcome Status (For AI Analytics)</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors">
                <option value="PENDING">⏳ PENDING (Awaiting Match)</option>
                <option value="WON">✅ WON (+0.85u ROI)</option>
                <option value="LOST">❌ LOST (-1.0u ROI)</option>
                <option value="VOID">⚪ VOID / POSTPONED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tags (Comma Separated)</label>
              <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors mb-3" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Quick Add:</span>
                {["High EV", "Pro Pick", "Value Bet", "Bankroll Builder", "Top 5 Leagues Lock", "UCL Lock"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addQuickTag(tag)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded border border-zinc-700 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Detailed Rationale / Analysis</label>
            <textarea required name="analysis" value={formData.analysis} onChange={handleChange} rows={5} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"></textarea>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading || deleting}
            className="flex-1 w-full py-4 bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-actionGreen)] text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(33,205,141,0.2)]"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="w-full sm:w-auto px-8 py-4 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-bold rounded-xl transition-colors disabled:opacity-50 text-lg flex items-center justify-center gap-2"
          >
            <TrashIcon size={18} />
            <span>{deleting ? "Deleting..." : "Delete Pick"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
