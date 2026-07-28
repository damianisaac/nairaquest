import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORY_MAP, CATEGORIES } from '../data/categories';
import { BADGES } from '../data/badges';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import Cowrie from '../components/mascot/Cowrie';
import { sound } from '../components/ui/SoundController';
import { formatPlayNaira, WALLET_NAMES, getStreakMultiplierDisplay } from '../utils/wallet';
import { isCategoryUnlocked } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import type { CategoryId } from '../types';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { lastResult, profile, progress, resetSession, startSession } = useGameStore();
  const soundPlayed = useRef(false);

  useEffect(() => {
    if (!lastResult || soundPlayed.current) return;
    soundPlayed.current = true;
    const accuracy = lastResult.correctCount / lastResult.totalCount;
    if (accuracy >= 0.8) {
      setTimeout(() => sound.levelUp(), 400);
    } else if (accuracy >= 0.5) {
      setTimeout(() => sound.correct(), 400);
    }
    if (lastResult.levelAfter > lastResult.levelBefore) {
      setTimeout(() => sound.levelUp(), 1200);
    }
  }, [lastResult]);

  if (!lastResult || !profile) {
    navigate('/map');
    return null;
  }

  const cat = CATEGORY_MAP[lastResult.categoryId];
  const accuracy = lastResult.correctCount / lastResult.totalCount;
  const pct = Math.round(accuracy * 100);
  const perfect = pct === 100;
  const newBadges = BADGES.filter((b) => lastResult.newBadgeIds.includes(b.id));
  const leveledUp = lastResult.levelAfter > lastResult.levelBefore;
  const walletName = WALLET_NAMES[profile.ageTrack];

  // Only suggest a next category that has questions for this age track
  const hasAgeQuestions = (catId: CategoryId) =>
    (ALL_QUESTIONS[catId] ?? []).some((q) => q.ageTrack.includes(profile.ageTrack));

  // Find the next logical unlocked zone to play after this one
  const nextCategory = useMemo(() => {
    if (!profile) return null;
    // Sort by tier so we always suggest the most accessible next zone
    const sorted = [...CATEGORIES].sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id));
    // Prefer zones in the same tier first, then higher tiers
    const currentTier = cat.tier;
    const sameTier = sorted.filter(
      (c) => c.id !== lastResult.categoryId && c.tier === currentTier
        && isCategoryUnlocked(c.id, progress, profile.ageTrack)
        && hasAgeQuestions(c.id)
    );
    const nextTier = sorted.filter(
      (c) => c.id !== lastResult.categoryId && c.tier > currentTier
        && isCategoryUnlocked(c.id, progress, profile.ageTrack)
        && hasAgeQuestions(c.id)
    );
    return sameTier[0] ?? nextTier[0] ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult.categoryId, progress, profile, cat.tier]);

  const DIFFICULTY_LABELS: Record<string, { emoji: string; label: string }> = {
    easy: { emoji: '🌱', label: 'Easy' },
    medium: { emoji: '⚡', label: 'Medium' },
    hard: { emoji: '🔥', label: 'Hard' },
  };

  const completedDiff = lastResult.difficultyCompleted;
  const nextDifficulty =
    completedDiff === 'easy' ? 'medium' : completedDiff === 'medium' ? 'hard' : null;

  // Does the next difficulty level actually have questions for this age track?
  const nextDiffHasQuestions = nextDifficulty
    ? (ALL_QUESTIONS[lastResult.categoryId] ?? []).some(
        (q) => q.ageTrack.includes(profile.ageTrack) && q.difficulty === nextDifficulty
      )
    : false;

  const mascotMood = pct >= 80 ? 'celebrating' : pct >= 50 ? 'excited' : 'thinking';
  const mascotMsg =
    pct === 100 ? 'PERFECT SCORE! You are unstoppable! 🏆' :
    pct >= 80 ? 'Excellent work! You really know your stuff!' :
    pct >= 60 ? 'Good job! Keep practicing to master this zone.' :
    pct >= 40 ? 'You are learning! Try again to boost your mastery.' :
    'Every expert started as a beginner. Try again!';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${cat.colorDark}20 0%, #030712 50%)` }}
    >
      <TopNav />
      <main className="flex-1 pt-20 pb-10 px-4 max-w-lg mx-auto w-full">
        {/* Score header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-2">{cat.emoji}</div>
          <h1 className="font-display text-2xl text-white">{cat.name} Complete!</h1>
          <p className="text-white/50 text-sm mt-1">
            {lastResult.correctCount} / {lastResult.totalCount} correct
          </p>
        </motion.div>

        {/* Big score ring */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
        >
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="50"
                fill="none"
                strokeWidth="8"
                stroke={pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'}
                strokeLinecap="round"
                strokeDasharray="314.2"
                initial={{ strokeDashoffset: 314.2 }}
                animate={{ strokeDashoffset: 314.2 - (pct / 100) * 314.2 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl text-white">{pct}%</span>
              <span className="text-xs text-white/40">accuracy</span>
            </div>
          </div>
        </motion.div>

        {/* Mascot */}
        <div className="flex justify-center mb-5">
          <Cowrie mood={mascotMood} message={mascotMsg} size={56} />
        </div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: 'XP Earned', value: `+${lastResult.masteryPointsEarned}`, color: '#22c55e', icon: '⭐' },
            { label: 'Streak', value: `${profile.dailyStreak} 🔥`, color: '#f59e0b', icon: '' },
            { label: 'Level', value: `${lastResult.levelAfter}`, color: '#8b5cf6', icon: leveledUp ? '⬆️' : '' },
          ].map((stat) => (
            <div key={stat.label} className="card-glass p-3 text-center">
              <div className="font-display text-xl" style={{ color: stat.color }}>
                {stat.icon} {stat.value}
              </div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Credits earned panel / Practice mode notice */}
        {lastResult.isPracticeMode ? (
          <motion.div
            className="mb-5 rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-2xl flex-shrink-0">🎯</span>
            <div>
              <p className="text-white/70 text-sm font-semibold mb-0.5">Practice Session</p>
              <p className="text-white/40 text-xs leading-relaxed">
                You've already mastered this zone — great work! Replays are free practice and don't award credits, so your wallet stays fair for everyone.
              </p>
            </div>
          </motion.div>
        ) : lastResult.creditsEarned > 0 ? (
          <motion.div
            className="mb-5 rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #d4af3715 0%, #b8960f15 100%)', border: '1px solid #d4af3730' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/60 flex items-center gap-2">
                  {walletName.icon} {walletName.title}
                  <span className="text-xs text-white/30 italic">— Play Naira</span>
                </span>
                {profile.dailyStreak >= 2 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {getStreakMultiplierDisplay(profile.dailyStreak)} streak
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Credits earned this session</span>
                <motion.span
                  className="font-display text-2xl text-naira-gold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.8, stiffness: 300, damping: 20 }}
                >
                  +{formatPlayNaira(lastResult.creditsEarned)}
                </motion.span>
              </div>
              {lastResult.masteryBonusCredits > 0 && (
                <div className="mt-2 text-xs text-naira-gold/70 flex items-center gap-1">
                  🏅 Mastery bonus: +{formatPlayNaira(lastResult.masteryBonusCredits)}
                </div>
              )}
            </div>
            <div className="px-4 py-2 bg-black/20 border-t border-white/5">
              <p className="text-xs text-white/25 leading-tight">
                Learning Credits only — not real money. Cannot be withdrawn or redeemed.
              </p>
            </div>
          </motion.div>
        ) : null}

        {/* Level up banner */}
        <AnimatePresence>
          {leveledUp && (
            <motion.div
              className="mb-5 p-4 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf620 0%, #d4af3720 100%)', border: '1px solid #d4af3740' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              <div className="text-3xl mb-1">🎊</div>
              <h3 className="font-display text-naira-gold text-lg">Level Up!</h3>
              <p className="text-white/70 text-sm">
                {lastResult.levelBefore} → <strong className="text-white">{lastResult.levelAfter}</strong>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New badges */}
        <AnimatePresence>
          {newBadges.length > 0 && (
            <motion.div
              className="mb-5 card-glass p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <h3 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wide">🏅 New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</h3>
              <div className="space-y-2">
                {newBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-naira-gold/10 border border-naira-gold/30"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <span className="text-2xl">{badge.emoji}</span>
                    <div>
                      <div className="font-bold text-naira-gold text-sm">{badge.name}</div>
                      <div className="text-xs text-white/50">{badge.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mastery progress */}
        <motion.div
          className="card-glass p-4 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-sm text-white/50 mb-3">{cat.name} Mastery</h3>
          <div className="mb-2 flex justify-between text-xs text-white/40">
            <span>Before: {Math.round(lastResult.previousMastery * 100)}%</span>
            <span>After: {Math.round(lastResult.newMastery * 100)}%</span>
          </div>
          <MasteryBar percent={lastResult.newMastery} color={cat.color} height="h-3" />
          {lastResult.newMastery >= 0.6 && lastResult.previousMastery < 0.6 && (
            <motion.p
              className="text-xs text-naira-green mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              🔓 You've unlocked new zones! Check the World Map.
            </motion.p>
          )}
        </motion.div>

        {/* Difficulty-cleared banner */}
        <AnimatePresence>
          {completedDiff && (
            <motion.div
              className="mb-5 p-4 rounded-2xl text-center"
              style={{
                background: completedDiff === 'hard'
                  ? 'linear-gradient(135deg, #d4af3720 0%, #22c55e20 100%)'
                  : 'linear-gradient(135deg, #22c55e20 0%, #16a34a10 100%)',
                border: '1px solid #22c55e40',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, type: 'spring' }}
            >
              <div className="text-3xl mb-1">
                {completedDiff === 'hard' ? '🏆' : '🎉'}
              </div>
              <h3 className="font-display text-naira-green text-lg">
                {completedDiff === 'hard' ? 'Zone Cleared!' : `${DIFFICULTY_LABELS[completedDiff].label} Complete!`}
              </h3>
              <p className="text-white/60 text-sm mt-1">
                {completedDiff === 'hard'
                  ? `You've answered every question in ${cat.name}!`
                  : `You've answered every ${DIFFICULTY_LABELS[completedDiff].label} question in this zone.`}
              </p>
              {nextDifficulty && (
                <p className="text-white/40 text-xs mt-1">
                  Ready to take on {DIFFICULTY_LABELS[nextDifficulty].emoji} {DIFFICULTY_LABELS[nextDifficulty].label}?
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {/* Primary action — always on top */}
          {completedDiff && nextDifficulty && nextDiffHasQuestions ? (
            /* Difficulty just completed and next difficulty has questions — jump into it */
            <motion.button
              className="btn-gold w-full"
              onClick={() => {
                sound.click();
                startSession(lastResult.categoryId, nextDifficulty);
                navigate('/play');
              }}
              whileTap={{ scale: 0.97 }}
            >
              Play {DIFFICULTY_LABELS[nextDifficulty].emoji} {DIFFICULTY_LABELS[nextDifficulty].label} →
            </motion.button>
          ) : completedDiff && (!nextDifficulty || !nextDiffHasQuestions) ? (
            /* All available difficulties done — suggest next zone */
            <motion.button
              className="btn-gold w-full"
              onClick={() => { sound.click(); resetSession(); navigate(nextCategory ? `/category/${nextCategory.id}` : '/map'); }}
              whileTap={{ scale: 0.97 }}
            >
              {nextCategory ? `Next: ${nextCategory.emoji} ${nextCategory.name} →` : 'World Map →'}
            </motion.button>
          ) : perfect && nextCategory ? (
            <motion.button
              className="btn-gold w-full"
              onClick={() => { sound.click(); resetSession(); navigate(`/category/${nextCategory.id}`); }}
              whileTap={{ scale: 0.97 }}
            >
              Next: {nextCategory.emoji} {nextCategory.name} →
            </motion.button>
          ) : (
            <button
              className="btn-primary w-full"
              onClick={() => { sound.click(); resetSession(); navigate(`/category/${lastResult.categoryId}`); }}
            >
              {perfect ? `Next: ${cat.emoji} ${cat.name} →` : 'Try Again'}
            </button>
          )}

          {/* World Map — always below */}
          <button
            className="w-full py-3 rounded-2xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
            onClick={() => { sound.click(); resetSession(); navigate('/map'); }}
          >
            World Map
          </button>

          {/* Share */}
          {navigator.share && (
            <button
              className="w-full py-3 rounded-2xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
              onClick={() => {
                navigator.share({
                  title: 'NairaQuest',
                  text: `I scored ${pct}% on ${cat.name} in NairaQuest! 🇳🇬 Join me to master financial literacy.`,
                });
              }}
            >
              📤 Share your score
            </button>
          )}
        </motion.div>
      </main>
    </div>
  );
}
