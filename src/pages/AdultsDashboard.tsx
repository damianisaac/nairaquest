import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import { getMasteryCap, getUnlockThreshold, getMasteryPercent } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import { WALLET_NAMES } from '../utils/wallet';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

/** Tier labels for the category grid */
const TIER_LABELS: Record<number, string> = {
  0: 'Foundation',
  1: 'Building',
  2: 'Advanced',
  3: 'Expert',
  4: 'Master',
};

function MasteryBar({ mastery, color }: { mastery: number; color: string }) {
  return (
    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-1.5">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(mastery * 100)}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function AdultsDashboard() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile, progress } = state;
  const [lockedPop, setLockedPop] = useState<CategoryId | null>(null);

  if (!profile) { navigate('/'); return null; }
  if (profile.ageTrack !== 'adults') {
    navigate(profile.ageTrack === 'kids' ? '/kids' : '/teens', { replace: true });
    return null;
  }

  const zones = CATEGORIES.filter((cat) =>
    (ALL_QUESTIONS[cat.id] ?? []).some((q) => q.ageTrack.includes('adults'))
  );

  // Group by tier
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

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #050505 0%, #0d0a00 50%, #030712 100%)' }}
    >
      <TopNav />

      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">

        {/* Command Center header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Title row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-yellow-600/50 text-xs font-semibold tracking-widest uppercase mb-1">
                Financial Command Centre
              </p>
              <h1 className="font-display text-2xl text-white font-black">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  Level {profile.level}
                </span>
                <span className="text-white/30 text-xs">{profile.dailyStreak}🔥 day streak</span>
              </div>
            </div>
            {/* Wallet widget */}
            <button
              onClick={() => { sound.click(); navigate('/wallet'); }}
              className="flex flex-col items-end px-4 py-3 rounded-2xl hover:scale-105 transition-transform"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <span className="text-xs text-yellow-600/60 mb-0.5">{wallet.title}</span>
              <span className="text-xl font-black text-yellow-400">
                {wallet.icon} {profile.walletBalance.toLocaleString()}
              </span>
            </button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Overall Mastery',
                value: `${Math.round(overallMastery * 100)}%`,
                sub: `${masteredCount} categories complete`,
                color: '#d4af37',
              },
              {
                label: 'Total XP Earned',
                value: totalXP.toLocaleString(),
                sub: `of ${totalCap.toLocaleString()} possible`,
                color: '#22c55e',
              },
              {
                label: 'Zones Mastered',
                value: `${masteredCount}/${zones.length}`,
                sub: 'Keep going!',
                color: '#8b5cf6',
              },
              {
                label: 'Badges Earned',
                value: (profile.earnedBadgeIds ?? []).length.toString(),
                sub: 'View in profile',
                color: '#f59e0b',
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-xs text-white/35 mb-1">{kpi.label}</div>
                <div className="font-black text-lg" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs text-white/25 mt-0.5">{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Overall mastery bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/30 mb-1">
              <span>Portfolio progress</span>
              <span>{Math.round(overallMastery * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #d4af37, #f59e0b, #d4af37)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(overallMastery * 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick nav */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: '👤 Profile', route: '/profile' },
            { label: '🏆 Leaderboard', route: '/leaderboard' },
            { label: `${wallet.icon} Wallet`, route: '/wallet' },
            { label: '👨‍👩‍👧 Family', route: '/family' },
            { label: '🏫 Class', route: '/class/join' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => { sound.click(); navigate(btn.route); }}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-xl font-semibold text-white/50 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {btn.label}
            </button>
          ))}
        </motion.div>

        {/* Tier-grouped zones */}
        <div className="space-y-8">
          {tiers.map((tier, tIdx) => (
            <motion.section
              key={tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + tIdx * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-display text-sm font-bold text-white/60 uppercase tracking-widest">
                  {TIER_LABELS[tier] ?? `Tier ${tier}`}
                </h2>
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-white/25">
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
                  const neededPts = Math.ceil(prereqCap * getUnlockThreshold('adults'));
                  const xpGap = Math.max(0, neededPts - prereqPoints);
                  const xpEarned = progress[cat.id]?.masteryPoints ?? 0;
                  const thisCap = getMasteryCap(cat.id, 'adults');
                  const xpPct = getMasteryPercent(xpEarned, thisCap);

                  return (
                    <motion.button
                      key={cat.id}
                      className="relative flex flex-col p-3.5 rounded-2xl border text-left transition-all overflow-hidden"
                      style={{
                        background: unlocked
                          ? `linear-gradient(145deg, ${cat.colorDark}40, rgba(5,5,5,0.9))`
                          : 'rgba(255,255,255,0.02)',
                        borderColor: unlocked
                          ? mastery >= 0.9
                            ? '#d4af37' + '60'
                            : cat.color + '30'
                          : 'rgba(255,255,255,0.05)',
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: unlocked ? 1 : 0.35, scale: 1 }}
                      transition={{ delay: i * 0.025 }}
                      whileHover={unlocked ? { scale: 1.03, y: -2 } : {}}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        sound.click();
                        if (!unlocked) {
                          setLockedPop(cat.id);
                          sound.wrong();
                          setTimeout(() => setLockedPop(null), 2000);
                          return;
                        }
                        navigate(`/category/${cat.id}`);
                      }}
                    >
                      {/* Locked tooltip */}
                      <AnimatePresence>
                        {lockedPop === cat.id && (
                          <motion.div
                            className="absolute -top-9 left-1/2 -translate-x-1/2 bg-red-900/90 text-red-300 text-xs px-3 py-1 rounded-full whitespace-nowrap z-10 border border-red-700/50"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            {xpGap > 0 ? `${xpGap} XP needed` : 'Complete prerequisite'}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Gold mastered ring */}
                      {mastery >= 0.9 && (
                        <div
                          className="absolute top-0 right-0 w-1.5 h-full rounded-r-2xl"
                          style={{ background: 'linear-gradient(180deg, #d4af37, #f59e0b)' }}
                        />
                      )}

                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-2xl">{unlocked ? cat.emoji : '🔒'}</span>
                        {mastery >= 0.9 && (
                          <span className="text-xs text-yellow-400/80 mt-1">★</span>
                        )}
                      </div>

                      <h3 className="font-display text-xs text-white/80 font-bold leading-tight mb-1">
                        {cat.name}
                      </h3>

                      {unlocked ? (
                        <>
                          <div className="flex items-center justify-between text-xs mt-auto">
                            <span className="text-white/35">
                              {xpPct >= 0.9 ? 'Mastered' : xpPct > 0 ? `${Math.round(xpPct * 100)}%` : 'New'}
                            </span>
                            <span className="text-white/20 text-xs">{xpEarned}/{thisCap}</span>
                          </div>
                          <MasteryBar mastery={xpPct} color={mastery >= 0.9 ? '#d4af37' : cat.color} />
                        </>
                      ) : (
                        <div className="text-xs text-white/20 mt-auto pt-1">Locked</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-10 flex items-center justify-between border-t border-white/5 pt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-white/20 text-xs">
            {masteredCount}/{zones.length} mastered · {Math.round(overallMastery * 100)}% overall
          </p>
          <button
            onClick={() => { sound.click(); navigate('/leaderboard'); }}
            className="text-xs text-yellow-600/50 hover:text-yellow-400 transition-colors"
          >
            View leaderboard →
          </button>
        </motion.div>
      </main>
    </div>
  );
}
