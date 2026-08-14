import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked } from '../store/gameStore';
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
    <div className="flex gap-0.5 text-lg">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < filled ? 'text-yellow-400' : 'text-white/20'}>★</span>
      ))}
    </div>
  );
}

export default function KidsDashboard() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile, progress } = state;
  const { user, isConfigured, loading: authLoading } = useAuth();
  const isGuest = isConfigured && !authLoading && !user;
  const [lockedPop, setLockedPop] = useState<CategoryId | null>(null);

  if (!profile) { navigate('/'); return null; }
  // Guard: wrong track
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
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #052e16 0%, #042f14 40%, #030712 100%)' }}
    >
      <TopNav />

      <main className="pt-20 pb-12 px-4 max-w-3xl mx-auto">
        {/* Welcome header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-3">
            <Cowrie mood="excited" message={`Hi ${profile.name}! Pick a zone to explore! 🌟`} size={80} />
          </div>
          <h1 className="font-display text-3xl text-white font-black">
            Hey {profile.name}! 👋
          </h1>
          <p className="text-green-300/70 text-sm mt-1">Choose a zone and start your adventure!</p>

          {/* Kid-friendly stats */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex flex-col items-center px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-2xl font-black text-yellow-400">Lv {profile.level}</span>
              <span className="text-xs text-white/40">Level</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-2xl font-black text-orange-400">{profile.dailyStreak}🔥</span>
              <span className="text-xs text-white/40">Streak</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-2xl font-black text-green-400">{masteredCount}⭐</span>
              <span className="text-xs text-white/40">Mastered</span>
            </div>
          </div>
        </motion.div>

        {/* Guest sign-in banner */}
        {isGuest && (
          <motion.div
            className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{
              background: 'rgba(34,197,94,0.08)',
              borderColor: 'rgba(34,197,94,0.25)',
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-2xl flex-shrink-0">☁️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-300 font-semibold leading-tight">
                Save your progress!
              </p>
              <p className="text-xs text-white/45 mt-0.5 leading-snug">
                You're playing as a guest — your stars won't survive a phone reset.
              </p>
            </div>
            <button
              onClick={() => { sound.click(); navigate('/auth'); }}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-white"
              style={{ background: 'rgba(34,197,94,0.25)', border: '1px solid rgba(34,197,94,0.4)' }}
            >
              Sign Up →
            </button>
          </motion.div>
        )}

        {/* Zone grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {zones.map((cat, i) => {
            const mastery = selectMasteryPercent(state, cat.id);
            const unlocked = selectIsUnlocked(state, cat.id);
            const prereqId = cat.prerequisite;
            const prereqPoints = prereqId ? (progress[prereqId]?.masteryPoints ?? 0) : 0;
            const prereqCap = prereqId ? getMasteryCap(prereqId, 'kids') : 300;
            const neededPoints = Math.ceil(prereqCap * getUnlockThreshold('kids'));
            const xpNeeded = Math.max(0, neededPoints - prereqPoints);

            return (
              <motion.button
                key={cat.id}
                className="relative flex flex-col items-center text-center p-4 rounded-3xl border-2 transition-all"
                style={{
                  background: unlocked
                    ? `linear-gradient(145deg, ${cat.colorDark}60, ${cat.color}25)`
                    : 'rgba(255,255,255,0.04)',
                  borderColor: unlocked ? cat.color + '70' : 'rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: unlocked ? 1 : 0.55, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={unlocked ? { scale: 1.05, y: -4 } : { scale: 1.02 }}
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
                {/* Locked pop-up */}
                <AnimatePresence>
                  {lockedPop === cat.id && (
                    <motion.div
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap z-10"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      🔒 {xpNeeded > 0 ? `${xpNeeded} XP more needed!` : 'Keep playing!'}
                    </motion.div>
                  )}
                </AnimatePresence>

                <span className="text-5xl mb-2">{unlocked ? cat.emoji : '🔒'}</span>
                <h3 className="font-display text-sm text-white font-bold leading-tight mb-2">
                  {cat.name}
                </h3>

                {unlocked ? (
                  <>
                    <StarRating mastery={mastery} />
                    {mastery >= 0.9 && (
                      <span className="mt-2 text-xs text-yellow-400 font-bold">MASTERED! 🏆</span>
                    )}
                    {mastery > 0 && mastery < 0.9 && (
                      <span className="mt-2 text-xs text-green-300/60">
                        {Math.round(mastery * 100)}% done
                      </span>
                    )}
                    {mastery === 0 && (
                      <span className="mt-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold">
                        Let's Go! →
                      </span>
                    )}
                  </>
                ) : (
                  <span className="mt-2 text-xs text-white/40">Play more to unlock!</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Progress footer */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/30 text-xs">
            {masteredCount} of {zones.length} zones mastered · Keep going {profile.name}! 💪
          </p>
        </motion.div>
      </main>
    </div>
  );
}
