import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchDuel, submitDuelScore } from '../lib/supabase-social';
import { buildDuelQuestions } from '../utils/social';
import { CATEGORY_MAP } from '../data/categories';
import { sound } from '../components/ui/SoundController';
import type { Duel, Question } from '../types';

const TIMER_SECONDS = 30;

export default function DuelPlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useGameStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [duel, setDuel] = useState<Duel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);
  const alreadyPlayed = useRef(false);

  const isCloud = isSupabaseConfigured && !!user;

  useEffect(() => {
    if (!isCloud || !id) { setLoading(false); return; }
    fetchDuel(id).then(({ duel: d, error: e }) => {
      if (e || !d) { setError(e ?? 'Duel not found'); setLoading(false); return; }

      // Check if current user is a participant
      if (d.initiatorId !== user!.id && d.opponentId !== user!.id) {
        setError('You are not part of this duel.'); setLoading(false); return;
      }

      // Check if current user already played
      const isInitiator = d.initiatorId === user!.id;
      const myScore = isInitiator ? d.initiatorScore : d.opponentScore;
      if (myScore !== null) {
        alreadyPlayed.current = true;
        navigate(`/duel/${d.id}/results`);
        return;
      }

      const qs = buildDuelQuestions(d.questionIds);
      if (qs.length === 0) { setError('Could not load duel questions.'); setLoading(false); return; }
      setDuel(d);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setLoading(false);
    });
  }, [isCloud, id, user]);

  // Timer per question
  useEffect(() => {
    if (!duel || showFeedback || submitting) return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [currentIndex, duel]);

  const handleTimeUp = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    commitAnswer(-1); // timed out = wrong
  };

  const handleSelect = (idx: number) => {
    if (showFeedback || submittedRef.current) return;
    clearInterval(timerRef.current!);
    submittedRef.current = true;
    setSelectedIdx(idx);
    setShowFeedback(true);
    const correct = questions[currentIndex].correctIndex === idx;
    if (correct) sound.correct();
    else sound.wrong();

    const newAnswers = [...answers];
    newAnswers[currentIndex] = idx;
    setAnswers(newAnswers);

    setTimeout(() => commitAnswer(idx, newAnswers), 1800);
  };

  const commitAnswer = (idx: number, answersSnapshot?: (number | null)[]) => {
    const snap = answersSnapshot ?? answers;
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      // Session complete — submit score
      const finalAnswers = [...snap];
      finalAnswers[currentIndex] = idx;
      const score = finalAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      submitScore(score);
    } else {
      setCurrentIndex(nextIdx);
      setSelectedIdx(null);
      setShowFeedback(false);
      submittedRef.current = false;
    }
  };

  const submitScore = async (score: number) => {
    if (!duel || !user) return;
    setSubmitting(true);
    sound.levelUp();
    await submitDuelScore(duel.id, user.id, score);
    navigate(`/duel/${duel.id}/results`);
  };

  if (!isCloud) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-white/50 mb-4">Sign in to play duels.</p>
        <button className="btn-primary" onClick={() => navigate('/auth')}>Sign In</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
    </div>
  );

  if (error || !duel || questions.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-center">
      <div>
        <p className="text-white/50 mb-4">{error ?? 'Could not load duel.'}</p>
        <button className="btn-primary" onClick={() => navigate('/family')}>Back to Family</button>
      </div>
    </div>
  );

  const cat = CATEGORY_MAP[duel.categoryId];
  const q = questions[currentIndex];
  const totalQuestions = questions.length;
  const isInitiator = duel.initiatorId === user!.id;
  const opponentName = isInitiator ? duel.opponentName : duel.initiatorName;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" style={{ background: `linear-gradient(135deg, ${cat?.colorDark ?? '#0a1628'}30 0%, #030712 50%)` }}>

      {/* Header */}
      <div className="pt-6 pb-4 px-4 border-b border-white/10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide">Duel vs {opponentName}</p>
              <p className="text-sm font-display text-white">{cat?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">{currentIndex + 1} / {totalQuestions}</span>
            {/* Timer ring */}
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke={timeLeft <= 10 ? '#ef4444' : '#22c55e'}
                  strokeWidth="3"
                  strokeDasharray="100.5"
                  strokeDashoffset={100.5 - (timeLeft / TIMER_SECONDS) * 100.5}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-naira-green"
            animate={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Question */}
            <div className="card-glass p-5">
              <p className="text-lg text-white leading-snug">{q.text}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrect = showFeedback && idx === q.correctIndex;
                const isWrong = showFeedback && isSelected && idx !== q.correctIndex;

                return (
                  <motion.button
                    key={idx}
                    className="w-full text-left px-5 py-4 rounded-2xl border transition-all text-sm"
                    style={{
                      borderColor: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : isSelected ? '#d4af37' : 'rgba(255,255,255,0.1)',
                      background: isCorrect ? '#22c55e15' : isWrong ? '#ef444415' : isSelected ? '#d4af3715' : 'rgba(255,255,255,0.04)',
                      color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : 'rgba(255,255,255,0.85)',
                    }}
                    whileHover={!showFeedback ? { scale: 1.01 } : {}}
                    whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(idx)}
                    disabled={showFeedback}
                  >
                    <span className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showFeedback && q.explanation && (
                <motion.div
                  className="card-glass p-4 border-l-2 border-naira-green"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-xs text-white/70 leading-relaxed">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Submitting overlay */}
      <AnimatePresence>
        {submitting && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center">
              <span className="w-10 h-10 border-2 border-white/20 border-t-naira-green rounded-full animate-spin block mx-auto mb-3" />
              <p className="text-white/60 text-sm">Submitting your score…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
