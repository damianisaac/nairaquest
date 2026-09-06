import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked, selectProgress } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import { getMasteryCap, getUnlockThreshold } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import Cowrie from '../components/mascot/Cowrie';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

function StarRating({ mastery }: { mastery: number }) {
  const filled = mastery >= 0.9 ? 3 : mastery >= 0.5 ? 2 : mastery >= 0.2 ? 1 : 0;
  return (
    <div className="flex gap-0.5 text-xl">
      {[0, 1, 2].map((i) => (
        <motion.span key={i}
          animate={i < filled ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={i < filled ? 'text-yellow-400' : 'text-white/15'}>
          ★
        </motion.span>
      ))}
    </div>
  );
}

export default function KidsDashboard() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile } = state;
  const progress = selectProgress(state);
  const { user, isConfigured, loading: authLoading } = useAuth();
  const isGuest = isConfigured && !authLoading && !user;
  const [lockedPop, setLockedPop] = useState<CategoryId | null>(null);

  if (!profile) { navigate('/'); return null; }
  if (profile.ageTrack !== 'kids') {
    navigate(profile.ageTrack === 'teens' ? '/teens' : '/adults', { replace: true });
    return null;
  }

  const zones = CATEGORIES.filter((cat) =>
    (ALL_QUESTIONS[cat.id] ?? []).some((q) => q.ageTrack.includes('kids'))
  );
  const unlockPct = Math.round(getUnlockThreshold('kids') * 100);
  const masteredCount = zones.filter((c) => selectMasteryPercent(state, c.id) >= 0.9).length;

  return (
    <div className="min-h-screen overflow-x-hidden relative"
      style={{ background: 'linear-gradient(160deg, #042210 0%, #061a0e 40%, #030712 100%)' }}>

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute rounded-full"
          style={{ width: 450, height: 450, top: -150, left: -100, background: 'radial-gradient(circle, rgba(74,222,128,0.22) 0%, transparent 70%)', filter: 'blur(70px)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 350, height: 350, top: -100, right: -80, background: 'radial-gradient(circle, rgba(250,204,21,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 300, height: 300, bottom: 100, right: 50, background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)', filter: 'blur(70px)' }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        {/* Floating sparkle dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{ background: ['#fbbf24','#4ade80','#f472b6','#60a5fa','#fb923c','#a78bfa'][i], top: `${15 + i * 14}%`, left: `${5 + i * 15}%`, filter: 'blur(1px)' }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 0.9, 0.4], scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      <TopNav />

      <main className="relative pt-20 pb-12 px-4 max-w-3xl mx-auto">

        {/* ── Welcome header ── */}
        <motion.div className="text-center mb-7"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-center mb-3">
            <Cowrie mood="excited" message={`Hi ${profile.name}! Pick a zone to explore! 🌟`} size={80} />
          </div>
          <h1 className="font-display text-3xl font-black"
            style={{ background: 'linear-gradient(130deg, #fff 10%, #4ade80 60%, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hey {profile.name}! 👋
          </h1>
          <p className="text-green-300/80 text-sm mt-1 font-medium">Choose a zone and start your adventure!</p>

          {/* Stats row */}
          <div className="flex justify-center gap-3 mt-5">
            {[
              { value: `Lv ${profile.level}`, label: 'Level', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)' },
              { value: `${profile.dailyStreak}🔥`, label: 'Streak', color: '#fb923c', bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.35)' },
              { value: `${masteredCount}⭐`, label: 'Mastered', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.35)' },
            ].map((stat, i) => (
              <motion.div key={stat.label}
                className="flex flex-col items-center px-4 py-2.5 rounded-2xl"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                whileHover={{ scale: 1.1, y: -2 }}>
                <span className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-xs text-white/40 mt-0.5">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Guest banner ── */}
        {isGuest && (
          <motion.div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-2xl">☁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-300 font-semibold">Save your progress!</p>
              <p className="text-xs text-white/45 mt-0.5">You're playing as a guest — your stars won't survive a phone reset.</p>
            </div>
            <button onClick={() => { sound.click(); navigate('/auth'); }}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-green-900"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
              Sign Up →
            </button>
          </motion.div>
        )}

        {/* ── Zone grid ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {zones.map((cat, i) => {
            const mastery = selectMasteryPercent(state, cat.id);
            const unlocked = selectIsUnlocked(state, cat.id);
            const prereqId = cat.prerequisite;
            const prereqPoints = prereqId ? (progress[prereqId]?.masteryPoints ?? 0) : 0;
            const prereqCap = prereqId ? getMasteryCap(prereqId, 'kids') : 300;
            const xpNeeded = Math.max(0, Math.ceil(prereqCap * getUnlockThreshold('kids')) - prereqPoints);
            const isMastered = mastery >= 0.9;

            return (
              <motion.button key={cat.id}
                className="relative flex flex-col items-center text-center p-4 rounded-3xl border-2 overflow-hidden"
                style={{
                  background: unlocked
                    ? isMastered
                      ? `linear-gradient(145deg, ${cat.colorDark}90, ${cat.color}30)`
                      : `linear-gradient(145deg, ${cat.colorDark}70, ${cat.color}20)`
                    : 'rgba(255,255,255,0.04)',
                  borderColor: unlocked ? (isMastered ? '#fbbf24' : cat.color + '90') : 'rgba(255,255,255,0.09)',
                  boxShadow: unlocked ? `0 4px 20px ${cat.color}25` : 'none',
                }}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: unlocked ? 1 : 0.45, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 20 }}
                whileHover={unlocked ? { scale: 1.07, y: -5, boxShadow: `0 10px 35px ${cat.color}40` } : { scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
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
                      🔒 {xpNeeded > 0 ? `${xpNeeded} XP more needed!` : 'Keep playing!'}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mastered sparkle corner */}
                {isMastered && (
                  <motion.div className="absolute top-2 right-2"
                    animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                    ✨
                  </motion.div>
                )}

                <motion.span className="text-5xl mb-2"
                  animate={unlocked ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}>
                  {unlocked ? cat.emoji : '🔒'}
                </motion.span>

                <h3 className="font-display text-sm font-black leading-tight mb-2"
                  style={{ color: unlocked ? (isMastered ? '#fbbf24' : '#fff') : 'rgba(255,255,255,0.35)' }}>
                  {cat.name}
                </h3>

                {unlocked ? (
                  <>
                    <StarRating mastery={mastery} />
                    {isMastered && (
                      <motion.span className="mt-2 text-xs text-yellow-400 font-black"
                        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        MASTERED! 🏆
                      </motion.span>
                    )}
                    {mastery > 0 && !isMastered && (
                      <span className="mt-2 text-xs font-bold" style={{ color: cat.color }}>
                        {Math.round(mastery * 100)}% done
                      </span>
                    )}
                    {mastery === 0 && (
                      <motion.span className="mt-2 px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: cat.color + '30', border: `1px solid ${cat.color}60`, color: cat.color }}
                        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        Let's Go! →
                      </motion.span>
                    )}
                  </>
                ) : (
                  <span className="mt-2 text-xs text-white/35 font-medium">
                    {xpNeeded > 0 ? `${unlockPct}% to unlock` : 'Play more!'}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ── Progress footer ── */}
        <motion.div className="mt-8 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="text-white/35 text-sm font-medium">
            {masteredCount} of {zones.length} zones mastered · Keep going {profile.name}! 💪
          </p>
        </motion.div>
      </main>
    </div>
  );
}
