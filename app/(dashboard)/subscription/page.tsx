"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ZapIcon } from '@/components/icons/Icons';
import { useRegionalPricing } from '@/lib/pricing/useRegionalPricing';
import CountrySelector from '@/components/pricing/CountrySelector';
import { PaymentHistorySection } from '@/components/subscription/PaymentHistorySection';
import { SubscriptionModals } from '@/components/subscription/SubscriptionModals';

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

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  paymentMethod?: string;
  createdAt: string;
  plan?: Plan;
}

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [planName, setPlanName] = useState<string>('Free');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const { countryCode, config, setCountryCode } = useRegionalPricing();
  const [loading, setLoading] = useState(true);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [flwModalPlan, setFlwModalPlan] = useState<Plan | null>(null);
  const [flwSimUrl, setFlwSimUrl] = useState<string | null>(null);
  const [flwProcessing, setFlwProcessing] = useState<boolean>(false);
  const [flwErrorMsg, setFlwErrorMsg] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Prevent activation re-fire if searchParams changes after first successful processing
  const activationProcessed = useRef(false);

  useEffect(() => {
    fetchData();

    // Check URL params for payment redirect completion
    const paymentStatus = searchParams.get('payment');
    const flwStatus = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    const planIdParam = searchParams.get('planId');
    const planNameParam = searchParams.get('planName');

    if (flwStatus === 'cancelled') {
      setAlertMsg({
        type: 'info',
        text: 'Payment was cancelled. No charges were made to your account.',
      });
      router.replace('/subscription');
      return;
    }

    if (paymentStatus === 'simulated_success' && txRef && planIdParam) {
      // Guard against re-fire on searchParams re-renders
      if (activationProcessed.current) return;
      activationProcessed.current = true;

      setAlertMsg({ type: 'info', text: '⚡ Processing your Pro subscription activation...' });

      fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: txRef, planId: planIdParam }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAlertMsg({
              type: 'success',
              text: `🎉 Pro Subscription Activated! You are now subscribed to ${planNameParam || 'Strike IQ Pro'}. Enjoy full AI transparency!`,
            });
            fetchData();
            // Clean URL immediately to prevent any future re-fire
            router.replace('/subscription');
          } else {
            setAlertMsg({ type: 'error', text: data.error || 'Activation failed.' });
          }
        })
        .catch(() => setAlertMsg({ type: 'error', text: 'Network error during activation.' }));
    } else if (flwStatus === 'successful' || paymentStatus === 'success') {
      setAlertMsg({
        type: 'success',
        text: '🎉 Payment Successful! Your Strike IQ Pro subscription has been activated.',
      });
      fetchData();
      setTimeout(() => router.replace('/subscription'), 4000);
    }
  }, [searchParams]);

  async function fetchData(targetCode = countryCode) {
    const controller = new AbortController();
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        fetch(`/api/plans?country=${targetCode}`, { signal: controller.signal }),
        fetch('/api/subscriptions/current', { signal: controller.signal })
      ]);

      const plansData = await plansRes.json();
      const subData = await subRes.json();

      if (plansData.success && plansData.data) {
        setPlans(plansData.data);
      }
      if (subData.success) {
        setCurrentSub(subData.subscription);
        setPlanName(subData.planName || 'Free');
        setDaysRemaining(subData.daysRemaining || 0);
        setPayments(subData.payments || []);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error loading subscription dashboard:', err);
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  };

  const handleCancelSubscription = async () => {
    if (isCancelling) return; // Prevent double-submit
    setIsCancelling(true);
    setShowCancelConfirm(false);
    try {
      setAlertMsg({ type: "info", text: "Processing cancellation request..." });
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setAlertMsg({ type: "success", text: "✅ " + data.message });
        await fetchData();
      } else {
        setAlertMsg({ type: "error", text: data.error || "Failed to cancel recurring subscription." });
      }
    } catch (err) {
      setAlertMsg({ type: "error", text: "Network error while processing cancellation." });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpgrade = async (plan: Plan) => {
    if (plan.price === 0 || planName === plan.name) return;
    
    try {
      setUpgradingId(plan.id);
      setAlertMsg({ type: 'info', text: `Initiating secure checkout for ${plan.name}...` });

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, countryCode }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        if (data.checkoutUrl.includes('simulated_success')) {
          setFlwModalPlan(plan);
          setFlwSimUrl(data.checkoutUrl);
          setFlwErrorMsg(data.flwError || null);
          setUpgradingId(null);
          return;
        }
        // Redirect to Flutterwave Hosted Checkout
        window.location.assign(data.checkoutUrl);
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Could not initiate payment. Please try again.' });
        setUpgradingId(null);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Network error connecting to payment gateway.' });
      setUpgradingId(null);
    }
  };

  const filteredPlans = plans.filter((p) => p.price === 0 || p.interval === billingCycle);

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading">
              Subscription & Pro Access
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-brand-emerald)]/20 to-[var(--color-brand-electricGreen)]/20 border border-[var(--color-brand-emerald)]/40 text-[var(--color-brand-electricGreen)] animate-pulse flex items-center gap-1.5">
              <span>INSTANT PRO ACCESS</span>
              <ZapIcon size={14} />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <p className="text-[var(--color-accent-mutedSage)] text-sm md:text-base">
              Manage your Strike IQ intelligence tiers, billing history, and Pro Pick entitlements.
            </p>
            <CountrySelector
              currentCountryCode={countryCode}
              onSelectCountry={(code) => {
                setCountryCode(code);
                fetchData(code);
              }}
            />
          </div>
        </div>

        {/* Current Tier Status Card */}
        <div className="w-full md:w-auto bg-black/40 border border-[var(--color-brand-emerald)]/30 rounded-xl px-5 py-3 flex items-center justify-between md:justify-start gap-6 shadow-lg shadow-[var(--color-brand-emerald)]/5">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Current Status</div>
            <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              {planName === 'Free' ? (
                <span className="text-gray-300">Free Tier</span>
              ) : (
                <span className="text-[var(--color-brand-electricGreen)] flex items-center gap-1.5">
                  <ZapIcon size={16} />
                  <span>{planName}</span>
                </span>
              )}
            </div>
          </div>
          {planName !== 'Free' && (
            <div className="flex items-center gap-4 border-l border-white/10 pl-5">
              <div className="text-right">
                <div className="text-[11px] text-gray-400 uppercase font-semibold">Remaining Access</div>
                <div className="text-sm font-bold text-white mt-0.5">{daysRemaining} Days Active</div>
              </div>
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Stop recurring subscription billing"
              >
                {isCancelling ? 'Cancelling...' : '🛑 Stop Auto-Renewal'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all ${
            alertMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-900/20'
              : alertMsg.type === 'error'
              ? 'bg-red-950/60 border-red-500/40 text-red-300'
              : 'bg-blue-950/60 border-blue-500/40 text-blue-300 animate-pulse'
          }`}
        >
          <span className="font-medium">{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="text-white/60 hover:text-white text-xs ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="inline-flex items-center bg-black/60 p-1.5 rounded-full border border-white/10 shadow-inner">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-[var(--color-brand-emerald)] text-white shadow-md shadow-[var(--color-brand-emerald)]/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              billingCycle === 'YEARLY'
                ? 'bg-[var(--color-brand-emerald)] text-white shadow-md shadow-[var(--color-brand-emerald)]/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Yearly Billing</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[var(--color-brand-emerald)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 items-stretch max-w-5xl mx-auto">
          {filteredPlans.map((plan) => {
            const isCurrent = planName === plan.name || (planName === 'Free' && plan.price === 0);
            const isPro = plan.price > 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 w-full sm:w-[380px] max-w-full ${
                  isPro
                    ? 'bg-gradient-to-b from-emerald-950/30 to-black/80 border-2 border-[var(--color-brand-emerald)]/50 shadow-2xl shadow-[var(--color-brand-emerald)]/10 hover:border-[var(--color-brand-emerald)] hover:scale-[1.01]'
                    : 'bg-[var(--color-background-surface)] border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Pro Badge */}
                {isPro && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[var(--color-brand-emerald)] to-emerald-400 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    👑 RECOMMENDATION
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {plan.formattedPrice || `$${plan.price}`}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      /{plan.interval === 'YEARLY' ? 'year' : 'month'}
                    </span>
                  </div>
                  {plan.interval === 'YEARLY' && plan.price > 0 && (
                    <div className="text-[11px] text-[var(--color-brand-electricGreen)] font-semibold mt-1">
                      {plan.savingsBadge ? `${plan.savingsBadge} vs Monthly` : 'Billed annually'}
                    </div>
                  )}

                  <div className="h-px bg-white/10 my-6"></div>

                  {/* Feature Checklist */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      What&apos;s Included:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-200">
                          <span className="text-[var(--color-brand-emerald)] font-bold shrink-0 mt-0.5">✓</span>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  {isCurrent ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase bg-white/10 text-gray-400 border border-white/5 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span>✓ Current Plan</span>
                      </button>
                      {isPro && (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={isCancelling}
                          className="w-full py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[11px] font-semibold border border-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCancelling ? 'Cancelling...' : '🛑 Cancel Auto-Renewal'}
                        </button>
                      )}
                    </div>
                  ) : plan.price === 0 ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase bg-white/5 text-gray-400 border border-white/5 cursor-not-allowed"
                    >
                      Free Standard Tier
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgradingId === plan.id}
                      className="group relative w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase bg-gradient-to-r from-[#138561] via-[#10b981] to-[#138561] bg-[length:200%_auto] text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.5),0_0_40px_rgba(19,133,97,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.85),0_0_55px_rgba(19,133,97,0.5)] border border-emerald-400/60 hover:border-emerald-300 flex items-center justify-center gap-2 transform active:scale-95 overflow-hidden"
                    >
                      <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {upgradingId === plan.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Securing Checkout...</span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span>UPGRADE TO PRO</span>
                            <ZapIcon size={16} className="text-amber-400 shrink-0" />
                          </span>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Billing History Section & Syndicate Banner */}
      <PaymentHistorySection payments={payments} />

      {/* Modals (Flutterwave Checkout & Cancel Subscription) */}
      <SubscriptionModals
        flwModalPlan={flwModalPlan}
        flwSimUrl={flwSimUrl}
        flwProcessing={flwProcessing}
        flwErrorMsg={flwErrorMsg}
        setFlwModalPlan={setFlwModalPlan}
        setFlwSimUrl={setFlwSimUrl}
        setFlwProcessing={setFlwProcessing}
        showCancelConfirm={showCancelConfirm}
        setShowCancelConfirm={setShowCancelConfirm}
        handleCancelSubscription={handleCancelSubscription}
      />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading subscription portal...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
