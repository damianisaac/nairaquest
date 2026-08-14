import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import { getMasteryCap, getUnlockThreshold, getMasteryPercent } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

function MasteryBar({ mastery, color }: { mastery: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(mastery * 100)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function TeensDashboard() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile, progress } = state;
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

  // Overall mastery across all teens zones
  const totalCap = zones.reduce((sum, c) => sum + getMasteryCap(c.id, 'teens'), 0);
  const overallMastery = totalCap > 0 ? totalXP / totalCap : 0;

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0118 0%, #120328 40%, #030712 100%)' }}
    >
      <TopNav />

      <main className="pt-20 pb-12 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl text-white font-black">
                {profile.name}'s Arena 🚀
              </h1>
              <p className="text-purple-300/60 text-sm">Level up your money game</p>
            </div>
            <div
              className="px-4 py-2 rounded-2xl text-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <div className="text-2xl font-black text-purple-400">Lv {profile.level}</div>
              <div className="text-xs text-white/40">Level</div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Streak', value: `${profile.dailyStreak}🔥`, color: 'text-orange-400' },
              { label: 'XP', value: totalXP.toLocaleString(), color: 'text-purple-400' },
              { label: 'Mastered', value: `${masteredCount}/${zones.length}`, color: 'text-green-400' },
              { label: 'Badges', value: `${(profile.earnedBadgeIds ?? []).length}🏅`, color: 'text-yellow-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-2 px-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className={`font-black text-sm sm:text-base ${stat.color}`}>{stat.value}</span>
                <span className="text-xs text-white/30 mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>Overall mastery</span>
              <span>{Math.round(overallMastery * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(overallMastery * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: '🏆 Leaderboard', route: '/leaderboard' },
            { label: '👤 Profile', route: '/profile' },
            { label: '🏅 Badges', route: '/profile' },
            { label: '👥 Class', route: '/class/join' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => { sound.click(); navigate(btn.route); }}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-xl font-semibold text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {btn.label}
            </button>
          ))}
        </motion.div>

        {/* Guest sign-in banner */}
        {isGuest && (
          <motion.div
            className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{
              background: 'rgba(139,92,246,0.08)',
              borderColor: 'rgba(139,92,246,0.3)',
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-2xl flex-shrink-0">☁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-300 font-semibold leading-tight">
                Save your streak & XP!
              </p>
              <p className="text-xs text-white/45 mt-0.5 leading-snug">
                Guest progress can be lost. Create an account to keep your level and badges.
              </p>
            </div>
            <button
              onClick={() => { sound.click(); navigate('/auth'); }}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}
            >
              Sign Up →
            </button>
          </motion.div>
        )}

        {/* Zone grid — 2 columns on mobile, 3 on sm+ */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {zones.map((cat, i) => {
            const mastery = selectMasteryPercent(state, cat.id);
            const unlocked = selectIsUnlocked(state, cat.id);
            const prereqId = cat.prerequisite;
            const prereqPoints = prereqId ? (progress[prereqId]?.masteryPoints ?? 0) : 0;
            const prereqCap = prereqId ? getMasteryCap(prereqId, 'teens') : 300;
            const neededPts = Math.ceil(prereqCap * getUnlockThreshold('teens'));
            const xpGap = Math.max(0, neededPts - prereqPoints);
            const xpEarned = progress[cat.id]?.masteryPoints ?? 0;
            const thisCap = getMasteryCap(cat.id, 'teens');
            const xpPct = getMasteryPercent(xpEarned, thisCap);

            return (
              <motion.button
                key={cat.id}
                className="relative flex flex-col p-3 rounded-2xl border text-left transition-all overflow-hidden"
                style={{
                  background: unlocked
                    ? `linear-gradient(145deg, ${cat.colorDark}50, rgba(3,7,18,0.8))`
                    : 'rgba(255,255,255,0.03)',
                  borderColor: unlocked ? cat.color + '50' : 'rgba(255,255,255,0.06)',
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: unlocked ? 1 : 0.45, y: 0 }}
                transition={{ delay: i * 0.03 }}
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
                      className="absolute -top-9 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap z-10"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {xpGap > 0 ? `Need ${xpGap} more XP` : 'Play to unlock!'}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mastered badge */}
                {mastery >= 0.9 && (
                  <span className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/30">
                    ✓ Done
                  </span>
                )}

                <span className="text-3xl mb-2">{unlocked ? cat.emoji : '🔒'}</span>
                <h3 className="font-display text-xs text-white font-bold leading-tight mb-1">
                  {cat.name}
                </h3>

                {unlocked ? (
                  <>
                    <div className="text-xs text-white/40">
                      {xpPct >= 0.9 ? '🔥 Mastered!' : xpPct > 0 ? `${Math.round(xpPct * 100)}%` : 'New!'}
                    </div>
                    <MasteryBar mastery={xpPct} color={cat.color} />
                  </>
                ) : (
                  <div className="text-xs text-white/25 mt-1">Locked</div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer nudge */}
        <motion.div
          className="mt-8 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/25 text-xs">
            {masteredCount} zones mastered · {Math.round(overallMastery * 100)}% overall
          </p>
          <button
            onClick={() => { sound.click(); navigate('/leaderboard'); }}
            className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors"
          >
            See rankings →
          </button>
        </motion.div>
      </main>
    </div>
  );
}
