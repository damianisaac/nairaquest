import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

// Day 1 = ₦1, doubled every day: ₦1 × 2^(30-1) = 536,870,912
const FINAL_AMOUNT = 536_870_912;
const LUMP_SUM     = 10_000_000;
const DAYS         = 30;
const ANIM_MS      = 1800; // total count-up duration
const STEP_MS      = ANIM_MS / DAYS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

// ─── Component ────────────────────────────────────────────────────────────────

type Choice = 'lump' | 'double' | null;

export default function QuickQuestion() {
  const navigate = useNavigate();

  const [choice,       setChoice]      = useState<Choice>(null);
  const [displayAmt,   setDisplayAmt]  = useState(1);
  const [displayDay,   setDisplayDay]  = useState(1);
  const [countUpDone,  setCountUpDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect prefers-reduced-motion once on mount
  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function runCountUp() {
    if (reduceMotion) {
      setDisplayAmt(FINAL_AMOUNT);
      setDisplayDay(DAYS);
      setCountUpDone(true);
      return;
    }
    let day    = 1;
    let amount = 1;
    timerRef.current = setInterval(() => {
      setDisplayAmt(amount);
      setDisplayDay(day);
      if (day >= DAYS) {
        clearInterval(timerRef.current!);
        setDisplayAmt(FINAL_AMOUNT);
        setDisplayDay(DAYS);
        setCountUpDone(true);
        return;
      }
      day   += 1;
      amount = amount * 2;
    }, STEP_MS);
  }

  const handleChoice = (c: 'lump' | 'double') => {
    if (choice !== null) return;
    setChoice(c);
    // Start count-up slightly after the reveal card starts opening
    setTimeout(runCountUp, 380);
  };

  const verdictText = choice === 'lump'
    ? "Most people pick the ₦10 million. And that's wrong — here's why:"
    : "You picked the doubling naira. Let's see how far it actually goes:";

  const multiple = Math.round(FINAL_AMOUNT / LUMP_SUM); // 53×

  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(0,135,81,0.12), transparent 60%), #030712',
      }}
    >
      {/* Subtle ledger-line texture (mirrors the prototype) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, rgba(157,184,172,0.05) 43px, rgba(157,184,172,0.05) 44px)',
        }}
      />

      <div className="relative max-w-xl mx-auto text-center">

        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-7"
          style={{
            borderColor: 'rgba(212,175,55,0.35)',
            background:  'rgba(212,175,55,0.08)',
            color:       '#d4af37',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-naira-gold flex-shrink-0" />
          Quick Question
        </div>

        {/* Headline */}
        <h2
          className="font-display font-black leading-tight mb-4 text-white"
          style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', letterSpacing: '-0.01em' }}
        >
          Would you rather have ₦10,000,000 right now, or ₦1 doubled every day for 30 days?
        </h2>

        {/* Sub */}
        <p
          className="text-sm sm:text-base leading-relaxed mb-9"
          style={{ color: '#9db8ac' }}
        >
          Pick one. Most people get this wrong on purpose — that's the point.
        </p>

        {/* Choice buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-1"
        >
          {([
            { id: 'lump',   label: 'OPTION A', value: '₦10,000,000 today' },
            { id: 'double', label: 'OPTION B', value: '₦1, doubled daily × 30' },
          ] as const).map(({ id, label, value }) => {
            const isChosen  = choice === id;
            const isCorrect = id === 'double';
            const answered  = choice !== null;

            let borderColor = 'rgba(157,184,172,0.28)';
            let bg          = 'rgba(255,255,255,0.02)';
            let opacity     = 1;

            if (answered) {
              if (isChosen && !isCorrect) {
                borderColor = '#e2543f'; // coral — wrong choice
                bg          = 'rgba(226,84,63,0.08)';
              } else if (isCorrect) {
                borderColor = '#d4af37'; // gold — correct choice
                bg          = 'rgba(212,175,55,0.10)';
              } else {
                opacity = 0.42;
              }
            }

            return (
              <motion.button
                key={id}
                onClick={() => handleChoice(id)}
                disabled={answered}
                className="flex flex-col items-start px-5 py-4 rounded-2xl border-2 text-left w-full sm:min-w-[210px] sm:w-auto cursor-pointer disabled:cursor-default transition-colors"
                style={{ borderColor, background: bg, opacity }}
                whileHover={!answered ? { y: -2, borderColor: 'rgba(212,175,55,0.55)' } : {}}
                whileTap={!answered ? { scale: 0.97 } : {}}
                transition={{ duration: 0.15 }}
              >
                <span
                  className="block text-xs font-bold tracking-widest mb-1"
                  style={{ color: '#6c8a7e' }}
                >
                  {label}
                </span>
                <span
                  className="block font-semibold text-white"
                  style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '15px' }}
                >
                  {value}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Verdict */}
        <AnimatePresence>
          {choice !== null && (
            <motion.p
              className="text-sm font-semibold mt-5 mb-0"
              style={{ color: '#e2543f' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26 }}
            >
              {verdictText}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Reveal card */}
        <AnimatePresence>
          {choice !== null && (
            <motion.div
              className="mt-8 text-left rounded-2xl border overflow-hidden"
              style={{
                background:   '#F6F1E4',
                borderColor:  '#E4DBC5',
                boxShadow:    '0 24px 60px -20px rgba(0,0,0,0.55)',
                color:        '#14231F',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="p-7 sm:p-9">

                {/* Eyebrow row */}
                <div
                  className="flex items-center justify-between text-xs font-bold tracking-widest mb-3"
                  style={{ color: '#B98F35' }}
                >
                  <span>DAY 30 RESULT</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: '#6c8a7e' }}>
                    Day {displayDay} / {DAYS}
                  </span>
                </div>

                {/* Ticking amount */}
                <p
                  className="font-semibold leading-none mb-1"
                  style={{
                    fontFamily:         "'IBM Plex Mono', ui-monospace, monospace",
                    fontSize:           'clamp(30px, 6vw, 46px)',
                    color:              '#14231F',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing:      '-0.01em',
                  }}
                >
                  {formatNaira(displayAmt)}
                </p>

                {/* Multiple line — fades in once count-up finishes */}
                <AnimatePresence>
                  {countUpDone && (
                    <motion.p
                      className="text-sm font-bold mb-5"
                      style={{ color: '#e2543f' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      That's {multiple}× more than the ₦10,000,000
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Explainer */}
                <p
                  className="text-sm sm:text-[15px] leading-relaxed pt-5 mb-6"
                  style={{
                    color:      '#3A4B45',
                    borderTop:  '1px solid #E4DBC5',
                  }}
                >
                  One Naira, doubled every day for 30 days, becomes over{' '}
                  <strong style={{ color: '#14231F' }}>₦536 million</strong>. That's compound
                  interest, but extreme. In the real world, investing isn't this aggressive —
                  it's slower. But it's the same idea:{' '}
                  <strong style={{ color: '#14231F' }}>growth on top of growth</strong>.
                </p>

                {/* CTA — wired to /category/savings */}
                <button
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: '#14231F', color: '#F6F1E4' }}
                  onClick={() => navigate('/category/savings')}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#24352F'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#14231F'; }}
                >
                  See how compounding works in Savings &amp; Investing
                  <span aria-hidden>→</span>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
