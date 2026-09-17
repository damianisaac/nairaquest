import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import {
  formatFullNaira,
  formatPlayNaira,
  getStreakMultiplierDisplay,
  WALLET_NAMES,
  WALLET_DISCLAIMER,
} from '../utils/wallet';
import { CATEGORY_MAP } from '../data/categories';
import { fetchReferralStats, generateReferralCode } from '../lib/referral';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { WalletTransaction } from '../types';
import type { ReferralStats } from '../lib/referral';

// ─── Kids redirect handled in App.tsx ────────────────────────────────────────

// ─── Mini line chart ─────────────────────────────────────────────────────────

function GrowthChart({ transactions }: { transactions: WalletTransaction[] }) {
  const points = useMemo(() => {
    // Group by day and accumulate balance over time
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    let running = 0;
    const daily: Map<string, number> = new Map();
    for (const t of sorted) {
      const day = new Date(t.timestamp).toISOString().slice(0, 10);
      running += t.amount;
      daily.set(day, running);
    }
    return Array.from(daily.entries()).map(([d, v]) => ({ d, v }));
  }, [transactions]);

  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-28 text-white/20 text-sm">
        Play more to see your growth chart
      </div>
    );
  }

  const maxV = Math.max(...points.map((p) => p.v));
  const minV = 0;
  const W = 280;
  const H = 100;
  const pad = 8;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = H - pad - ((p.v - minV) / (maxV - minV || 1)) * (H - pad * 2);
    return { x, y };
  });

  const pathD = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const fillD = [
    `M ${coords[0].x.toFixed(1)} ${H}`,
    ...coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`),
    `L ${coords[coords.length - 1].x.toFixed(1)} ${H}`,
    'Z',
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#chart-fill)" />
      <path d={pathD} fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="#d4af37" />
      ))}
    </svg>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: WalletTransaction }) {
  const cat = tx.category && CATEGORY_MAP[tx.category];
  const typeIcon = tx.type === 'mastery_bonus' ? '🏅' : tx.type === 'streak_bonus' ? '🔥' : cat?.emoji ?? '✅';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-xl w-8 text-center">{typeIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/80 truncate">{tx.label}</div>
        <div className="text-xs text-white/30 mt-0.5">
          {new Date(tx.timestamp).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <span className="text-naira-gold font-bold text-sm shrink-0">+{formatPlayNaira(tx.amount)}</span>
    </div>
  );
}

// ─── Invite / Referral section ───────────────────────────────────────────────

function InviteSection({ referralCode }: { referralCode: string }) {
  const [stats, setStats]   = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !referralCode) return;  // wait until code is generated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchReferralStats(session.user.id).then(setStats);
    });
  }, [referralCode]);

  const shareLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(0,135,81,0.3)', background: 'rgba(0,135,81,0.06)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,135,81,0.2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🎁</span>
          <span className="font-bold text-white text-sm">Invite Friends, Earn Together</span>
        </div>
        <p className="text-xs text-white/40 mt-0.5 pl-7">
          They complete 3 sessions → you get <span className="text-naira-green-light">N500</span>, they get <span className="text-naira-green-light">N200</span>
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Referral code display */}
        <div>
          <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wide font-semibold">Your referral code</p>
          <div className="flex items-center gap-2">
            <span
              className="flex-1 text-center py-2.5 rounded-xl font-mono font-bold text-naira-green-light tracking-[0.18em] text-lg"
              style={{ background: 'rgba(0,135,81,0.12)', border: '1px solid rgba(0,135,81,0.3)' }}
            >
              {referralCode}
            </span>
            <motion.button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{
                background: copied ? 'rgba(0,135,81,0.3)' : 'rgba(255,255,255,0.08)',
                color: copied ? '#00b86a' : 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileTap={{ scale: 0.96 }}
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </motion.button>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Invited', value: stats.totalReferrals },
              { label: 'Rewarded', value: stats.rewardedReferrals },
              { label: 'Pending', value: stats.pendingReferrals },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="font-bold text-white text-lg">{value}</div>
                <div className="text-xs text-white/35">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="text-xs text-white/35 space-y-1 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p>① Share your link with a friend</p>
          <p>② They sign up and complete 3 quiz sessions</p>
          <p>③ Both wallets are credited automatically · one-time per friend</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const navigate = useNavigate();
  const { profile } = useGameStore();
  const [tab, setTab] = useState<'history' | 'chart'>('history');

  useEffect(() => {
    if (!profile) { navigate('/'); return; }
    if (profile.ageTrack === 'kids') navigate('/piggybank');
  }, [profile, navigate]);

  // Generate and save a referral code for existing accounts that predate the referral system
  useEffect(() => {
    if (!profile || profile.referralCode) return;
    const code = generateReferralCode();
    useGameStore.setState((s) => ({
      profile: s.profile ? { ...s.profile, referralCode: code } : s.profile,
    }));
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          supabase.from('profiles')
            .update({ referral_code: code })
            .eq('id', session.user.id)
            .then(() => {});
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.referralCode]);

  if (!profile || profile.ageTrack === 'kids') return null;

  const walletName = WALLET_NAMES[profile.ageTrack];
  const sorted = [...profile.walletTransactions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #d4af3710 0%, #030712 40%)' }}>
      <TopNav />
      <main className="pt-20 pb-10 px-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl mb-2">{walletName.icon}</div>
          <h1 className="font-display text-2xl text-naira-gold">{walletName.title}</h1>
          <p className="text-white/30 text-xs mt-1 italic">Play Naira · Game Score Only</p>
        </motion.div>

        {/* Balance card */}
        <motion.div
          className="rounded-3xl p-6 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #d4af3720 0%, #b8960f10 100%)',
            border: '1px solid #d4af3740',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <div className="text-white/40 text-sm mb-1">Total Learning Credits</div>
          <div className="font-display text-5xl text-naira-gold mb-2">
            {formatFullNaira(profile.walletBalance)}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-white/40">
            <span>{profile.walletTransactions.length} transactions</span>
            <span className="text-white/20">·</span>
            <span>🔥 {getStreakMultiplierDisplay(profile.dailyStreak)} streak bonus</span>
          </div>
        </motion.div>

        {/* Invite friends — shown above history so it's immediately visible */}
        {isSupabaseConfigured && (
          <InviteSection referralCode={profile.referralCode ?? ''} />
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 mt-6">
          {(['history', 'chart'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-naira-gold/20 border border-naira-gold/40 text-naira-gold'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              {t === 'history' ? '📋 History' : '📈 Growth'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'history' ? (
            <motion.div
              key="history"
              className="card-glass"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {sorted.length === 0 ? (
                <div className="p-6 text-center text-white/30 text-sm">
                  Play your first session to earn Learning Credits!
                </div>
              ) : (
                <div className="px-4 py-2 max-h-96 overflow-y-auto">
                  {sorted.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              className="card-glass p-4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className="text-xs text-white/40 mb-2">Balance over time</div>
              <GrowthChart transactions={profile.walletTransactions} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <div className="mt-6 rounded-xl p-3 text-xs text-white/25 leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {WALLET_DISCLAIMER}
        </div>
      </main>
    </div>
  );
}
