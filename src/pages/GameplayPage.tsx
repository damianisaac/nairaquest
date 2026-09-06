import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { CATEGORY_MAP } from '../data/categories';
import TopNav from '../components/ui/TopNav';
import Cowrie from '../components/mascot/Cowrie';
import ConsequenceReplay from '../components/ui/ConsequenceReplay';
import { sound } from '../components/ui/SoundController';
import { useAccessibility, matchVoiceToOption } from '../hooks/useAccessibility';

type FeedbackState = 'none' | 'correct' | 'wrong';

// ─── Ambient floating particles ───────────────────────────────────────────────
function FloatingParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => {
        const size = 3 + (i % 4) * 3;
        const left = 3 + (i * 7.1) % 93;
        const startY = 10 + (i * 6.7) % 75;
        const duration = 7 + (i % 5) * 2.2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: `${left}%`, top: `${startY}%`,
              background:
                i % 3 === 0 ? color + '55'
                : i % 3 === 1 ? 'rgba(212,175,55,0.35)'
                : 'rgba(255,255,255,0.1)',
              filter: 'blur(1px)',
            }}
            animate={{
              y: [-10, -50, -10],
              x: [0, (i % 2 === 0 ? 1 : -1) * 14, 0],
              opacity: [0.25, 0.65, 0.25],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── XP/coin burst on correct ─────────────────────────────────────────────────
function XPBurst({ color, difficulty }: { color: string; difficulty: string }) {
  const xp = difficulty === 'hard' ? '+150 XP' : difficulty === 'medium' ? '+100 XP' : '+50 XP';
  const items = [xp, '🪙', '⭐'];
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {items.map((label, i) => (
        <motion.div
          key={i}
          className="absolute font-black select-none"
          style={{
            left: `${43 + i * 9}%`,
            top: '48%',
            fontSize: i === 0 ? '1.1rem' : '1.5rem',
            color: i === 0 ? color : '#d4af37',
            textShadow: `0 0 12px ${color}90`,
          }}
          initial={{ y: 0, opacity: 1, scale: 0.6 }}
          animate={{ y: -130 - i * 18, opacity: 0, scale: 1.3 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: i * 0.12 }}
        >
          {label}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Confetti burst (enhanced) ────────────────────────────────────────────────
function ConfettiBurst({ color }: { color: string }) {
  const palette = [color, '#d4af37', '#22c55e', '#f59e0b', '#a78bfa', '#f472b6', '#60a5fa', '#fff'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: palette[i % palette.length],
    round: i % 5 === 0,
    wide: i % 7 === 0,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(({ id, color: c, round, wide }) => (
        <motion.div
          key={id}
          className={`absolute ${round ? 'rounded-full w-2 h-2' : wide ? 'rounded-sm w-3 h-1' : 'rounded-sm w-2 h-2'}`}
          style={{ left: `${38 + Math.random() * 24}%`, top: '38%', background: c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 700,
            y: Math.random() * -420 + 180,
            opacity: 0,
            rotate: Math.random() * 720 - 360,
            scale: Math.random() * 2 + 0.3,
          }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: Math.random() * 0.12 }}
        />
      ))}
    </div>
  );
}

// ─── Combo badge ──────────────────────────────────────────────────────────────
function ComboBadge({ count }: { count: number }) {
  if (count < 2) return null;
  return (
    <motion.div
      className="fixed top-24 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm"
      style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', boxShadow: '0 0 20px rgba(245,158,11,0.5)' }}
      initial={{ scale: 0, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      key={count}
    >
      🔥 {count}× Combo!
    </motion.div>
  );
}

// ─── Screen flash overlay ─────────────────────────────────────────────────────
function ScreenFlash({ type }: { type: 'correct' | 'wrong' }) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-30"
      style={{ background: type === 'correct' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GameplayPage() {
  const navigate = useNavigate();
  const { session, submitAnswer, endSession, profile, questionTimerSeconds, accessibilityMode } = useGameStore();
  const { speak, speakQueue, stopSpeaking, startListening, stopListening, isSpeaking, isListening, sttSupported } = useAccessibility(accessibilityMode);

  const questionTime = questionTimerSeconds;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [timeLeft, setTimeLeft] = useState(questionTime);
  const [showConsequence, setShowConsequence] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXPBurst, setShowXPBurst] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(0);
  const [readingComplete, setReadingComplete] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);
  const endedRef = useRef(false);
  const timerPausedRef = useRef(false);
  const selectedIndexRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

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
      if (timerPausedRef.current) return;
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          if (!answeredRef.current) handleTimeout();
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
    selectedIndexRef.current = null;
    submittedRef.current = false;
    startTimer();
    setSelectedIndex(null);
    setFeedback('none');
    setShowConsequence(false);
    setReadingComplete(false);
    return clearTimer;
  }, [session?.currentIndex, startTimer]);

  useEffect(() => {
    if (!session || session.completed || !accessibilityMode) {
      timerPausedRef.current = false;
      return;
    }
    timerPausedRef.current = true;
    setReadingComplete(false);
    stopSpeaking();
    const q = session.questions[session.currentIndex];
    const texts = [
      `Question ${session.currentIndex + 1}: ${q.text}`,
      `Option A: ${q.options[0]}`,
      `Option B: ${q.options[1]}`,
      `Option C: ${q.options[2]}`,
      `Option D: ${q.options[3]}`,
    ];
    const timer = setTimeout(() => {
      speakQueue(texts, () => {
        timerPausedRef.current = false;
        setReadingComplete(true);
      });
    }, 350);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
      timerPausedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentIndex, accessibilityMode]);

  if (!session || !profile) { navigate('/map'); return null; }
  if (session.completed) return null;

  const question = session.questions[session.currentIndex];
  const cat = CATEGORY_MAP[session.categoryId];
  const progress = (session.currentIndex / session.questions.length) * 100;
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  function commitAnswer(idx: number) {
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
    setScreenFlash('wrong');
    setCombo(0);
    sound.wrong();
    setTimeout(() => setScreenFlash(null), 500);
    setTimeout(() => commitAnswer(-1), 2000);
  }

  function handleAnswer(index: number) {
    if (feedback !== 'none' || answeredRef.current) return;
    answeredRef.current = true;
    clearTimer();
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    const correct = index === question.correctIndex;

    if (correct) {
      setFeedback('correct');
      setShowConfetti(true);
      setShowXPBurst(true);
      setScreenFlash('correct');
      setCombo((c) => c + 1);
      sound.correct();
      setTimeout(() => setShowConfetti(false), 1600);
      setTimeout(() => setShowXPBurst(false), 1700);
      setTimeout(() => setScreenFlash(null), 500);
      const captured = index;
      setTimeout(() => commitAnswer(captured), 1800);
    } else {
      setFeedback('wrong');
      setScreenFlash('wrong');
      setCombo(0);
      sound.wrong();
      setTimeout(() => setScreenFlash(null), 500);
      if (question.consequenceReplay && profile?.ageTrack !== 'kids') {
        setTimeout(() => setShowConsequence(true), 800);
      } else {
        const captured = index;
        setTimeout(() => commitAnswer(captured), 2000);
      }
    }
  }

  function advanceOrEnd() {
    commitAnswer(selectedIndexRef.current ?? -1);
  }

  function handleVoiceTap() {
    if (isListening) { stopListening(); return; }
    startListening((transcript) => {
      if (feedback !== 'none' || answeredRef.current) return;
      const idx = matchVoiceToOption(transcript, question.options);
      if (idx !== null) {
        handleAnswer(idx);
      } else {
        speak(`Sorry, I didn't catch that. Say A, B, C, or D.`);
      }
    });
  }

  const difficultyColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
  const diffColor = difficultyColors[question.difficulty];
  const isTimeLow = timeLeft <= 6;
  const isTimeWarning = timeLeft <= 11 && timeLeft > 6;

  const mascotMood =
    feedback === 'correct' ? 'celebrating' :
    feedback === 'wrong' ? 'sad' :
    timeLeft < 8 ? 'thinking' : 'idle';

  const mascotMsg =
    feedback === 'correct' ? 'Correct! Great job! 🎉' :
    feedback === 'wrong' ? 'Not quite — read the explanation below.' :
    combo >= 3 ? `${combo}× streak! Keep it up! 🔥` :
    timeLeft < 8 ? 'Think carefully! Time is running out!' :
    `Question ${session.currentIndex + 1} of ${session.questions.length}`;

  const letterColors = [
    { bg: 'rgba(99,102,241,0.25)', border: 'rgba(99,102,241,0.55)', text: '#a5b4fc' },
    { bg: 'rgba(236,72,153,0.22)', border: 'rgba(236,72,153,0.5)', text: '#f9a8d4' },
    { bg: 'rgba(245,158,11,0.22)', border: 'rgba(245,158,11,0.5)', text: '#fcd34d' },
    { bg: 'rgba(34,197,94,0.2)',   border: 'rgba(34,197,94,0.48)',  text: '#86efac' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(155deg, ${cat.colorDark}25 0%, #030712 45%, ${cat.colorDark}12 100%)` }}
    >
      {/* ── Ambient orb ── */}
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          top: -200, right: -200,
          background: `radial-gradient(circle, ${cat.color}18 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed rounded-full pointer-events-none"
        style={{
          width: 350, height: 350,
          bottom: 50, left: -100,
          background: `radial-gradient(circle, ${cat.color}10 0%, transparent 70%)`,
          filter: 'blur(70px)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <FloatingParticles color={cat.color} />

      <TopNav />

      {/* ── Overlays ── */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst color={cat.color} />}
        {showXPBurst && <XPBurst color={cat.color} difficulty={question.difficulty} />}
        {screenFlash && <ScreenFlash type={screenFlash} key={`flash-${session.currentIndex}`} />}
        {combo >= 2 && feedback === 'correct' && <ComboBadge count={combo} key={`combo-${combo}`} />}
      </AnimatePresence>

      <main className="relative flex-1 pt-20 pb-6 px-4 max-w-2xl mx-auto w-full flex flex-col">

        {/* Accessibility banner */}
        {accessibilityMode && (
          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
            <span className="text-base">{isSpeaking ? '🔊' : readingComplete ? '🎙️' : '⏳'}</span>
            <span>
              {isSpeaking ? 'Reading aloud…' : readingComplete ? 'Tap an option or use the mic to answer' : 'Preparing audio…'}
            </span>
          </div>
        )}

        {/* ── Progress bar + question dots ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.emoji} {cat.name}</span>
            </div>
            <span className="text-xs text-white/40 font-medium">{session.currentIndex + 1} / {session.questions.length}</span>
          </div>

          {/* Question dot indicators */}
          <div className="flex gap-1 mb-2 flex-wrap">
            {session.questions.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: i === session.currentIndex ? 16 : 6,
                  height: 6,
                  background:
                    i < session.currentIndex ? cat.color :
                    i === session.currentIndex ? cat.color :
                    'rgba(255,255,255,0.15)',
                  boxShadow: i === session.currentIndex ? `0 0 8px ${cat.color}80` : 'none',
                }}
                animate={i === session.currentIndex ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Fill bar */}
          <div className="relative h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${cat.colorDark}, ${cat.color})` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <motion.div className="absolute inset-y-0 w-8"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
              animate={{ x: ['-32px', '300px'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* ── Timer + difficulty ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}45` }}
            >
              {question.difficulty}
            </span>
            {combo >= 2 && feedback === 'none' && (
              <motion.span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)' }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🔥 {combo}× streak
              </motion.span>
            )}
          </div>

          {/* Circular timer */}
          <motion.div
            className="relative w-12 h-12"
            animate={isTimeLow ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <svg viewBox="0 0 40 40" className="w-12 h-12 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
              <motion.circle
                cx="20" cy="20" r="16"
                fill="none"
                strokeWidth="3.5"
                stroke={isTimeLow ? '#ef4444' : isTimeWarning ? '#f59e0b' : cat.color}
                strokeLinecap="round"
                strokeDasharray="100.5"
                strokeDashoffset={100.5 - (timeLeft / questionTime) * 100.5}
                style={{ filter: isTimeLow ? '0 0 8px rgba(239,68,68,0.8)' : `drop-shadow(0 0 4px ${cat.color}80)` }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <motion.span
              className={`absolute inset-0 flex items-center justify-center text-xs font-black ${isTimeLow ? 'text-red-400' : 'text-white/80'}`}
              animate={isTimeLow ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {timeLeft}
            </motion.span>
          </motion.div>
        </div>

        {/* ── Mascot ── */}
        <div className="flex justify-center mb-4">
          <Cowrie mood={mascotMood} message={mascotMsg} size={56} />
        </div>

        {/* ── Question card + answers ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.97 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Question bubble */}
            <motion.div
              className="p-5 mb-4 rounded-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${cat.colorDark}30, rgba(3,7,18,0.95))`,
                border: `1px solid ${cat.color}40`,
                boxShadow: `0 0 30px ${cat.color}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
              animate={{
                boxShadow: feedback === 'correct'
                  ? `0 0 40px rgba(34,197,94,0.35)`
                  : feedback === 'wrong'
                  ? `0 0 40px rgba(239,68,68,0.3)`
                  : `0 0 30px ${cat.color}15`,
              }}
            >
              {/* Shimmer on question card */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(105deg, transparent 40%, ${cat.color}10 50%, transparent 60%)` }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              />
              <p className="font-body text-lg text-white leading-relaxed relative">{question.text}</p>
            </motion.div>

            {/* Answer options */}
            <div className="space-y-2.5 mb-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedIndex === i;
                const isCorrect = i === question.correctIndex;
                const showResult = feedback !== 'none';
                const lc = letterColors[i];

                let bg = lc.bg;
                let border = lc.border;
                let textColor = 'rgba(255,255,255,0.85)';
                let glow = 'none';

                if (showResult) {
                  if (isCorrect) {
                    bg = 'rgba(34,197,94,0.18)';
                    border = '#22c55e';
                    textColor = '#fff';
                    glow = '0 0 20px rgba(34,197,94,0.4)';
                  } else if (isSelected) {
                    bg = 'rgba(239,68,68,0.18)';
                    border = '#ef4444';
                    textColor = '#fff';
                    glow = '0 0 20px rgba(239,68,68,0.35)';
                  } else {
                    bg = 'rgba(255,255,255,0.03)';
                    border = 'rgba(255,255,255,0.08)';
                    textColor = 'rgba(255,255,255,0.3)';
                  }
                }

                return (
                  <motion.button
                    key={i}
                    className="w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all relative overflow-hidden"
                    style={{ background: bg, border: `1px solid ${border}`, boxShadow: glow, color: textColor }}
                    onClick={() => handleAnswer(i)}
                    disabled={feedback !== 'none'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={
                      showResult && isSelected && !isCorrect
                        ? { x: [0, -8, 8, -5, 5, 0], opacity: 1 }
                        : { opacity: 1, x: 0 }
                    }
                    whileHover={feedback === 'none' ? {
                      scale: 1.02, y: -1,
                      boxShadow: `0 6px 24px ${lc.border}40`,
                      borderColor: lc.border,
                    } : {}}
                    whileTap={feedback === 'none' ? { scale: 0.98 } : {}}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                  >
                    {/* Ripple / shimmer on hover */}
                    {feedback === 'none' && (
                      <motion.div className="absolute inset-0 pointer-events-none rounded-xl opacity-0"
                        whileHover={{ opacity: 1 }}
                        style={{ background: `radial-gradient(ellipse at left, ${lc.bg}, transparent 70%)` }}
                      />
                    )}

                    {/* Letter badge */}
                    <span
                      className="relative z-10 w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                      style={{
                        background:
                          showResult && isCorrect ? '#22c55e' :
                          showResult && isSelected ? '#ef4444' :
                          showResult ? 'rgba(255,255,255,0.07)' :
                          lc.bg,
                        border: `1px solid ${showResult && isCorrect ? '#22c55e' : showResult && isSelected ? '#ef4444' : showResult ? 'rgba(255,255,255,0.1)' : lc.border}`,
                        color:
                          showResult && (isCorrect || isSelected) ? '#fff' :
                          showResult ? 'rgba(255,255,255,0.25)' :
                          lc.text,
                      }}
                    >
                      {showResult && isCorrect ? '✓' : showResult && isSelected ? '✗' : 'ABCD'[i]}
                    </span>

                    <span className="relative z-10 flex-1 text-sm leading-relaxed">{opt}</span>

                    {/* Correct glow pulse */}
                    {showResult && isCorrect && (
                      <motion.span className="relative z-10 text-naira-green text-lg"
                        animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.6 }}>
                        ✨
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Voice mic (accessibility) */}
            {accessibilityMode && feedback === 'none' && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <motion.button
                  onClick={handleVoiceTap}
                  disabled={isSpeaking && !isListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${
                    isListening
                      ? 'bg-red-500 border-2 border-red-300 shadow-red-500/40'
                      : readingComplete
                      ? 'bg-naira-green/80 border-2 border-naira-green shadow-naira-green/30 hover:bg-naira-green'
                      : 'bg-white/10 border-2 border-white/20 opacity-50'
                  }`}
                  animate={isListening ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  {isListening ? '⏹' : '🎙️'}
                </motion.button>
                <p className="text-xs text-white/40">
                  {isListening ? 'Listening… say A, B, C or D' : sttSupported ? 'Tap mic to answer with voice' : 'Voice input not supported on this browser'}
                </p>
              </div>
            )}

            {/* Replay audio after answering */}
            {accessibilityMode && feedback !== 'none' && (
              <button
                onClick={() => speak(`${feedback === 'correct' ? 'Correct!' : 'Not quite.'} ${question.explanation}`)}
                className="mb-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs hover:bg-blue-500/20 transition-colors"
              >
                🔊 Read explanation aloud
              </button>
            )}

            {/* Explanation */}
            <AnimatePresence>
              {feedback !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl text-sm leading-relaxed"
                    style={{
                      background: feedback === 'correct' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${feedback === 'correct' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: feedback === 'correct' ? '#86efac' : '#fca5a5',
                    }}
                  >
                    <strong>{feedback === 'correct' ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
                    {question.explanation}
                  </div>

                  {feedback === 'correct' && (
                    <motion.button
                      className="mt-3 w-full btn-primary"
                      onClick={() => { sound.click(); advanceOrEnd(); }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLastQuestion ? 'See Results 🏆' : 'Next Question →'}
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
          <ConsequenceReplay replay={question.consequenceReplay} onDismiss={advanceOrEnd} />
        )}
      </AnimatePresence>
    </div>
  );
}
