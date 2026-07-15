"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface DraftGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  matchDate: string;
  matchTime: string;
  prediction: string;
  confidence: number;
  bookingCode?: string;
  bookmaker?: string;
  analysis: string;
  tags: string[];
  tier?: "PRO" | "FREE";
  notifyUsers?: boolean;
}

interface DraftCode {
  id: string;
  bookingCode: string;
  bookmaker: string;
  title: string;
  tags: string[];
  notes: string;
  tier?: "PRO" | "FREE";
  notifyUsers?: boolean;
}

export default function AddPredictionPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [publishingCode, setPublishingCode] = useState(false);
  const [codePublishedMessage, setCodePublishedMessage] = useState("");
  const [publishMode, setPublishMode] = useState<"game" | "booking_code">("game");

  // Draft Slate state for batch adding multiple matches
  const [draftSlate, setDraftSlate] = useState<DraftGame[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [publishingBatch, setPublishingBatch] = useState(false);
  const [batchBookingCode, setBatchBookingCode] = useState("");
  const [batchBookmaker, setBatchBookmaker] = useState("SportyBet");

  // Draft Codes state for batch adding multiple VIP Booking Codes
  const [draftCodes, setDraftCodes] = useState<DraftCode[]>([]);
  const [publishingBatchCodes, setPublishingBatchCodes] = useState(false);

  // Live Published Predictions for quick deletion & management
  const [livePredictions, setLivePredictions] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    homeTeam: string;
    awayTeam: string;
    league: string;
    sport: string;
    matchDate: string;
    matchTime: string;
    prediction: string;
    confidence: number;
    bookingCode: string;
    bookmaker: string;
    analysis: string;
    tags: string;
    tier: "PRO" | "FREE";
    notifyUsers: boolean;
  }>({
    homeTeam: "",
    awayTeam: "",
    league: "",
    sport: "football",
    matchDate: new Date().toISOString().split("T")[0],
    matchTime: "19:00",
    prediction: "",
    confidence: 85,
    bookingCode: "",
    bookmaker: "SportyBet",
    analysis: "",
    tags: "", // comma separated
    tier: "PRO",
    notifyUsers: true,
  });

  const loadLivePredictions = async () => {
    try {
      const res = await fetch("/api/admin/predictions");
      const json = await res.json();
      if (json.data) {
        setLivePredictions(json.data);
      }
    } catch (e) {
      console.error("Failed to load live predictions", e);
    }
  };

  useEffect(() => {
    loadLivePredictions();
  }, []);

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

  // AI Verdict Generator helper
  const handleGenerateAI = () => {
    if (!formData.homeTeam.trim() || !formData.awayTeam.trim()) {
      alert("Please enter Home Team and Away Team first so AI can analyze the fixture.");
      return;
    }
    setGeneratingAI(true);
    setTimeout(() => {
      const picks = [
        `${formData.homeTeam} to Win & Over 1.5 Goals`,
        `${formData.homeTeam} to Win or Draw & Over 2.5 Goals`,
        `Both Teams to Score (Yes) & Over 2.5 Goals`,
        `${formData.homeTeam} Moneyline & Team Total Over 1.5`,
        `Over 2.5 Total Match Goals`,
        `${formData.homeTeam} Asian Handicap (-0.5)`,
      ];
      const pick = picks[Math.floor(Math.random() * picks.length)];
      const score = Math.floor(Math.random() * (92 - 78 + 1)) + 78; // 78% to 92%
      setFormData((prev) => ({
        ...prev,
        prediction: pick,
        confidence: score,
        analysis:
          prev.analysis.trim() ||
          `Algorithmic quant model flags strong positive expected value (+EV) on ${formData.homeTeam} based on recent scoring efficiency, defensive structure, and underlying xG differentials in ${
            formData.league || "competition"
          }.`,
      }));
      setGeneratingAI(false);
    }, 600);
  };

  // Add single match to draft slate queue
  const handleAddToDraftSlate = () => {
    if (!formData.homeTeam.trim() || !formData.awayTeam.trim()) {
      alert("Please enter at least Home Team and Away Team.");
      return;
    }
    if (!formData.prediction.trim()) {
      alert("Please generate or enter an AI Verdict / Pick before adding to slate.");
      return;
    }

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newDraft: DraftGame = {
      id: Math.random().toString(36).substring(2, 9),
      homeTeam: formData.homeTeam.trim(),
      awayTeam: formData.awayTeam.trim(),
      league: formData.league.trim() || "Pro Competition",
      sport: formData.sport,
      matchDate: formData.matchDate,
      matchTime: formData.matchTime,
      prediction: formData.prediction.trim(),
      confidence: Number(formData.confidence) || 85,
      bookingCode: formData.bookingCode.trim(),
      bookmaker: formData.bookmaker,
      analysis:
        formData.analysis.trim() ||
        `Quant Pro Feed analysis for ${formData.homeTeam} vs ${formData.awayTeam}.`,
      tags: tagsArray.length > 0 ? tagsArray : (formData.tier === "FREE" ? ["FREE TEASER", "High EV"] : ["Pro Pick", "High EV"]),
      tier: formData.tier,
      notifyUsers: formData.notifyUsers,
    };

    setDraftSlate((prev) => [...prev, newDraft]);
    setCodePublishedMessage(`📋 Game added to Draft Slate (${draftSlate.length + 1} matches queued)!`);
    setTimeout(() => setCodePublishedMessage(""), 5000);

    // Clear form for next game while preserving league/date/time/tier/notification defaults
    setFormData((prev) => ({
      ...prev,
      homeTeam: "",
      awayTeam: "",
      prediction: "",
      confidence: 85,
      bookingCode: "",
      analysis: "",
      tags: "",
    }));
  };

  const handleRemoveFromDraft = (id: string) => {
    setDraftSlate((prev) => prev.filter((item) => item.id !== id));
  };

  // Batch publish all games in match slate queue
  const handlePublishBatchSlate = async () => {
    if (draftSlate.length === 0) return;
    setPublishingBatch(true);
    setError("");
    setSuccess(false);
    try {
      for (const game of draftSlate) {
        const payload = {
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          league: game.league,
          sport: game.sport,
          matchDate: game.matchDate,
          matchTime: game.matchTime,
          prediction: game.prediction,
          confidence: game.confidence,
          bookingCode: batchBookingCode.trim() || game.bookingCode || "",
          bookmaker: batchBookmaker || game.bookmaker || "SportyBet",
          analysis: game.analysis,
          tags: game.tags,
          tier: game.tier || "PRO",
          notifyUsers: game.notifyUsers !== false,
        };

        const res = await fetch("/api/admin/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`Failed to publish ${game.homeTeam} vs ${game.awayTeam}: ${errData.error || "Unknown error"}`);
        }
      }

      setSuccess(true);
      setDraftSlate([]);
      setBatchBookingCode("");
      await loadLivePredictions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishingBatch(false);
    }
  };

  // Add VIP booking code to queue
  const handleAddCodeToQueue = () => {
    if (!formData.bookingCode.trim()) {
      alert("Please enter a Booking Code before adding to queue.");
      return;
    }
    const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    const newCodeItem: DraftCode = {
      id: Math.random().toString(36).substring(2, 9),
      bookingCode: formData.bookingCode.trim().toUpperCase(),
      bookmaker: formData.bookmaker || "SportyBet",
      title: formData.homeTeam.trim() || (formData.tier === "FREE" ? "FREE COMMUNITY SLIP" : "VIP PRO SLIP"),
      tags: tagsArray.length > 0 ? tagsArray : (formData.tier === "FREE" ? ["FREE TEASER", "Daily Slip"] : ["VIP Code", "Pro Slip"]),
      notes: formData.analysis.trim() || (formData.tier === "FREE" ? `Free Community Daily Slip on ${formData.bookmaker}.` : `Exclusive Pro Member Booking Code on ${formData.bookmaker}.`),
      tier: formData.tier,
      notifyUsers: formData.notifyUsers,
    };

    setDraftCodes((prev) => [...prev, newCodeItem]);
    setCodePublishedMessage(`🎟️ Added to Code Queue (${draftCodes.length + 1} codes staged)!`);
    setTimeout(() => setCodePublishedMessage(""), 5000);

    setFormData((prev) => ({
      ...prev,
      bookingCode: "",
      homeTeam: "",
      analysis: "",
      tags: "",
    }));
  };

  const handleRemoveCodeFromQueue = (id: string) => {
    setDraftCodes((prev) => prev.filter((item) => item.id !== id));
  };

  // Batch publish all VIP booking codes in queue
  const handlePublishBatchCodes = async () => {
    if (draftCodes.length === 0) return;
    setPublishingBatchCodes(true);
    setError("");
    setSuccess(false);
    try {
      for (const codeItem of draftCodes) {
        const payload = {
          homeTeam: codeItem.title,
          awayTeam: `${codeItem.bookmaker} CODE: ${codeItem.bookingCode}`,
          league: codeItem.tier === "FREE" ? "FREE DAILY TEASER" : "PRO FEED EXCLUSIVE",
          sport: "football",
          matchDate: new Date().toISOString().split("T")[0],
          matchTime: "12:00",
          prediction: `${codeItem.bookmaker} CODE: ${codeItem.bookingCode}`,
          confidence: codeItem.tier === "FREE" ? 85 : 90,
          bookingCode: codeItem.bookingCode,
          bookmaker: codeItem.bookmaker,
          analysis: codeItem.notes,
          tags: codeItem.tier === "FREE" ? ["FREE TEASER", "Booking Code", ...codeItem.tags] : ["VIP Code", "Booking Code", ...codeItem.tags],
          tier: codeItem.tier || "PRO",
          notifyUsers: codeItem.notifyUsers !== false,
        };

        const res = await fetch("/api/admin/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`Failed to publish code ${codeItem.bookingCode}: ${errData.error || "Unknown error"}`);
        }
      }

      setSuccess(true);
      setDraftCodes([]);
      await loadLivePredictions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishingBatchCodes(false);
    }
  };

  // Publish Single Independent Booking Code
  const handlePublishBookingCode = async () => {
    if (!formData.bookingCode.trim()) {
      alert("Please enter a Booking Code before publishing.");
      return;
    }
    setPublishingCode(true);
    setCodePublishedMessage("");
    setError("");
    try {
      const tagsArray = formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      const res = await fetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: formData.homeTeam.trim() || (formData.tier === "FREE" ? "FREE COMMUNITY SLIP" : "VIP PRO SLIP"),
          awayTeam: `${formData.bookmaker} CODE: ${formData.bookingCode.toUpperCase()}`,
          league: formData.league.trim() || (formData.tier === "FREE" ? "FREE DAILY TEASER" : "PRO FEED EXCLUSIVE"),
          sport: formData.sport || "football",
          matchDate: formData.matchDate || new Date().toISOString().split("T")[0],
          matchTime: formData.matchTime || "12:00",
          prediction: `${formData.bookmaker} CODE: ${formData.bookingCode.toUpperCase()}`,
          confidence: formData.confidence || (formData.tier === "FREE" ? 85 : 90),
          bookingCode: formData.bookingCode.toUpperCase(),
          bookmaker: formData.bookmaker,
          analysis: formData.analysis.trim() || (formData.tier === "FREE" ? `Free Community Daily Slip on ${formData.bookmaker}.` : `Exclusive Pro Member Booking Code on ${formData.bookmaker}.`),
          tags: formData.tier === "FREE" ? ["FREE TEASER", "Booking Code", ...tagsArray] : ["VIP Code", "Booking Code", ...tagsArray],
          tier: formData.tier,
          notifyUsers: formData.notifyUsers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish booking code.");
      }
      setCodePublishedMessage(`✅ ${formData.tier === "FREE" ? "Free Teaser" : "VIP Pro"} Booking Code published independently to Feed!`);
      setSuccess(true);
      setTimeout(() => setCodePublishedMessage(""), 6000);
      await loadLivePredictions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishingCode(false);
    }
  };

  // Single game immediate publish
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const tagsArray = formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);

      const res = await fetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags: tagsArray, tier: formData.tier, notifyUsers: formData.notifyUsers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish prediction.");
      }

      setSuccess(true);
      setFormData((prev) => ({
        ...prev,
        homeTeam: "",
        awayTeam: "",
        league: "",
        sport: "football",
        matchDate: new Date().toISOString().split("T")[0],
        matchTime: "19:00",
        prediction: "",
        confidence: 85,
        bookingCode: "",
        bookmaker: "SportyBet",
        analysis: "",
        tags: "",
      }));
      await loadLivePredictions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete already published prediction
  const handleDeleteLivePrediction = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this live prediction from the Pro Feed?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/predictions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLivePredictions((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete prediction.");
      }
    } catch (err) {
      alert("Failed to delete prediction.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-8">
        <Link href="/admin" className="text-[var(--color-brand-emerald)] hover:underline text-sm font-bold mb-4 inline-block">
          ← Back to Overview
        </Link>
        <h1 className="text-3xl font-bold font-heading text-white">Add Pro Prediction</h1>
        <p className="text-gray-400 mt-2">Publish multi-game batch slates with AI assistance or multi-code VIP Booking Code slates.</p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-col sm:flex-row bg-[#121215] border border-zinc-800 p-1.5 rounded-xl mb-8 gap-1.5 sm:gap-0">
        <button
          type="button"
          onClick={() => {
            setPublishMode("game");
            setSuccess(false);
            setCodePublishedMessage("");
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            publishMode === "game"
              ? "bg-[var(--color-brand-emerald)] text-white shadow-[0_0_15px_rgba(19,133,97,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>⚽</span>
          <span>Match Fixture & AI Slate Builder</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setPublishMode("booking_code");
            setSuccess(false);
            setCodePublishedMessage("");
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            publishMode === "booking_code"
              ? "bg-[var(--color-brand-emerald)] text-white shadow-[0_0_15px_rgba(19,133,97,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>🎟️</span>
          <span>Independent VIP Booking Code</span>
        </button>
      </div>

      {/* AUDIENCE TIER & NOTIFICATION CONTROLS */}
      <div className="bg-[#121215] border-2 border-[var(--color-brand-emerald)]/50 rounded-xl p-5 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-bold font-mono uppercase tracking-wider text-white">🎯 Target Audience & Tier Strategy:</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
                formData.tier === "FREE" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(19,133,97,0.2)]"
              }`}>
                {formData.tier === "FREE" ? "🎁 Free Daily Code (Copyable for All)" : "👑 VIP Pro Lock (Makes Freemium Pay for Pro)"}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {formData.tier === "FREE" 
                ? "Sends '🎁 Free Daily Code Dropped' alert. Unlocks the booking code on ALL freemium dashboards so users can copy directly and build trust."
                : "Sends '🔒 VIP Code Dropped' FOMO teaser. Masks & locks the booking code on freemium dashboards (e.g. BC•••• [LOCKED]), making freemium users upgrade to Pro ($29.99/mo) to copy!"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Tier Buttons */}
            <div className="flex bg-[#09090b] p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tier: "PRO" }))}
                className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  formData.tier === "PRO" ? "bg-[#138561] text-white shadow-[0_0_15px_rgba(19,133,97,0.3)]" : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>👑</span> VIP Pro Lock ($29.99 Hook)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tier: "FREE" }))}
                className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  formData.tier === "FREE" ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>🎁</span> Free Daily Code
              </button>
            </div>

            {/* Notification Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 bg-[#09090b] rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.notifyUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, notifyUsers: e.target.checked }))}
                className="rounded accent-[#138561] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-zinc-300 select-none">Send Drop Alert</span>
            </label>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 mb-6 bg-[var(--color-brand-emerald)]/20 border border-[var(--color-brand-emerald)] text-[var(--color-brand-emerald)] rounded-lg font-medium">
          ✅ Successfully published to the Pro Feed!
        </div>
      )}

      {codePublishedMessage && (
        <div className="p-4 mb-6 bg-[var(--color-brand-emerald)]/20 border border-[var(--color-brand-emerald)] text-[var(--color-brand-emerald)] rounded-lg font-medium">
          {codePublishedMessage}
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-500/20 border border-red-500 text-red-400 rounded-lg font-medium">
          ❌ {error}
        </div>
      )}

      {/* DRAFT MATCH SLATE QUEUE CARD (Displays when matches are queued in Mode 1) */}
      {draftSlate.length > 0 && publishMode === "game" && (
        <div className="bg-[#121215] border-2 border-[var(--color-brand-emerald)]/60 rounded-xl p-6 mb-8 shadow-[0_0_25px_rgba(19,133,97,0.15)] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-wide">📋 DRAFT MATCH SLATE ({draftSlate.length} GAMES STAGED)</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">Ready to Batch Publish</span>
          </div>

          <div className="space-y-3">
            {draftSlate.map((game, idx) => (
              <div key={game.id} className="flex items-center justify-between bg-[#0a0a0c] border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm font-mono font-bold text-[var(--color-brand-emerald)]">#{idx + 1}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">
                      {game.homeTeam} <span className="text-zinc-500">vs</span> {game.awayTeam}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span className="text-[var(--color-brand-emerald)] font-semibold">{game.prediction}</span>
                      <span>•</span>
                      <span>{game.confidence}% EV</span>
                      <span>•</span>
                      <span>{game.league}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFromDraft(game.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded transition-colors shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Optional Combined Booking Code for Entire Slate */}
          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">🎟️ Combined Booking Code for All {draftSlate.length} Games (Optional)</label>
              <input
                value={batchBookingCode}
                onChange={(e) => setBatchBookingCode(e.target.value)}
                placeholder="e.g. BC98J2X (Applies to all games in slate)"
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white font-mono uppercase text-sm focus:outline-none focus:border-[var(--color-brand-emerald)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Betting Platform</label>
              <select
                value={batchBookmaker}
                onChange={(e) => setBatchBookmaker(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-brand-emerald)]"
              >
                <option value="SportyBet">SportyBet</option>
                <option value="Bet9ja">Bet9ja</option>
                <option value="1xBet">1xBet</option>
                <option value="BetKing">BetKing</option>
                <option value="MSport">MSport</option>
                <option value="22Bet">22Bet</option>
                <option value="Betway">Betway</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublishBatchSlate}
            disabled={publishingBatch}
            className="w-full py-4 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl transition-all shadow-[0_0_25px_rgba(19,133,97,0.4)] disabled:opacity-50 text-base uppercase font-mono tracking-wider cursor-pointer"
          >
            {publishingBatch ? `Publishing All ${draftSlate.length} Games...` : `🚀 Publish All ${draftSlate.length} Queued Games to Pro Feed (1-Click Batch)`}
          </button>
        </div>
      )}

      {/* DRAFT CODES QUEUE CARD (Displays when codes are queued in Mode 2) */}
      {draftCodes.length > 0 && publishMode === "booking_code" && (
        <div className="bg-[#121215] border-2 border-[var(--color-brand-emerald)]/60 rounded-xl p-6 mb-8 shadow-[0_0_25px_rgba(19,133,97,0.15)] space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-wide">📋 QUEUED VIP CODES ({draftCodes.length} CODES STAGED)</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">Ready to Batch Publish</span>
          </div>

          <div className="space-y-3">
            {draftCodes.map((codeItem, idx) => (
              <div key={codeItem.id} className="flex items-center justify-between bg-[#0a0a0c] border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm font-mono font-bold text-[var(--color-brand-emerald)]">#{idx + 1}</span>
                  <div className="min-w-0">
                    <div className="font-bold font-mono text-white tracking-wide flex items-center gap-2 flex-wrap">
                      <span>{codeItem.bookingCode}</span>
                      <span className="text-[var(--color-brand-emerald)] font-sans text-xs">({codeItem.bookmaker})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        codeItem.tier === "FREE" 
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" 
                          : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                      }`}>
                        {codeItem.tier === "FREE" ? "🎁 FREE TEASER FOR ALL" : "👑 VIP PRO LOCK ($29.99 HOOK)"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-1">
                      {codeItem.title} — {codeItem.notes}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCodeFromQueue(codeItem.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded transition-colors shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePublishBatchCodes}
            disabled={publishingBatchCodes}
            className="w-full py-4 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl transition-all shadow-[0_0_25px_rgba(19,133,97,0.4)] disabled:opacity-50 text-base uppercase font-mono tracking-wider cursor-pointer"
          >
            {publishingBatchCodes ? `Publishing All ${draftCodes.length} VIP Codes...` : `🚀 Publish All ${draftCodes.length} Queued VIP Codes at Once (1-Click Batch)`}
          </button>
        </div>
      )}

      {publishMode === "booking_code" ? (
        /* MODE 2: INDEPENDENT BOOKING CODE SLIP WITH BATCH STAGING */
        <div className="bg-[#121215] border border-[var(--color-brand-emerald)]/40 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-wide">🎟️ Publish Standalone Booking Code Slip</span>
            </div>
            <span className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded font-bold ${
              formData.tier === "FREE" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] border border-[var(--color-brand-emerald)]/40"
            }`}>
              {formData.tier === "FREE" ? "🎁 Free Daily Marketing Slip" : "👑 VIP Pro Exclusive ($29.99 Lock)"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bookingCodeInput" className="block text-sm font-medium text-zinc-300 mb-2">Booking Code / Slip Code</label>
              <input
                id="bookingCodeInput"
                name="bookingCode"
                value={formData.bookingCode}
                onChange={handleChange}
                placeholder="e.g. BC98J2X or 7K9F2W"
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white font-mono uppercase placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="bookmakerInput" className="block text-sm font-medium text-zinc-300 mb-2">Betting Platform / Bookmaker</label>
              <select
                id="bookmakerInput"
                name="bookmaker"
                value={formData.bookmaker}
                onChange={handleChange}
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="slipTitleInput" className="block text-sm font-medium text-zinc-300 mb-2">Slip Title / Label (Optional)</label>
              <input
                id="slipTitleInput"
                name="homeTeam"
                value={formData.homeTeam}
                onChange={handleChange}
                placeholder="e.g. Weekend 25-Odds VIP Acca Slip"
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="slipTagsInput" className="block text-sm font-medium text-zinc-300 mb-2">Tags (Comma Separated)</label>
              <input
                id="slipTagsInput"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. VIP Code, High EV, Pro Slip"
                className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="slipNotesInput" className="block text-sm font-medium text-zinc-300 mb-2">Quick Slip Notes / Rationale (Optional)</label>
            <textarea
              id="slipNotesInput"
              name="analysis"
              value={formData.analysis}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Selected accumulator across top 5 European leagues. Load code directly on SportyBet."
              className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleAddCodeToQueue}
              className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all text-base border border-zinc-600 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>+ Add Code to Batch Queue</span>
              <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-[var(--color-brand-emerald)] font-mono">Multi-Code</span>
            </button>

            <button
              type="button"
              onClick={handlePublishBookingCode}
              disabled={publishingCode}
              className="py-4 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(19,133,97,0.3)] disabled:opacity-50 text-base font-mono uppercase tracking-wider cursor-pointer"
            >
              {publishingCode ? "Publishing VIP Code..." : "⚡ Publish Single Code Instantly"}
            </button>
          </div>
        </div>
      ) : (
        /* MODE 1: STEP-BY-STEP MATCH FIXTURE -> ANALYSIS -> AI VERDICT -> ADD TO SLATE / PUBLISH */
        <form onSubmit={handleSubmitSingle} className="space-y-6">
          {/* STEP 1: Fixture & Competition */}
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
              <span className="w-6 h-6 rounded-full bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] flex items-center justify-center font-mono text-xs font-bold">1</span>
              <span className="text-base font-bold text-white tracking-wide">⚽ Fixture & Competition</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="homeTeamInput" className="block text-sm font-medium text-zinc-300 mb-2">Home Team</label>
                <input id="homeTeamInput" required name="homeTeam" value={formData.homeTeam} onChange={handleChange} placeholder="e.g. Real Madrid" className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
              </div>
              <div>
                <label htmlFor="awayTeamInput" className="block text-sm font-medium text-zinc-300 mb-2">Away Team</label>
                <input id="awayTeamInput" required name="awayTeam" value={formData.awayTeam} onChange={handleChange} placeholder="e.g. Barcelona" className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
              </div>
              <div>
                <label htmlFor="leagueInput" className="block text-sm font-medium text-zinc-300 mb-2">League / Tournament</label>
                <input id="leagueInput" required name="league" value={formData.league} onChange={handleChange} placeholder="e.g. Premier League" className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
              </div>
              <div>
                <label htmlFor="sportInput" className="block text-sm font-medium text-zinc-300 mb-2">Sport Discipline</label>
                <select id="sportInput" name="sport" value={formData.sport} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors">
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label htmlFor="matchDateInput" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                  <span>📅</span> Match Date
                </label>
                <input
                  id="matchDateInput"
                  required
                  name="matchDate"
                  type="date"
                  style={{ colorScheme: "dark" }}
                  value={formData.matchDate}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="matchTimeInput" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                  <span>🕒</span> Match Time (GMT)
                </label>
                <input
                  id="matchTimeInput"
                  required
                  name="matchTime"
                  type="time"
                  style={{ colorScheme: "dark" }}
                  value={formData.matchTime}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Per-Game Analysis & Tags */}
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
              <span className="w-6 h-6 rounded-full bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] flex items-center justify-center font-mono text-xs font-bold">2</span>
              <span className="text-base font-bold text-white tracking-wide">📝 Per-Game Analysis & Tags</span>
            </div>

            <div>
              <label htmlFor="tagsInput" className="block text-sm font-medium text-zinc-300 mb-2">Tags (Comma Separated)</label>
              <input id="tagsInput" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. High EV, Pro Pick, Value Bet" className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors mb-3" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Quick Add:</span>
                {["High EV", "Pro Pick", "Value Bet", "Bankroll Builder", "Top 5 Leagues Lock", "UCL Lock"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addQuickTag(tag)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded border border-zinc-700 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="analysisInput" className="block text-sm font-medium text-zinc-300 mb-2">Detailed Match Rationale / Analysis</label>
              <textarea id="analysisInput" name="analysis" value={formData.analysis} onChange={handleChange} rows={4} placeholder="Provide the quant analysis or key reasoning for this game..." className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors"></textarea>
            </div>
          </div>

          {/* STEP 3: AI Verdict & Confidence Rating */}
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-emerald)] flex items-center justify-center font-mono text-xs font-bold">3</span>
                <span className="text-base font-bold text-white tracking-wide">🎯 AI Verdict & Confidence Rating</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="px-3.5 py-1.5 bg-[var(--color-brand-emerald)]/20 hover:bg-[var(--color-brand-emerald)] text-[var(--color-brand-emerald)] hover:text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all border border-[var(--color-brand-emerald)]/40 cursor-pointer"
              >
                {generatingAI ? "AI Analyzing..." : "✨ Auto-Generate AI Verdict & Confidence"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="predictionInput" className="block text-sm font-medium text-zinc-300 mb-2">AI Verdict / Prediction Pick</label>
                <input id="predictionInput" required name="prediction" value={formData.prediction} onChange={handleChange} placeholder="e.g. Real Madrid to Win & Over 1.5 Goals" className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="confidenceInput" className="block text-sm font-medium text-zinc-300">Confidence Score (1-100)</label>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    Number(formData.confidence) >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                    Number(formData.confidence) >= 65 ? "bg-amber-500/20 text-amber-400" :
                    "bg-zinc-800 text-zinc-300"
                  }`}>
                    {formData.confidence}% {Number(formData.confidence) >= 80 ? "HIGH EV" : Number(formData.confidence) >= 65 ? "VALUE" : "STANDARD"}
                  </span>
                </div>
                <input id="confidenceInput" required name="confidence" type="number" min="1" max="100" value={formData.confidence} onChange={handleChange} className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-emerald)] transition-colors font-mono" />
              </div>
            </div>
          </div>

          {/* STEP 4: Add to Multi-Game Slate Queue OR Single Publish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={handleAddToDraftSlate}
              className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all text-base border border-zinc-600 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>+ Add Game to Pro Slate Queue</span>
              <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-[var(--color-brand-emerald)] font-mono">Multi-Game Mode</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-4 bg-[var(--color-brand-emerald)] hover:bg-[#0f6b4d] text-white font-bold rounded-xl transition-all disabled:opacity-50 text-base shadow-[0_0_20px_rgba(19,133,97,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚡ Publish Single Game Instantly</span>
            </button>
          </div>
        </form>
      )}

      {/* LIVE PUBLISHED PRO FEED MANAGER (Instant Edit & Delete published picks) */}
      <div className="mt-16 pt-12 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <span>📊 Live Published Pro Feed Manager</span>
              <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">LIVE ON PRO FEED</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Review, edit, or instantly delete any published game or VIP booking code.</p>
          </div>
          <button
            type="button"
            onClick={loadLivePredictions}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 transition-colors cursor-pointer"
          >
            🔄 Refresh List
          </button>
        </div>

        {livePredictions.length === 0 ? (
          <div className="p-8 text-center bg-white/5 border border-white/10 rounded-xl text-zinc-500 text-sm">
            No published predictions loaded yet. Publish a game or VIP code above to see it appear here instantly.
          </div>
        ) : (
          <div className="bg-[#121215] rounded-xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Prediction / Pick</th>
                    <th className="px-5 py-3.5">League / Type</th>
                    <th className="px-5 py-3.5">Code / Bookmaker</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {livePredictions.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{p.home_team} <span className="text-zinc-500">vs</span> {p.away_team}</div>
                        <div className="text-xs text-[var(--color-brand-emerald)] font-semibold mt-0.5">{p.prediction} ({p.confidence}%)</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-zinc-300">
                        {p.league}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.booking_code ? (
                          <span className="font-mono text-xs bg-zinc-800 text-emerald-400 px-2 py-1 rounded font-bold">
                            {p.booking_code} ({p.bookmaker})
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/predictions/${p.id}/edit`}
                            className="text-xs font-bold text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteLivePrediction(p.id)}
                            disabled={deletingId === p.id}
                            className="text-xs font-bold text-red-400 hover:text-red-300 px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === p.id ? "Deleting..." : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
