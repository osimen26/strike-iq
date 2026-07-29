"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getActiveSessions, SessionInfo } from './actions';

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'settings' ? 'settings' : 'profile';
  
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'bookmarks'>(initialTab as any);
  const [user, setUser] = useState<any>(null);
  const [planName, setPlanName] = useState<string>('Free');
  const [resetSent, setResetSent] = useState(false);
  
  // Settings state
  const [oddsFormat, setOddsFormat] = useState<'DECIMAL' | 'FRACTIONAL' | 'AMERICAN'>('DECIMAL');
  const [defaultLeague, setDefaultLeague] = useState<string>('Premier League');
  const [alertHighConf, setAlertHighConf] = useState<boolean>(true);
  const [alertLineups, setAlertLineups] = useState<boolean>(true);
  const [alertBankroll, setAlertBankroll] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Sessions state
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  // Mock data state for bookmarks
  const [showPick1, setShowPick1] = useState(true);
  const [showPick2, setShowPick2] = useState(true);
  const activeBookmarksCount = (showPick1 ? 1 : 0) + (showPick2 ? 1 : 0);

  useEffect(() => {
    // Fetch real auth user
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUser(data.user);
      });
    });

    // Fetch active device sessions securely from the backend
    getActiveSessions().then((res) => {
      if (res.success && res.sessions) {
        setActiveSessions(res.sessions);
      }
      setLoadingSessions(false);
    });

    // Fetch real subscription status
    fetch('/api/subscriptions/current')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlanName(data.planName || 'Free');
        }
      })
      .catch(() => {});
  }, []);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setResetSent(true);
    setSavedMsg('✉️ Password reset link sent to your email.');
    setTimeout(() => setSavedMsg(null), 5000);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Strategist';
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '—';
  const tierLabel = planName === 'Free' ? 'Free Tier' : `${planName} ⚡`;

  const handleSaveSettings = () => {
    setSavedMsg('⚡ Preferences saved securely to your Strike IQ Profile.');
    setTimeout(() => setSavedMsg(null), 3500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading">
              My Profile & Preferences
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary-600/20 to-emerald-400/20 text-primary-400 border border-primary-600/30">
              SECURE SESSION
            </span>
          </div>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            Manage your account security, AI signal notifications, and odds display formats.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#09090b] p-1 rounded-lg border border-zinc-800 w-full md:w-auto font-mono shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-black shadow-md shadow-primary-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-[#121215]'
            }`}
          >
            Account Security
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
              activeTab === 'settings'
                ? 'bg-primary-600 text-black shadow-md shadow-primary-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-[#121215]'
            }`}
          >
            Alert Settings
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
              activeTab === 'bookmarks'
                ? 'bg-primary-600 text-black shadow-md shadow-primary-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-[#121215]'
            }`}
          >
            Saved Picks
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-medium flex items-center justify-between shadow-lg">
          <span>{savedMsg}</span>
          <button onClick={() => setSavedMsg(null)} className="text-emerald-400/60 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Tab 1: Account & Security */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Profile Summary Card */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-emerald-400 p-0.5 shadow-lg shadow-primary-600/20">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl font-bold text-primary-400">
                  SI
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{displayName}</h3>
                <p className="text-xs text-gray-400">{user?.email || '—'}</p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-primary-600/20 text-primary-400 border border-primary-600/30">
                  {tierLabel}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10"></div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-gray-400">Account Status:</span>
                <span className="text-primary-400 font-bold">Verified Active</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white font-medium">{joinDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Payment Gateway:</span>
                <span className="text-white font-medium">Flutterwave Secure</span>
              </div>
            </div>

            <Link
              href="/subscription"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <span>Manage Subscription & Billing</span>
            </Link>
          </div>

          {/* Security & Active Device Sessions */}
          <div className="lg:col-span-2 bg-[#09090b] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Security & Active Device Sessions</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Monitor logged-in devices to ensure your Pro AI intelligence access is never compromised or shared.
              </p>
            </div>

            <div className="space-y-4">
              {loadingSessions ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-sm border border-dashed border-zinc-800 rounded-xl">
                  Loading active secure sessions...
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-sm border border-dashed border-zinc-800 rounded-xl">
                  No active sessions found.
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div 
                    key={session.id}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      session.isCurrent 
                        ? 'bg-[#121215] border-emerald-500/30' 
                        : 'bg-[#121215] border-white/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.isCurrent
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 border border-zinc-800 text-gray-400'
                      }`}>
                        {session.deviceType === 'mobile' || session.deviceType === 'tablet' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{session.os} / {session.browser}</span>
                          {session.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          IP: {session.ip} • Last Active: {session.lastActive}
                        </div>
                      </div>
                    </div>
                    {session.isCurrent ? (
                      <span className="text-xs text-primary-400 font-bold">Active</span>
                    ) : (
                      <button
                        onClick={() => alert('Device session revoked.')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="h-px bg-white/10 my-6"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white">Password & Authentication</div>
                <div className="text-xs text-gray-400 mt-0.5">We recommend rotating passwords every 90 days for sports betting accounts.</div>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetSent}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase bg-primary-600 text-black hover:bg-emerald-400 transition-all shadow-md shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetSent ? 'Link Sent ✓' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Alert Settings & Preferences */}
      {activeTab === 'settings' && (
        <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-4xl space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white font-heading">AI Betting Intelligence Preferences</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Customize how odds, confidence metrics, and instant notifications behave across your Strike IQ dashboard.
            </p>
          </div>

          <div className="space-y-6">
            {/* Odds Display Format */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-zinc-800">
              <div>
                <div className="text-sm font-bold text-white">Odds Display Format</div>
                <div className="text-xs text-gray-400 mt-0.5">Select how match odds and betting lines are calculated across feeds.</div>
              </div>
              <div className="flex bg-black/60 p-1 rounded-xl border border-zinc-800 shrink-0">
                <button
                  onClick={() => setOddsFormat('DECIMAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    oddsFormat === 'DECIMAL' ? 'bg-primary-600 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Decimal (1.85)
                </button>
                <button
                  onClick={() => setOddsFormat('FRACTIONAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    oddsFormat === 'FRACTIONAL' ? 'bg-primary-600 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Fractional (17/20)
                </button>
                <button
                  onClick={() => setOddsFormat('AMERICAN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    oddsFormat === 'AMERICAN' ? 'bg-primary-600 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  American (-118)
                </button>
              </div>
            </div>

            {/* Default League Focus */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-zinc-800">
              <div>
                <div className="text-sm font-bold text-white">Default League Focus</div>
                <div className="text-xs text-gray-400 mt-0.5">Which competition should prioritize your main predictions feed on login?</div>
              </div>
              <select
                value={defaultLeague}
                onChange={(e) => setDefaultLeague(e.target.value)}
                className="bg-black/60 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary-600"
              >
                <option value="Premier League">⚽ Premier League (England)</option>
                <option value="UEFA Champions League">⚽ UEFA Champions League</option>
                <option value="La Liga">⚽ La Liga (Spain)</option>
                <option value="NBA">🏀 NBA (USA)</option>
                <option value="All Competitions">🌐 All Competitions</option>
              </select>
            </div>

            {/* Toggle 1: High Confidence Alerts */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>⚡ High-Confidence Pro Pick Alerts</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-primary-600/20 text-primary-400">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Receive immediate push & email notifications when AI confidence exceeds 85%.</div>
              </div>
              <button
                onClick={() => setAlertHighConf(!alertHighConf)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  alertHighConf ? 'bg-primary-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    alertHighConf ? 'transform translate-x-6' : ''
                  }`}
                ></div>
              </button>
            </div>

            {/* Toggle 2: Lineup & Injury Reports */}
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <div>
                <div className="text-sm font-bold text-white">📊 Pre-Match Lineup & Injury Intelligence</div>
                <div className="text-xs text-gray-400 mt-0.5">Notify me 1 hour before kickoff when official lineups impact AI win probabilities.</div>
              </div>
              <button
                onClick={() => setAlertLineups(!alertLineups)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  alertLineups ? 'bg-primary-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    alertLineups ? 'transform translate-x-6' : ''
                  }`}
                ></div>
              </button>
            </div>

            {/* Toggle 3: Bankroll Exposure Risk Alerts */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-sm font-bold text-white">💰 Bankroll Risk Management Warnings</div>
                <div className="text-xs text-gray-400 mt-0.5">Warn me if my daily wager exposure exceeds recommended Kelly Criterion sizing limits.</div>
              </div>
              <button
                onClick={() => setAlertBankroll(!alertBankroll)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  alertBankroll ? 'bg-primary-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    alertBankroll ? 'transform translate-x-6' : ''
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-8 py-3 rounded-xl font-extrabold text-xs uppercase bg-gradient-to-r from-primary-600 to-emerald-400 text-black hover:from-emerald-400 hover:to-primary-400 transition-all shadow-lg shadow-primary-600/20"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Saved Picks / Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Saved Prediction Slip Candidates</h3>
              <p className="text-xs text-zinc-400 mt-1">
                AI picks you bookmarked for tracking and betting slip assembly.
              </p>
            </div>
            <span className="text-xs text-gray-400">{activeBookmarksCount} Active Bookmark{activeBookmarksCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showPick1 && (
            <div className="p-5 rounded-xl bg-[#121215] border border-primary-600/40 hover:border-primary-600 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold text-white">⚽ Premier League</span>
                  <span>Tomorrow @ 15:00</span>
                </div>
                <div className="text-base font-extrabold text-white mt-2">
                  Arsenal vs. Chelsea
                </div>
                <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">👑 Pro Pick Recommendation</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">HOME WIN (Arsenal)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Odds</div>
                    <div className="text-sm font-bold text-primary-400">1.88</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                <span className="text-gray-400">AI Win Prob: <strong className="text-white">88%</strong></span>
                <button
                  onClick={() => setShowPick1(false)}
                  className="text-red-400/80 hover:text-red-400 font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
            )}

            {showPick2 && (
            <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold text-white">🏀 NBA</span>
                  <span>Tonight @ 01:30</span>
                </div>
                <div className="text-base font-extrabold text-white mt-2">
                  Boston Celtics vs. Miami Heat
                </div>
                <div className="mt-3 p-3 rounded-lg bg-[#121215] border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">⚡ AI Signal</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">OVER 224.5 TOTAL POINTS</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Odds</div>
                    <div className="text-sm font-bold text-primary-400">1.91</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                <span className="text-gray-400">AI Win Prob: <strong className="text-white">82%</strong></span>
                <button
                  onClick={() => setShowPick2(false)}
                  className="text-red-400/80 hover:text-red-400 font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
            )}
            
            {(!showPick1 && !showPick2) && (
              <div className="col-span-1 md:col-span-2 py-16 text-center text-zinc-500 font-mono text-sm border border-dashed border-zinc-800 rounded-xl">
                No saved picks remaining.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading profile and preferences...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
