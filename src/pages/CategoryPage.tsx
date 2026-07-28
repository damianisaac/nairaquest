import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore, selectMasteryPercent, selectIsUnlocked } from '../store/gameStore';
import { CATEGORY_MAP } from '../data/categories';
import { ALL_QUESTIONS } from '../data/questions';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import { sound } from '../components/ui/SoundController';
import type { CategoryId, Difficulty } from '../types';

const DIFFICULTY_INFO = {
  easy: { label: 'Easy (Kids Zone)', emoji: '🌱', desc: 'Perfect for beginners. Covers key concepts.', color: '#22c55e' },
  medium: { label: 'Medium (Teens Zone)', emoji: '⚡', desc: 'Scenario-based. Requires some reasoning.', color: '#f59e0b' },
  hard: { label: 'Hard (Adults Zone)', emoji: '🔥', desc: 'Advanced concepts. Real challenge.', color: '#ef4444' },
};

export default function CategoryPage() {
  const { id } = useParams<{ id: CategoryId }>();
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile, startSession } = state;

  if (!profile || !id || !CATEGORY_MAP[id as CategoryId]) {
    navigate('/map');
    return null;
  }

  const categoryId = id as CategoryId;
  const cat = CATEGORY_MAP[categoryId];
  const mastery = selectMasteryPercent(state, categoryId);
  const unlocked = selectIsUnlocked(state, categoryId);
  const classContext = state.classContext;
  const isAssigned = classContext?.focusCategoryId === categoryId;
  const availableQuestions = ALL_QUESTIONS[categoryId].filter((q) => q.ageTrack.includes(profile.ageTrack));

  if (!unlocked) {
    navigate('/map');
    return null;
  }

  const handleStart = (difficulty: Difficulty) => {
    sound.click();
    startSession(categoryId, difficulty);
    navigate('/play');
  };

  const answeredIds = state.progress[categoryId]?.answeredQuestionIds ?? [];

  const difficultyStatus = (['easy', 'medium', 'hard'] as Difficulty[]).reduce(
    (acc, diff) => {
      const pool = availableQuestions.filter((q) => q.difficulty === diff);
      const completed = pool.length > 0 && pool.every((q) => answeredIds.includes(q.id));
      acc[diff] = { count: pool.length, completed };
      return acc;
    },
    {} as Record<Difficulty, { count: number; completed: boolean }>
  );

  const allCleared = (['easy', 'medium', 'hard'] as Difficulty[]).every(
    (d) => difficultyStatus[d].count === 0 || difficultyStatus[d].completed
  );

  // First difficulty that has questions and hasn't been completed
  const recommendedDiff = (['easy', 'medium', 'hard'] as Difficulty[]).find(
    (d) => difficultyStatus[d].count > 0 && !difficultyStatus[d].completed
  ) ?? null;

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        {/* Teacher-assigned banner */}
        {isAssigned && (
          <motion.div
            className="mb-5 px-4 py-3 rounded-2xl border border-naira-gold/40 bg-naira-gold/10 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xl">📌</span>
            <div>
              <p className="text-sm text-naira-gold font-medium">Assigned by {classContext!.teacherName}</p>
              <p className="text-xs text-white/40">Your teacher has chosen this as this week's focus zone.</p>
            </div>
          </motion.div>
        )}

        {/* Zone header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-7xl mb-4 inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            {cat.emoji}
          </motion.div>
          <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">{cat.name}</h1>
          <p className="text-white/60 text-sm max-w-sm mx-auto">{cat.theme}</p>
        </motion.div>

        {/* Mastery card */}
        <motion.div
          className="card-glass p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60 font-medium">Zone Mastery</span>
            <span className="font-bold" style={{ color: cat.color }}>
              {Math.round(mastery * 100)}%
            </span>
          </div>
          <MasteryBar percent={mastery} color={cat.color} showPercent={false} height="h-3" />
          {mastery >= 0.8 && (
            <p className="text-xs text-naira-green mt-2">
              ⭐ Master level — you're crushing it in this zone!
            </p>
          )}
          {mastery >= 0.6 && mastery < 0.8 && (
            <p className="text-xs text-white/50 mt-2">
              Keep going! 80% mastery unlocks the Master badge.
            </p>
          )}
          {mastery < 0.6 && (
            <p className="text-xs text-white/50 mt-2">
              Reach 60% to unlock Tier {cat.tier + 1} zones.
            </p>
          )}
        </motion.div>

        {/* Difficulty selector */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-white">Choose Difficulty</h2>
            {allCleared && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-naira-green/20 text-naira-green border border-naira-green/30 font-medium">
                🏆 Zone Cleared!
              </span>
            )}
          </div>
          {(Object.entries(DIFFICULTY_INFO) as [Difficulty, typeof DIFFICULTY_INFO['easy']][]).map(
            ([diff, info], i) => {
              const { count, completed } = difficultyStatus[diff];
              const available = count > 0;
              const isRecommended = diff === recommendedDiff;

              return (
                <motion.button
                  key={diff}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left"
                  style={{
                    borderColor: completed
                      ? '#22c55e30'
                      : isRecommended
                      ? info.color + '60'
                      : available
                      ? info.color + '30'
                      : 'rgba(255,255,255,0.06)',
                    background: completed
                      ? '#22c55e08'
                      : isRecommended
                      ? info.color + '15'
                      : available
                      ? info.color + '08'
                      : 'rgba(255,255,255,0.02)',
                    opacity: available ? 1 : 0.4,
                    cursor: available ? 'pointer' : 'not-allowed',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: available ? 1 : 0.4, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  whileHover={available ? { scale: 1.02 } : {}}
                  whileTap={available ? { scale: 0.98 } : {}}
                  onClick={() => available && handleStart(diff)}
                >
                  <span className="text-3xl">{completed ? '✅' : info.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-white">{info.label}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: info.color + '20', color: info.color }}
                      >
                        {count} Qs
                      </span>
                      {completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-naira-green/20 text-naira-green">
                          Completed
                        </span>
                      )}
                      {isRecommended && !completed && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: info.color + '30', color: info.color }}
                        >
                          Next up
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      {completed ? 'All questions answered — replay to boost mastery' : info.desc}
                    </p>
                  </div>
                  {available && (
                    <span className="text-white/30 text-lg">→</span>
                  )}
                </motion.button>
              );
            }
          )}
        </motion.div>

        {/* Age track note */}
        {profile.ageTrack === 'kids' && (
          <motion.div
            className="mt-6 p-4 rounded-xl bg-naira-green/10 border border-naira-green/20 text-sm text-naira-green-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            🌟 Kids mode: no penalties for wrong answers — just keep learning!
          </motion.div>
        )}

        <motion.button
          className="mt-6 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
          onClick={() => { sound.click(); navigate('/map'); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ← Back to World Map
        </motion.button>
      </main>
    </div>
  );
}
