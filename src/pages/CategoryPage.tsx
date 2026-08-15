import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore, selectProgress, selectMasteryPercent, selectIsUnlocked } from '../store/gameStore';
import { CATEGORY_MAP } from '../data/categories';
import { ALL_QUESTIONS } from '../data/questions';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import { sound } from '../components/ui/SoundController';
import type { CategoryId, Difficulty } from '../types';

/** Difficulty each age-track plays. Kept here for startSession — not shown in UI. */
const TRACK_DIFFICULTY: Record<string, Difficulty> = {
  kids:   'easy',
  teens:  'medium',
  adults: 'hard',
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

  if (!unlocked) {
    navigate('/map');
    return null;
  }

  // Questions for this zone (ageTrack + matching difficulty)
  const myDifficulty = TRACK_DIFFICULTY[profile.ageTrack];
  const zoneQuestions = ALL_QUESTIONS[categoryId].filter(
    (q) => q.ageTrack.includes(profile.ageTrack) && q.difficulty === myDifficulty
  );

  // Which questions has the user already answered in this zone?
  const progress = selectProgress(state);
  const answeredIds = progress[categoryId]?.answeredQuestionIds ?? [];
  const allAnswered = zoneQuestions.length > 0 && zoneQuestions.every((q) => answeredIds.includes(q.id));
  const answeredCount = zoneQuestions.filter((q) => answeredIds.includes(q.id)).length;

  const handlePlay = () => {
    sound.click();
    startSession(categoryId, myDifficulty);
    navigate('/play');
  };

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
            <p className="text-xs text-naira-green mt-2">⭐ Master level — you're crushing it!</p>
          )}
          {mastery >= 0.6 && mastery < 0.8 && (
            <p className="text-xs text-white/50 mt-2">Keep going! 80% mastery unlocks the Master badge.</p>
          )}
          {mastery < 0.6 && mastery > 0 && (
            <p className="text-xs text-white/50 mt-2">Reach 60% to unlock Tier {cat.tier + 1} zones.</p>
          )}
        </motion.div>

        {/* Play card */}
        <motion.div
          className="card-glass p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg text-white">
                {allAnswered ? 'Zone Complete! 🏆' : 'Ready to play?'}
              </h2>
              <p className="text-xs text-white/45 mt-0.5">
                {zoneQuestions.length === 0
                  ? 'No questions available for your zone yet'
                  : allAnswered
                  ? `All ${zoneQuestions.length} questions answered — replay for extra mastery`
                  : `${answeredCount} of ${zoneQuestions.length} questions answered`}
              </p>
            </div>
            {allAnswered && (
              <span className="text-3xl">🏆</span>
            )}
          </div>

          {/* Progress dots */}
          {zoneQuestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-5">
              {zoneQuestions.slice(0, 30).map((q) => (
                <div
                  key={q.id}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: answeredIds.includes(q.id)
                      ? cat.color
                      : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
              {zoneQuestions.length > 30 && (
                <span className="text-xs text-white/30 self-center ml-1">
                  +{zoneQuestions.length - 30} more
                </span>
              )}
            </div>
          )}

          <motion.button
            className="w-full py-4 rounded-2xl font-display text-lg font-bold text-white transition-all"
            style={{
              background: zoneQuestions.length === 0
                ? 'rgba(255,255,255,0.06)'
                : `linear-gradient(135deg, ${cat.color}cc, ${cat.color})`,
              cursor: zoneQuestions.length === 0 ? 'not-allowed' : 'pointer',
              opacity: zoneQuestions.length === 0 ? 0.4 : 1,
            }}
            whileHover={zoneQuestions.length > 0 ? { scale: 1.02 } : {}}
            whileTap={zoneQuestions.length > 0 ? { scale: 0.98 } : {}}
            onClick={zoneQuestions.length > 0 ? handlePlay : undefined}
            disabled={zoneQuestions.length === 0}
          >
            {zoneQuestions.length === 0
              ? 'No questions yet'
              : allAnswered
              ? '🔄 Play Again'
              : `▶ Play Now · ${Math.min(10, zoneQuestions.length)} questions`}
          </motion.button>
        </motion.div>

        {/* Kids no-penalty note */}
        {profile.ageTrack === 'kids' && (
          <motion.div
            className="p-4 rounded-xl bg-naira-green/10 border border-naira-green/20 text-sm text-naira-green-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            🌟 Kids mode: no penalties for wrong answers — just keep learning!
          </motion.div>
        )}

        <motion.button
          className="mt-6 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
          onClick={() => { sound.click(); navigate('/map'); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          ← Back to World Map
        </motion.button>
      </main>
    </div>
  );
}
