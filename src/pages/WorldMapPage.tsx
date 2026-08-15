import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked, selectProgress } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import { getMasteryCap, getUnlockThreshold } from '../utils/scoring';
import { ALL_QUESTIONS } from '../data/questions';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import Cowrie from '../components/mascot/Cowrie';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

const MASCOT_MESSAGES: Record<string, string> = {
  default: 'Choose a zone to explore and earn mastery points!',
  locked: 'Keep playing the prerequisite zone to unlock this one!',
  'money-basics': 'Start here! Every financial journey begins with the basics.',
  banking: 'Learn to bank like a pro — ATMs, USSD, mobile money, and more!',
  budgeting: 'A budget is your money\'s game plan. Let\'s build yours!',
  savings: 'The secret to wealth? Make your money work while you sleep.',
  scams: 'Warning! Scammers are everywhere. Know their tricks!',
  taxes: 'Taxes build the nation — understand FIRS, VAT, and PAYE!',
  loans: 'Debt is a tool — learn to use it wisely.',
  economy: 'Why does ₦1,000 buy less than before? Let\'s find out!',
  entrepreneur: 'Every big business started small. What\'s your hustle?',
  insurance: 'Protect what you have. Risk management is underrated.',
  crypto: 'Blockchain and Bitcoin are real — but so are the scams. Be smart!',
  pension: 'Your future self will thank you. Plan retirement today!',
  'real-estate': 'Land is wealth in Nigeria — but only with the right documents!',
  forex: 'Understand exchange rates and your money travels the world.',
};

export default function WorldMapPage() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile, classContext } = state;
  const progress = selectProgress(state);
  const [hoveredZone, setHoveredZone] = useState<CategoryId | null>(null);
  const [lockedAttempt, setLockedAttempt] = useState(false);

  if (!profile) {
    navigate('/');
    return null;
  }

  // Only show categories that have at least one question for this age track
  const visibleCategories = CATEGORIES.filter((cat) =>
    (ALL_QUESTIONS[cat.id] ?? []).some((q) => q.ageTrack.includes(profile.ageTrack))
  );

  const unlockPct = Math.round(getUnlockThreshold(profile.ageTrack) * 100);

  const masteryMessage =
    hoveredZone
      ? MASCOT_MESSAGES[hoveredZone] ?? MASCOT_MESSAGES.default
      : lockedAttempt
      ? MASCOT_MESSAGES.locked
      : MASCOT_MESSAGES.default;

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg overflow-x-hidden">
      <TopNav />

      <main className="pt-20 pb-12 px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
            Financial World Map
          </h1>
          <p className="text-white/50 text-sm">
            Explore zones, earn mastery, unlock new territories
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <span className="text-naira-gold font-bold">Level {profile.level}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">{profile.totalMasteryPoints} XP</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">{profile.dailyStreak} 🔥 streak</span>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Zone Grid */}
          <div className="flex-1">
            {/* Tier labels + zones */}
            {[0, 1, 2, 3, 4].map((tier) => {
              const tieredCats = visibleCategories.filter((c) => c.tier === tier);
              return (
                <div key={tier} className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-white/30 px-2">
                      {tier === 0 ? 'Starter Zone' : tier === 4 ? 'Tier 4 — Advanced' : `Tier ${tier}`}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className={`grid gap-3 ${tier === 0 ? 'grid-cols-1' : tier === 1 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {tieredCats.map((cat, i) => {
                      const mastery = selectMasteryPercent(state, cat.id);
                      const unlocked = selectIsUnlocked(state, cat.id);

                      // For locked zones: find the prerequisite's mastery points + cap
                      const prereqId = cat.prerequisite;
                      const prereqPoints = prereqId ? (progress[prereqId]?.masteryPoints ?? 0) : 0;
                      const prereqCap = prereqId && profile ? getMasteryCap(prereqId, profile.ageTrack) : 300;
                      const neededPoints = Math.ceil(prereqCap * getUnlockThreshold(profile.ageTrack));
                      const xpNeeded = Math.max(0, neededPoints - prereqPoints);
                      const prereqPct = Math.min(1, prereqPoints / prereqCap);

                      return (
                        <ZoneCard
                          key={cat.id}
                          cat={cat}
                          mastery={mastery}
                          unlocked={unlocked}
                          index={i}
                          xpNeeded={xpNeeded}
                          prereqPct={prereqPct}
                          unlockPct={unlockPct}
                          isAssigned={classContext?.focusCategoryId === cat.id}
                          onHover={(id) => { setHoveredZone(id); setLockedAttempt(false); }}
                          onLeave={() => setHoveredZone(null)}
                          onSelect={(id) => {
                            sound.click();
                            if (!unlocked) {
                              setLockedAttempt(true);
                              sound.wrong();
                              return;
                            }
                            navigate(`/category/${id}`);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar: Mascot + mini progress */}
          <div className="lg:w-64 space-y-4">
            {/* Cowrie mascot */}
            <div className="card-glass p-5 flex flex-col items-center">
              <Cowrie
                mood={lockedAttempt ? 'sad' : hoveredZone ? 'excited' : 'idle'}
                message={masteryMessage}
                size={72}
              />
            </div>

            {/* Progress summary */}
            <div className="card-glass p-4 space-y-3">
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide">
                Your Mastery
              </h3>
              {visibleCategories.slice(0, 5).map((cat) => {
                const mastery = selectMasteryPercent(state, cat.id);
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-xs text-white/60 truncate">{cat.name}</span>
                    </div>
                    <MasteryBar
                      percent={mastery}
                      color={cat.color}
                      showPercent={false}
                      height="h-1.5"
                    />
                  </div>
                );
              })}
              {visibleCategories.length > 5 && (
                <button
                  className="text-xs text-naira-green hover:text-naira-green-light w-full text-center"
                  onClick={() => navigate('/profile')}
                >
                  View all →
                </button>
              )}
            </div>

            {/* Earned badges count */}
            {profile.earnedBadgeIds.length > 0 && (
              <div className="card-glass p-4 text-center">
                <div className="text-2xl mb-1">🏅</div>
                <div className="font-display text-xl text-naira-gold">{profile.earnedBadgeIds.length}</div>
                <div className="text-xs text-white/50">Badges earned</div>
                <button
                  className="mt-2 text-xs text-naira-green hover:underline"
                  onClick={() => navigate('/profile')}
                >
                  View badges →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface ZoneCardProps {
  cat: typeof CATEGORIES[0];
  mastery: number;
  unlocked: boolean;
  index: number;
  xpNeeded: number;
  prereqPct: number;
  unlockPct: number;
  isAssigned?: boolean;
  onHover: (id: CategoryId) => void;
  onLeave: () => void;
  onSelect: (id: CategoryId) => void;
}

function ZoneCard({ cat, mastery, unlocked, index, xpNeeded, prereqPct, unlockPct, isAssigned, onHover, onLeave, onSelect }: ZoneCardProps) {
  const pct = Math.round(mastery * 100);
  const prereqName = CATEGORIES.find((c) => c.id === cat.prerequisite)?.name ?? 'prerequisite';
  const prereqPctRound = Math.round(prereqPct * 100);

  return (
    <motion.button
      className="zone-card text-left w-full"
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${cat.colorDark}40 0%, ${cat.color}20 100%)`
          : 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: unlocked ? cat.color + '40' : 'rgba(255,255,255,0.06)',
        opacity: unlocked ? 1 : 0.65,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: unlocked ? 1 : 0.65, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={unlocked ? { scale: 1.03, y: -3 } : { scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => onHover(cat.id)}
      onHoverEnd={onLeave}
      onClick={() => onSelect(cat.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{unlocked ? cat.emoji : '🔒'}</span>
        <div className="flex items-center gap-1.5">
          {isAssigned && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-naira-gold/20 text-naira-gold border border-naira-gold/30">
              📌 Focus
            </span>
          )}
          {unlocked && pct >= unlockPct && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-naira-green/20 text-naira-green border border-naira-green/30">
              ✓ Mastered
            </span>
          )}
        </div>
      </div>
      <h3 className="font-display text-sm text-white mb-1">{cat.name}</h3>
      <p className="text-xs text-white/40 mb-3 line-clamp-2">{cat.description}</p>

      {unlocked ? (
        /* Own mastery bar for unlocked zones */
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Mastery</span>
            <span style={{ color: cat.color }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: cat.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: index * 0.05 }}
            />
          </div>
        </div>
      ) : (
        /* Unlock progress bar for locked zones */
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40">{prereqName} mastery</span>
            <span className="text-white/50 font-medium">{prereqPctRound}% / {unlockPct}%</span>
          </div>
          {/* Bar with threshold marker */}
          <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #22c55e)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, prereqPctRound)}%` }}
              transition={{ duration: 1, delay: index * 0.05 }}
            />
            {/* Unlock threshold tick mark */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/60"
              style={{ left: `${unlockPct}%` }}
            />
          </div>
          {xpNeeded > 0 ? (
            <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>
              🔓 {xpNeeded} more XP needed in {prereqName}
            </p>
          ) : (
            <p className="text-xs text-naira-green font-medium">
              ✓ Ready to unlock — go to {prereqName}!
            </p>
          )}
        </div>
      )}
    </motion.button>
  );
}
