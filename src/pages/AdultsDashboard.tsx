import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked, selectProgress } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import { getMasteryCap, getUnlockThreshold, getMasteryPercent } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import { WALLET_NAMES } from '../utils/wallet';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

const TIER_LABELS: Record<number, string> = {
  0: 'Foundation', 1: 'Building', 2: 'Advanced', 3: 'Expert', 4: 'Master',
};
const TIER_COLORS: Record<number, string> = {
  0: '#22c55e', 1: '#3b82f6', 2: '#8b5cf6', 3: '#f59e0b', 4: '#ef4444',
};

function MasteryBar({ mastery, color }: { mastery: number; color: string }) {
  return (
    <div className="relative w-full h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(mastery * 100)}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {mastery > 0.05 && (
        <motion.div
          className="absolute inset-y-0 w-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }}
          animate={{ x: ['-40px', '500px'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

export default function AdultsDashboard() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile } = state;
  const progress = selectProgress(state);
  const { user, isConfigured, loading: authLoading } = useAuth();
  const isGuest = isConfigured && !authLoading && !user;
  const [lockedPop, setLockedPop] = useState<CategoryId | null>(null);

  if (!profile) { navigate('/'); return null; }
  if (profile.ageTrack !== 'adults') {
    navigate(profile.ageTrack === 'kids' ? '/kids' : '/teens', { replace: true });
    return null;
  }

  const zones = CATEGORIES.filter((cat) =>
    (ALL_QUESTIONS[cat.id] ?? []).some((q) => q.ageTrack.includes('adults'))
  );
  const byTier = zones.reduce<Record<number, typeof zones>>((acc, cat) => {
    const t = cat.tier ?? 0;
    if (!acc[t]) acc[t] = [];
    acc[t].push(cat);
    return acc;
  }, {});
  const tiers = Object.keys(byTier).map(Number).sort();
  const totalXP = zones.reduce((sum, c) => sum + (progress[c.id]?.masteryPoints ?? 0), 0);
  const totalCap = zones.reduce((sum, c) => sum + getMasteryCap(c.id, 'adults'), 0);
  const overallMastery = totalCap > 0 ? totalXP / totalCap : 0;
  const masteredCount = zones.filter((c) => selectMasteryPercent(state, c.id) >= 0.9).length;
  const wallet = WALLET_NAMES[profile.ageTrack];

  const kpis = [
    { label: 'Overall Mastery', value: `${Math.round(overallMastery * 100)}%`, sub: `${masteredCount} categories complete`, color: '#d4af37', bg: 'rgba(212,175,55,0.18)', border: 'rgba(212,175,55,0.4)' },
    { label: 'Total XP Earned', value: totalXP.toLocaleString(), sub: `of ${totalCap.toLocaleString()} possible`, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)' },
    { label: 'Zones Mastered', value: `${masteredCount}/${zones.length}`, sub: masteredCount > 0 ? 'Great progress!' : 'Keep going!', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)' },
    { label: 'Badges Earned', value: `${(profile.earnedBadgeIds ?? []).length}`, sub: 'View in profile', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'linear-gradient(160deg, #060408 0%, #0a0700 55%, #030712 100%)' }}>

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute rounded-full"
          style={{ width: 520, height: 520, top: -180, right: -120, background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)', filter: 'blur(70px)' }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 380, height: 380, bottom: 120, left: -120, background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.28, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 300, height: 300, top: '45%', left: '38%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <TopNav />

      <main className="relative pt-20 pb-12 px-4 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-yellow-400/80 text-xs font-bold tracking-widest uppercase mb-1.5">
                ⚡ Financial Command Centre
              </p>
              <h1
                className="font-display text-3xl font-black"
                style={{ background: 'linear-gradient(130deg, #fff 20%, #d4af37 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(245,158,11,0.15))', color: '#fbbf24', border: '1px solid rgba(212,175,55,0.5)' }}>
                  Level {profile.level}
                </span>
                <motion.span className="text-white/50 text-xs"
                  animate={profile.dailyStreak > 0 ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  {profile.dailyStreak}🔥 day streak
                </motion.span>
              </div>
            </div>

            {/* Wallet */}
            <motion.button
              onClick={() => { sound.click(); navigate('/wallet'); }}
              className="flex flex-col items-end px-4 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(245,158,11,0.08))', border: '1px solid rgba(212,175,55,0.4)' }}
              whileHover={{ scale: 1.06, boxShadow: '0 0 20px rgba(212,175,55,0.25)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xs text-yellow-500/70 mb-0.5">{wallet.title}</span>
              <span className="text-2xl font-black text-yellow-400">{wallet.icon} {profile.walletBalance.toLocaleString()}</span>
            </motion.button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label}
                className="p-3.5 rounded-2xl"
                style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ scale: 1.04, y: -2, boxShadow: `0 8px 24px ${kpi.color}20` }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: kpi.color + 'cc' }}>{kpi.label}</div>
                <div className="font-black text-xl leading-none" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs text-white/30 mt-1">{kpi.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50 font-medium">Portfolio progress</span>
              <span className="font-bold text-yellow-400">{Math.round(overallMastery * 100)}%</span>
            </div>
            <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #78350f, #d4af37, #fbbf24, #d4af37)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(overallMastery * 100)}%` }}
                transition={{ duration: 1.3, delay: 0.4, ease: 'easeOut' }}
              />
              <motion.div className="absolute inset-y-0 w-14"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
                animate={{ x: ['-56px', '600px'] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Guest banner ── */}
        {isGuest && (
          <motion.div
            className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(245,158,11,0.05))', border: '1px solid rgba(212,175,55,0.35)' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-2xl">☁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-300 font-semibold">Secure your financial progress</p>
              <p className="text-xs text-white/45 mt-0.5">Guest data lives only on this device. Create an account to sync everywhere.</p>
            </div>
            <button onClick={() => { sound.click(); navigate('/auth'); }}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-yellow-900"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}>
              Sign Up →
            </button>
          </motion.div>
        )}

        {/* ── Quick nav ── */}
        <motion.div className="flex gap-2 mb-8 overflow-x-auto pb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {[
            { label: '👤 Profile', route: '/profile', bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.4)', color: '#a5b4fc' },
            { label: '🏆 Leaderboard', route: '/leaderboard', bg: 'rgba(212,175,55,0.18)', border: 'rgba(212,175,55,0.4)', color: '#fbbf24' },
            { label: `${wallet.icon} Wallet`, route: '/wallet', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.38)', color: '#86efac' },
            { label: '👨‍👩‍👧 Family', route: '/family', bg: 'rgba(236,72,153,0.13)', border: 'rgba(236,72,153,0.32)', color: '#f9a8d4' },
            { label: '🏫 Class', route: '/class/join', bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.32)', color: '#fcd34d' },
          ].map((btn) => (
            <motion.button key={btn.label}
              onClick={() => { sound.click(); navigate(btn.route); }}
              className="flex-shrink-0 text-xs px-3.5 py-2 rounded-xl font-bold"
              style={{ background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color }}
              whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.94 }}
            >
              {btn.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Tier-grouped zones ── */}
        <div className="space-y-10">
          {tiers.map((tier, tIdx) => (
            <motion.section key={tier}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + tIdx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-5 rounded-full" style={{ background: TIER_COLORS[tier] ?? '#fff' }} />
                <h2 className="font-display text-xs font-black uppercase tracking-widest" style={{ color: TIER_COLORS[tier] ?? '#fff' }}>
                  {TIER_LABELS[tier] ?? `Tier ${tier}`}
                </h2>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${(TIER_COLORS[tier] ?? '#fff') + '50'}, transparent)` }} />
                <span className="text-xs font-semibold" style={{ color: (TIER_COLORS[tier] ?? '#fff') + '80' }}>
                  {byTier[tier].filter((c) => selectMasteryPercent(state, c.id) >= 0.9).length}/{byTier[tier].length} mastered
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {byTier[tier].map((cat, i) => {
                  const mastery = selectMasteryPercent(state, cat.id);
                  const unlocked = selectIsUnlocked(state, cat.id);
                  const prereqId = cat.prerequisite;
                  const prereqPoints = prereqId ? (progress[prereqId]?.masteryPoints ?? 0) : 0;
                  const prereqCap = prereqId ? getMasteryCap(prereqId, 'adults') : 300;
                  const xpGap = Math.max(0, Math.ceil(prereqCap * getUnlockThreshold('adults')) - prereqPoints);
                  const xpEarned = progress[cat.id]?.masteryPoints ?? 0;
                  const thisCap = getMasteryCap(cat.id, 'adults');
                  const xpPct = getMasteryPercent(xpEarned, thisCap);
                  const isMastered = mastery >= 0.9;

                  return (
                    <motion.button key={cat.id}
                      className="relative flex flex-col p-3.5 rounded-2xl border text-left overflow-hidden"
                      style={{
                        background: unlocked
                          ? isMastered
                            ? `linear-gradient(145deg, ${cat.colorDark}a0, ${cat.color}18)`
                            : `linear-gradient(145deg, ${cat.colorDark}70, rgba(10,8,15,0.92))`
                          : 'rgba(255,255,255,0.03)',
                        borderColor: unlocked
                          ? isMastered ? '#d4af37cc' : cat.color + '60'
                          : 'rgba(255,255,255,0.07)',
                        boxShadow: isMastered ? `0 0 24px ${cat.color}22` : 'none',
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: unlocked ? 1 : 0.35, scale: 1 }}
                      transition={{ delay: 0.06 + i * 0.03 }}
                      whileHover={unlocked ? { scale: 1.05, y: -4, boxShadow: `0 10px 35px ${cat.color}35` } : {}}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        sound.click();
                        if (!unlocked) {
                          setLockedPop(cat.id); sound.wrong();
                          setTimeout(() => setLockedPop(null), 2000); return;
                        }
                        navigate(`/category/${cat.id}`);
                      }}
                    >
                      <AnimatePresence>
                        {lockedPop === cat.id && (
                          <motion.div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full whitespace-nowrap z-10 font-semibold"
                            style={{ background: 'rgba(239,68,68,0.92)', color: '#fff', border: '1px solid rgba(239,68,68,0.5)' }}
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            🔒 {xpGap > 0 ? `${xpGap} XP needed` : 'Complete prerequisite'}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Mastered shimmer edge */}
                      {isMastered && (
                        <motion.div className="absolute top-0 right-0 w-1.5 h-full rounded-r-2xl"
                          style={{ background: 'linear-gradient(180deg, #d4af37, #fbbf24, #d4af37)' }}
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <motion.span className="text-2xl"
                          animate={unlocked && !isMastered ? { rotate: [0, -6, 6, 0] } : {}}
                          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}>
                          {unlocked ? cat.emoji : '🔒'}
                        </motion.span>
                        {isMastered && (
                          <motion.span className="text-base"
                            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}>
                            ⭐
                          </motion.span>
                        )}
                      </div>

                      <h3 className="font-display text-xs font-bold leading-tight mb-1.5"
                        style={{ color: unlocked ? (isMastered ? '#fbbf24' : 'rgba(255,255,255,0.9)') : 'rgba(255,255,255,0.28)' }}>
                        {cat.name}
                      </h3>

                      {unlocked ? (
                        <>
                          <div className="flex items-center justify-between text-xs mt-auto mb-0.5">
                            <span style={{ color: isMastered ? '#fbbf24' : cat.color + 'dd' }}>
                              {isMastered ? '★ Mastered' : xpPct > 0 ? `${Math.round(xpPct * 100)}%` : 'New'}
                            </span>
                            <span className="text-white/20">{xpEarned}/{thisCap}</span>
                          </div>
                          <MasteryBar mastery={xpPct} color={isMastered ? '#d4af37' : cat.color} />
                        </>
                      ) : (
                        <div className="text-xs text-white/20 mt-auto">Locked</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* ── Footer ── */}
        <motion.div className="mt-10 flex items-center justify-between pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <p className="text-white/25 text-xs">{masteredCount}/{zones.length} mastered · {Math.round(overallMastery * 100)}% overall</p>
          <button onClick={() => { sound.click(); navigate('/leaderboard'); }}
            className="text-xs text-yellow-500/60 hover:text-yellow-400 transition-colors font-semibold">
            View leaderboard →
          </button>
        </motion.div>
      </main>
    </div>
  );
}
