import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked, selectProgress } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import { getMasteryCap, getUnlockThreshold, getMasteryPercent } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

function MasteryBar({ mastery, color }: { mastery: number; color: string }) {
  return (
    <div className="relative w-full h-2 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
      <motion.div className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}bb, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(mastery * 100)}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {mastery > 0.05 && (
        <motion.div className="absolute inset-y-0 w-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
          animate={{ x: ['-40px', '400px'] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

export default function TeensDashboard() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile } = state;
  const progress = selectProgress(state);
  const { user, isConfigured, loading: authLoading } = useAuth();
  const isGuest = isConfigured && !authLoading && !user;
  const [lockedPop, setLockedPop] = useState<CategoryId | null>(null);

  if (!profile) { navigate('/'); return null; }
  if (profile.ageTrack !== 'teens') {
    navigate(profile.ageTrack === 'kids' ? '/kids' : '/adults', { replace: true });
    return null;
  }

  const zones = CATEGORIES.filter((cat) =>
    (ALL_QUESTIONS[cat.id] ?? []).some((q) => q.ageTrack.includes('teens'))
  );
  const masteredCount = zones.filter((c) => selectMasteryPercent(state, c.id) >= 0.9).length;
  const totalXP = zones.reduce((sum, c) => sum + (progress[c.id]?.masteryPoints ?? 0), 0);
  const totalCap = zones.reduce((sum, c) => sum + getMasteryCap(c.id, 'teens'), 0);
  const overallMastery = totalCap > 0 ? totalXP / totalCap : 0;

  const stats = [
    { label: 'Streak', value: `${profile.dailyStreak}🔥`, color: '#fb923c', bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.35)' },
    { label: 'XP', value: totalXP.toLocaleString(), color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)' },
    { label: 'Mastered', value: `${masteredCount}/${zones.length}`, color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.35)' },
    { label: 'Badges', value: `${(profile.earnedBadgeIds ?? []).length}🏅`, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden relative"
      style={{ background: 'linear-gradient(160deg, #080012 0%, #100220 45%, #030712 100%)' }}>

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute rounded-full"
          style={{ width: 500, height: 500, top: -180, right: -130, background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(70px)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 400, height: 400, bottom: 80, left: -120, background: 'radial-gradient(circle, rgba(236,72,153,0.16) 0%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 280, height: 280, top: '50%', left: '35%', background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        {/* Neon grid lines (decorative) */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <TopNav />

      <main className="relative pt-20 pb-12 px-4 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <motion.div className="mb-7" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-purple-400/70 text-xs font-bold tracking-widest uppercase mb-1">🚀 Level Up Your Money Game</p>
              <h1 className="font-display text-3xl font-black"
                style={{ background: 'linear-gradient(130deg, #fff 15%, #a78bfa 55%, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {profile.name}'s Arena
              </h1>
            </div>
            <motion.div className="px-5 py-3 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.12))', border: '1px solid rgba(139,92,246,0.45)' }}
              whileHover={{ scale: 1.06, boxShadow: '0 0 24px rgba(139,92,246,0.35)' }}>
              <motion.div className="text-2xl font-black text-purple-400"
                animate={{ textShadow: ['0 0 8px rgba(139,92,246,0)', '0 0 20px rgba(139,92,246,0.8)', '0 0 8px rgba(139,92,246,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                Lv {profile.level}
              </motion.div>
              <div className="text-xs text-white/40 mt-0.5">Level</div>
            </motion.div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2">
            {stats.map((stat, i) => (
              <motion.div key={stat.label}
                className="flex flex-col items-center py-2.5 px-1 rounded-xl"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ scale: 1.06, y: -2 }}>
                <span className="font-black text-sm sm:text-base" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-xs text-white/35 mt-0.5">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50 font-medium">Overall mastery</span>
              <span className="text-purple-400 font-bold">{Math.round(overallMastery * 100)}%</span>
            </div>
            <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4c1d95, #8b5cf6, #a855f7, #ec4899)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(overallMastery * 100)}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              />
              <motion.div className="absolute inset-y-0 w-14"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
                animate={{ x: ['-56px', '500px'] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div className="flex gap-2 mb-7 overflow-x-auto pb-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
          {[
            { label: '🏆 Leaderboard', route: '/leaderboard', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', color: '#fbbf24' },
            { label: '👤 Profile', route: '/profile', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.38)', color: '#c4b5fd' },
            { label: '🏅 Badges', route: '/profile', bg: 'rgba(251,146,60,0.14)', border: 'rgba(251,146,60,0.35)', color: '#fdba74' },
            { label: '👥 Class', route: '/class/join', bg: 'rgba(96,165,250,0.13)', border: 'rgba(96,165,250,0.33)', color: '#93c5fd' },
          ].map((btn) => (
            <motion.button key={btn.label}
              onClick={() => { sound.click(); navigate(btn.route); }}
              className="flex-shrink-0 text-xs px-3.5 py-2 rounded-xl font-bold"
              style={{ background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color }}
              whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.94 }}>
              {btn.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Guest banner ── */}
        {isGuest && (
          <motion.div className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.35)' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-2xl">☁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-300 font-semibold">Save your streak & XP!</p>
              <p className="text-xs text-white/45 mt-0.5">Guest progress can be lost. Create an account to keep your level and badges.</p>
            </div>
            <button onClick={() => { sound.click(); navigate('/auth'); }}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
              Sign Up →
            </button>
          </motion.div>
        )}

        {/* ── Zone grid ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {zones.map((cat, i) => {
            const mastery = selectMasteryPercent(state, cat.id);
            const unlocked = selectIsUnlocked(state, cat.id);
            const prereqId = cat.prerequisite;
            const prereqPoints = prereqId ? (progress[prereqId]?.masteryPoints ?? 0) : 0;
            const prereqCap = prereqId ? getMasteryCap(prereqId, 'teens') : 300;
            const xpGap = Math.max(0, Math.ceil(prereqCap * getUnlockThreshold('teens')) - prereqPoints);
            const xpEarned = progress[cat.id]?.masteryPoints ?? 0;
            const thisCap = getMasteryCap(cat.id, 'teens');
            const xpPct = getMasteryPercent(xpEarned, thisCap);
            const isMastered = mastery >= 0.9;

            return (
              <motion.button key={cat.id}
                className="relative flex flex-col p-3.5 rounded-2xl border text-left overflow-hidden"
                style={{
                  background: unlocked
                    ? isMastered
                      ? `linear-gradient(145deg, ${cat.colorDark}90, ${cat.color}20)`
                      : `linear-gradient(145deg, ${cat.colorDark}65, rgba(8,0,18,0.92))`
                    : 'rgba(255,255,255,0.03)',
                  borderColor: unlocked
                    ? isMastered ? '#a78bfacc' : cat.color + '60'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: unlocked ? `0 4px 16px ${cat.color}20` : 'none',
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: unlocked ? 1 : 0.4, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 250, damping: 22 }}
                whileHover={unlocked ? { scale: 1.05, y: -4, boxShadow: `0 10px 32px ${cat.color}38` } : {}}
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
                    <motion.div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap z-10 font-bold"
                      style={{ background: 'rgba(239,68,68,0.92)' }}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {xpGap > 0 ? `Need ${xpGap} more XP` : 'Play to unlock!'}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mastered neon badge */}
                {isMastered && (
                  <motion.span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(167,139,250,0.25)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.5)' }}
                    animate={{ boxShadow: ['0 0 6px rgba(167,139,250,0)', '0 0 14px rgba(167,139,250,0.6)', '0 0 6px rgba(167,139,250,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}>
                    ✓ Done
                  </motion.span>
                )}

                <motion.span className="text-3xl mb-2"
                  animate={unlocked && !isMastered ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}>
                  {unlocked ? cat.emoji : '🔒'}
                </motion.span>

                <h3 className="font-display text-xs font-black leading-tight mb-1"
                  style={{ color: unlocked ? (isMastered ? '#c4b5fd' : '#fff') : 'rgba(255,255,255,0.28)' }}>
                  {cat.name}
                </h3>

                {unlocked ? (
                  <>
                    <div className="text-xs font-semibold" style={{ color: isMastered ? '#a78bfa' : cat.color + 'dd' }}>
                      {isMastered ? '🔥 Mastered!' : xpPct > 0 ? `${Math.round(xpPct * 100)}%` : 'New!'}
                    </div>
                    <MasteryBar mastery={xpPct} color={isMastered ? '#8b5cf6' : cat.color} />
                  </>
                ) : (
                  <div className="text-xs text-white/25 mt-1">Locked</div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <motion.div className="mt-8 flex items-center justify-between"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <p className="text-white/30 text-xs font-medium">
            {masteredCount} zones mastered · {Math.round(overallMastery * 100)}% overall
          </p>
          <button onClick={() => { sound.click(); navigate('/leaderboard'); }}
            className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors font-semibold">
            See rankings →
          </button>
        </motion.div>
      </main>
    </div>
  );
}
