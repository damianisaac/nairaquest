import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORY_MAP } from '../data/categories';
import TopNav from '../components/ui/TopNav';
import Cowrie from '../components/mascot/Cowrie';
import ConsequenceReplay from '../components/ui/ConsequenceReplay';
import { sound } from '../components/ui/SoundController';

type FeedbackState = 'none' | 'correct' | 'wrong';

export default function GameplayPage() {
  const navigate = useNavigate();
  const { session, submitAnswer, endSession, profile, questionTimerSeconds } = useGameStore();

  const questionTime = questionTimerSeconds;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [timeLeft, setTimeLeft] = useState(questionTime);
  const [showConsequence, setShowConsequence] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);
  const endedRef = useRef(false);
  // Refs to avoid closure-stale-state bugs in timeouts
  const selectedIndexRef = useRef<number | null>(null);
  const submittedRef = useRef(false); // one submit per question, prevents double-advance

  // End session in effect, not during render — calling set() during render is forbidden
  useEffect(() => {
    if (!session?.completed || endedRef.current) return;
    endedRef.current = true;
    const result = endSession();
    if (result) navigate('/results');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.completed]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(questionTime);
    answeredRef.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          if (!answeredRef.current) {
            handleTimeout();
          }
          return 0;
        }
        if (t <= 6) sound.timerTick();
        return t - 1;
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentIndex]);

  useEffect(() => {
    if (!session || session.completed) return;
    // Reset per-question refs whenever the question changes
    selectedIndexRef.current = null;
    submittedRef.current = false;
    startTimer();
    setSelectedIndex(null);
    setFeedback('none');
    setShowConsequence(false);
    return clearTimer;
  }, [session?.currentIndex, startTimer]);

  if (!session || !profile) {
    navigate('/map');
    return null;
  }

  // Session is complete — the useEffect above handles endSession + navigation
  if (session.completed) return null;

  const question = session.questions[session.currentIndex];
  const cat = CATEGORY_MAP[session.categoryId];
  const progress = (session.currentIndex / session.questions.length) * 100;
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  function commitAnswer(idx: number) {
    // Guard: only submit once per question regardless of how many timeouts fire
    if (submittedRef.current) return;
    submittedRef.current = true;
    setShowConsequence(false);
    submitAnswer(idx);
    setSelectedIndex(null);
    setFeedback('none');
  }

  function handleTimeout() {
    answeredRef.current = true;
    setFeedback('wrong');
    sound.wrong();
    setTimeout(() => commitAnswer(-1), 2000);
  }

  function handleAnswer(index: number) {
    if (feedback !== 'none' || answeredRef.current) return;
    answeredRef.current = true;
    clearTimer();
    // Store in ref immediately — timeouts must read from ref, not closed-over state
    selectedIndexRef.current = index;
    setSelectedIndex(index);

    const correct = index === question.correctIndex;

    if (correct) {
      setFeedback('correct');
      setShowConfetti(true);
      sound.correct();
      setTimeout(() => setShowConfetti(false), 1500);
      // Pass index via ref capture so stale-closure can't corrupt the answer
      const captured = index;
      setTimeout(() => commitAnswer(captured), 1800);
    } else {
      setFeedback('wrong');
      sound.wrong();
      if (question.consequenceReplay && profile?.ageTrack !== 'kids') {
        setTimeout(() => setShowConsequence(true), 800);
      } else {
        const captured = index;
        setTimeout(() => commitAnswer(captured), 2000);
      }
    }
  }

  // Used by consequence replay dismiss and manual "Next" button
  function advanceOrEnd() {
    commitAnswer(selectedIndexRef.current ?? -1);
  }

  const difficultyColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
  const diffColor = difficultyColors[question.difficulty];

  const mascotMood =
    feedback === 'correct' ? 'celebrating' :
    feedback === 'wrong' ? 'sad' :
    timeLeft < 8 ? 'thinking' : 'idle';

  const mascotMsg =
    feedback === 'correct' ? 'Correct! Great job! 🎉' :
    feedback === 'wrong' ? 'Not quite — read the explanation below.' :
    timeLeft < 8 ? 'Think carefully! Time is running out!' :
    `Question ${session.currentIndex + 1} of ${session.questions.length}`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" style={{ background: `linear-gradient(135deg, ${cat.colorDark}15 0%, #030712 40%)` }}>
      <TopNav />

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst color={cat.color} />}
      </AnimatePresence>

      <main className="flex-1 pt-20 pb-6 px-4 max-w-2xl mx-auto w-full flex flex-col">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
            <span style={{ color: cat.color }}>{cat.name}</span>
            <span>{session.currentIndex + 1} / {session.questions.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: cat.color }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Timer + difficulty */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="badge-chip text-xs"
            style={{ background: diffColor + '20', color: diffColor, borderColor: diffColor + '40', border: '1px solid' }}
          >
            {question.difficulty}
          </span>

          {/* Circular timer */}
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 40 40" className="w-12 h-12 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <motion.circle
                cx="20" cy="20" r="16"
                fill="none"
                strokeWidth="3"
                stroke={timeLeft < 6 ? '#ef4444' : timeLeft < 11 ? '#f59e0b' : cat.color}
                strokeLinecap="round"
                strokeDasharray="100.5"
                strokeDashoffset={100.5 - (timeLeft / questionTime) * 100.5}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${timeLeft < 6 ? 'text-red-400' : 'text-white/70'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-4">
          <Cowrie mood={mascotMood} message={mascotMsg} size={56} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="card-glass p-5 mb-4">
              <p className="font-body text-lg text-white leading-relaxed">{question.text}</p>
            </div>

            {/* Answer options */}
            <div className="space-y-2 mb-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedIndex === i;
                const isCorrect = i === question.correctIndex;
                const showResult = feedback !== 'none';

                let optStyle = '';
                let extraStyle: React.CSSProperties = {};

                if (showResult) {
                  if (isCorrect) {
                    optStyle = 'answer-correct';
                    extraStyle = { borderColor: '#22c55e', background: 'rgba(34,197,94,0.15)' };
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'answer-wrong';
                    extraStyle = { borderColor: '#ef4444', background: 'rgba(239,68,68,0.15)' };
                  }
                }

                return (
                  <motion.button
                    key={i}
                    className={`answer-option ${optStyle}`}
                    style={extraStyle}
                    onClick={() => handleAnswer(i)}
                    disabled={feedback !== 'none'}
                    whileHover={feedback === 'none' ? { scale: 1.01 } : {}}
                    whileTap={feedback === 'none' ? { scale: 0.99 } : {}}
                    animate={
                      showResult && isSelected && !isCorrect
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${
                        showResult && isCorrect
                          ? 'bg-naira-green border-naira-green text-white'
                          : showResult && isSelected
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-white/20 text-white/50'
                      }`}>
                        {showResult && isCorrect ? '✓' : showResult && isSelected ? '✗' : 'ABCD'[i]}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            <AnimatePresence>
              {feedback !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                    feedback === 'correct'
                      ? 'bg-naira-green/10 border border-naira-green/30 text-naira-green-light'
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}>
                    <strong>{feedback === 'correct' ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
                    {question.explanation}
                  </div>

                  {feedback === 'correct' && (
                    <motion.button
                      className="mt-3 w-full btn-primary"
                      onClick={() => {
                        sound.click();
                        advanceOrEnd();
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {isLastQuestion ? 'See Results →' : 'Next Question →'}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Consequence Replay Modal */}
      <AnimatePresence>
        {showConsequence && question.consequenceReplay && (
          <ConsequenceReplay
            replay={question.consequenceReplay}
            onDismiss={advanceOrEnd}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfettiBurst({ color }: { color: string }) {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: '50%',
            top: '40%',
            background: i % 3 === 0 ? color : i % 3 === 1 ? '#d4af37' : '#ffffff',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: Math.random() * -300 + 100,
            opacity: 0,
            rotate: Math.random() * 360,
            scale: Math.random() * 1.5 + 0.5,
          }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: Math.random() * 0.1 }}
        />
      ))}
    </div>
  );
}
