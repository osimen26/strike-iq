"use client";

import React from "react";

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  formattedPrice?: string;
  savingsBadge?: string;
  interval: string;
  features: string[];
}

interface SubscriptionModalsProps {
  flwModalPlan: Plan | null;
  flwSimUrl: string | null;
  flwProcessing: boolean;
  flwErrorMsg: string | null;
  setFlwModalPlan: (plan: Plan | null) => void;
  setFlwSimUrl: (url: string | null) => void;
  setFlwProcessing: (val: boolean) => void;
  showCancelConfirm: boolean;
  setShowCancelConfirm: (val: boolean) => void;
  handleCancelSubscription: () => void;
}

export function SubscriptionModals({
  flwModalPlan,
  flwSimUrl,
  flwProcessing,
  flwErrorMsg,
  setFlwModalPlan,
  setFlwSimUrl,
  setFlwProcessing,
  showCancelConfirm,
  setShowCancelConfirm,
  handleCancelSubscription,
}: SubscriptionModalsProps) {
  return (
    <>
      {/* Flutterwave Checkout Modal (Pop-Up) */}
      {flwModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0A0E27] border border-[#F5A623]/40 shadow-2xl overflow-hidden p-6 text-white space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center border border-[#F5A623]">
                  <span className="text-xl">🟡</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg font-heading tracking-wide">
                    Secure Checkout
                  </h3>
                  <p className="text-xs text-gray-400">
                    Strike IQ Pro Entitlement • Instant Activation
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFlwModalPlan(null);
                  setFlwSimUrl(null);
                  setFlwProcessing(false);
                }}
                className="text-gray-400 hover:text-white text-xl p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Plan:</span>
                <span className="font-bold text-white">{flwModalPlan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Billing Cycle:</span>
                <span className="font-bold text-[var(--color-brand-emerald)]">
                  {flwModalPlan.interval}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold border-t border-white/10 pt-2 mt-2">
                <span>Total Amount:</span>
                <span className="text-[#F5A623]">
                  {flwModalPlan.formattedPrice || `${flwModalPlan.currency} ${flwModalPlan.price}`}
                </span>
              </div>
            </div>

            {/* Simulated Payment Methods */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Payment Method
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 px-3 rounded-xl bg-[#F5A623]/20 border border-[#F5A623] text-xs font-bold text-white flex flex-col items-center gap-1 shadow-sm">
                  <span>💳</span> Card
                </button>
                <button className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-all">
                  <span>🏦</span> Bank
                </button>
                <button className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-all">
                  <span>📱</span> USSD / M-Pesa
                </button>
              </div>
            </div>

            {/* Developer Notice & Error Display */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <span>⚠️</span>
                <span>Why is this Pop-up showing in Demo/Sandbox Mode?</span>
              </div>
              {flwErrorMsg ? (
                <div className="bg-black/40 p-2.5 rounded-lg border border-amber-500/20 font-mono text-[11px] text-amber-100">
                  <span className="text-red-400 font-bold">Flutterwave API Note:</span> &quot;{flwErrorMsg}&quot;
                </div>
              ) : (
                <p className="text-[11px] opacity-90">
                  No valid live key was detected in Vercel environment variables.
                </p>
              )}
              <p className="text-[11px] text-gray-300">
                <span className="font-semibold text-white">💡 Pro Tip:</span> If you just added
                your live secret key, ensure regional card payments are enabled on your Flutterwave
                merchant account!
              </p>
            </div>

            {/* Action Button */}
            <button
              disabled={flwProcessing}
              onClick={() => {
                if (!flwSimUrl) return;
                setFlwProcessing(true);
                setTimeout(() => {
                  window.location.href = flwSimUrl;
                }, 1500);
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#E08D00] hover:from-[#FFB53D] hover:to-[#F5A623] text-black font-extrabold text-base uppercase tracking-wider shadow-lg shadow-[#F5A623]/30 transition-all flex items-center justify-center gap-2"
            >
              {flwProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay {flwModalPlan.formattedPrice || `${flwModalPlan.currency} ${flwModalPlan.price}`} Now</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Custom Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="bg-[#121215] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl shadow-red-900/20">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-red-950/60 flex items-center justify-center text-xl"
                aria-hidden="true"
              >
                🛑
              </div>
              <h2 id="cancel-modal-title" className="text-lg font-bold text-white">
                Stop Auto-Renewal?
              </h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to stop your recurring subscription? You will continue to enjoy
              full <span className="text-emerald-400 font-semibold">Pro VIP access</span> until your
              current billing period ends.{" "}
              <span className="block mt-2 text-xs text-amber-300/90 font-medium">
                ⚠️ Note: All subscription sales are final. Stopping renewal simply prevents automatic
                card billing next month without issuing a refund.
              </span>
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                className="flex-1 py-3 bg-red-900/80 hover:bg-red-800 border border-red-500/40 text-red-200 font-bold rounded-xl text-sm transition-colors"
              >
                Yes, Stop Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
