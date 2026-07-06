"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
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
  const [loading, setLoading] = useState(true);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [flwModalPlan, setFlwModalPlan] = useState<Plan | null>(null);
  const [flwSimUrl, setFlwSimUrl] = useState<string | null>(null);
  const [flwProcessing, setFlwProcessing] = useState<boolean>(false);
  const [flwErrorMsg, setFlwErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Check URL params for payment redirect completion
    const paymentStatus = searchParams.get('payment');
    const txRef = searchParams.get('tx_ref');
    const planIdParam = searchParams.get('planId');
    const planNameParam = searchParams.get('planName');

    if (paymentStatus === 'simulated_success' && txRef && planIdParam) {
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
            fetchData(); // Refresh subscription status
            // Clean URL after 4 seconds
            setTimeout(() => router.replace('/subscription'), 4000);
          } else {
            setAlertMsg({ type: 'error', text: data.error || 'Activation failed.' });
          }
        })
        .catch(() => setAlertMsg({ type: 'error', text: 'Network error during activation.' }));
    } else if (paymentStatus === 'success') {
      setAlertMsg({
        type: 'success',
        text: '🎉 Payment Successful! Your Strike IQ Pro subscription has been activated.',
      });
      fetchData();
      setTimeout(() => router.replace('/subscription'), 4000);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/subscriptions/current')
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
    } catch (err) {
      console.error('Error loading subscription dashboard:', err);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ planId: plan.id }),
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
        window.location.href = data.checkoutUrl;
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
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-brand-emerald)]/20 to-[var(--color-brand-electricGreen)]/20 border border-[var(--color-brand-emerald)]/40 text-[var(--color-brand-electricGreen)] animate-pulse">
              INSTANT PRO ACCESS ⚡
            </span>
          </div>
          <p className="text-[var(--color-accent-mutedSage)] mt-2 text-sm md:text-base">
            Manage your Strike IQ intelligence tiers, billing history, and Pro Pick entitlements.
          </p>
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
                  ⚡ {planName}
                </span>
              )}
            </div>
          </div>
          {planName !== 'Free' && (
            <div className="text-right border-l border-white/10 pl-5">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Remaining Access</div>
              <div className="text-sm font-bold text-white mt-0.5">{daysRemaining} Days Active</div>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              billingCycle === 'YEARLY' ? 'bg-black text-[var(--color-brand-electricGreen)]' : 'bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-electricGreen)]'
            }`}>
              SAVE 10%
            </span>
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
                      ${plan.price}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      /{plan.interval === 'YEARLY' ? 'year' : 'month'}
                    </span>
                  </div>
                  {plan.interval === 'YEARLY' && plan.price > 0 && (
                    <div className="text-[11px] text-[var(--color-brand-electricGreen)] font-semibold mt-1">
                      Billed annually ($8.99/month equivalent)
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
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase bg-white/10 text-gray-400 border border-white/5 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>✓ Current Plan</span>
                    </button>
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
                      className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase bg-[#138561] text-white hover:bg-[#0f6b4d] transition-all shadow-lg shadow-[#138561]/20 flex items-center justify-center gap-2 transform active:scale-95"
                    >
                      {upgradingId === plan.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Securing Checkout...</span>
                        </>
                      ) : (
                        <>
                          <span>UPGRADE TO PRO ⚡</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Billing History Section */}
      <div className="mt-14 bg-[var(--color-background-surface)] border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Billing & Transaction History</h2>
            <p className="text-xs text-[var(--color-accent-mutedSage)] mt-1">
              All billing history and subscription payments are recorded here.
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Currency: <span className="text-white font-bold">USD / NGN</span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No previous payment transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400 bg-black/20">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {payments.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-gray-300">
                      {new Date(tx.createdAt).toLocaleDateString()}{' '}
                      <span className="text-gray-500 text-[10px]">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                      {tx.reference}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {tx.plan?.name || 'Pro Plan'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[var(--color-brand-electricGreen)]">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 uppercase">
                      {tx.paymentMethod || 'Card / Bank'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          tx.status === 'SUCCESSFUL'
                            ? 'bg-emerald-500/20 text-[var(--color-brand-electricGreen)] border border-emerald-500/30'
                            : tx.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Syndicate Support Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-black to-emerald-950/40 border border-[var(--color-brand-emerald)]/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-white">Serious volume or high-roller betting syndicate?</h3>
          <p className="text-xs text-[var(--color-accent-mutedSage)] max-w-xl">
            Meet <span className="text-white font-bold">Strike IQ Syndicate</span>. Get direct API webhook access to our deep-learning inference engines, custom odds models, and priority risk management alerts.
          </p>
        </div>
        <Link
          href="mailto:syndicate@strikeiq.ai"
          className="px-6 py-3 rounded-xl font-bold text-xs uppercase bg-white text-black hover:bg-gray-200 transition-all shrink-0 shadow-lg"
        >
          Talk to Syndicate Desk
        </Link>
      </div>

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
                  <h3 className="font-bold text-lg font-heading tracking-wide">Secure Checkout</h3>
                  <p className="text-xs text-gray-400">Strike IQ Pro Entitlement • Instant Activation</p>
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
                <span className="font-bold text-[var(--color-brand-emerald)]">{flwModalPlan.interval}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold border-t border-white/10 pt-2 mt-2">
                <span>Total Amount:</span>
                <span className="text-[#F5A623]">${flwModalPlan.price.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Simulated Payment Methods */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Payment Method</p>
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
                  <span className="text-red-400 font-bold">Flutterwave API Note:</span> "{flwErrorMsg}"
                </div>
              ) : (
                <p className="text-[11px] opacity-90">
                  No valid live key was detected in Vercel environment variables.
                </p>
              )}
              <p className="text-[11px] text-gray-300">
                <span className="font-semibold text-white">💡 Pro Tip:</span> If you just added your live secret key, ensure USD international card payments are enabled on your Flutterwave merchant account!
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
                <span>Pay ${flwModalPlan.price.toFixed(2)} USD Now</span>
              )}
            </button>
          </div>
        </div>
      )}
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
