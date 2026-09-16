import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const FINAL_AMOUNT = 536_870_912;
const LUMP_SUM     = 10_000_000;
const DAYS         = 30;
const ANIM_MS      = 1800;
const STEP_MS      = ANIM_MS / DAYS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

// ─── Floating decoration data ─────────────────────────────────────────────────

const FLOATERS = [
  { size: 90,  top: '8%',  left: '3%',        color: '#00b86a', opacity: 0.13, dur: 5.5, delay: 0   },
  { size: 55,  top: '60%', left: '5%',         color: '#d4af37', opacity: 0.11, dur: 7,   delay: 1.3 },
  { size: 110, top: '12%', left: undefined, right: '3%',  color: '#00b86a', opacity: 0.11, dur: 6.5, delay: 0.7 },
  { size: 40,  top: '70%', left: undefined, right: '6%',  color: '#d4af37', opacity: 0.10, dur: 5,   delay: 2   },
  { size: 28,  top: '38%', left: '48%',        color: '#ffffff', opacity: 0.04, dur: 9,   delay: 1.8 },
];

// ─── Component ────────────────────────────────────────────────────────────────

type Choice = 'lump' | 'double' | null;

export default function QuickQuestion() {
  const navigate = useNavigate();

  const [choice,      setChoice]      = useState<Choice>(null);
  const [displayAmt,  setDisplayAmt]  = useState(1);
  const [displayDay,  setDisplayDay]  = useState(1);
  const [countUpDone, setCountUpDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function runCountUp() {
    if (reduceMotion) {
      setDisplayAmt(FINAL_AMOUNT); setDisplayDay(DAYS); setCountUpDone(true); return;
    }
    let day = 1, amount = 1;
    timerRef.current = setInterval(() => {
      setDisplayAmt(amount); setDisplayDay(day);
      if (day >= DAYS) {
        clearInterval(timerRef.current!);
        setDisplayAmt(FINAL_AMOUNT); setDisplayDay(DAYS); setCountUpDone(true); return;
      }
      day += 1; amount = amount * 2;
    }, STEP_MS);
  }

  const handleChoice = (c: 'lump' | 'double') => {
    if (choice !== null) return;
    setChoice(c);
    setTimeout(runCountUp, 380);
  };

  const verdictText = choice === 'lump'
    ? "Most people pick the ₦10 million. And that's wrong — here's why:"
    : "You picked the doubling naira. Let's see how far it actually goes:";

  const multiple = Math.round(FINAL_AMOUNT / LUMP_SUM);

  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 1100px 700px at 50% -5%, rgba(0,200,100,0.22), rgba(0,135,81,0.06) 50%, transparent 70%), ' +
          'radial-gradient(ellipse 600px 400px at 10% 80%, rgba(212,175,55,0.09), transparent 60%), ' +
          '#020c05',
      }}
    >
      {/* Ledger-line texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, rgba(0,183,107,0.05) 43px, rgba(0,183,107,0.05) 44px)',
        }}
      />

      {/* Floating ₦ decorations */}
      {FLOATERS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute font-black select-none pointer-events-none"
          style={{ fontSize: p.size, top: p.top, left: p.left, right: p.right, color: p.color, opacity: p.opacity, zIndex: 0 }}
          animate={{ y: [0, -18, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        >
          ₦
        </motion.div>
      ))}

      <div className="relative z-10 max-w-xl mx-auto text-center">

        {/* Tag */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-7"
          style={{
            borderColor: 'rgba(0,183,107,0.5)',
            background:  'rgba(0,183,107,0.12)',
            color:       '#00e887',
            letterSpacing: '0.06em',
            boxShadow:   '0 0 16px rgba(0,183,107,0.15)',
          }}
          animate={{ boxShadow: ['0 0 12px rgba(0,183,107,0.1)', '0 0 28px rgba(0,183,107,0.3)', '0 0 12px rgba(0,183,107,0.1)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00e887' }} />
          Quick Question
        </motion.div>

        {/* Headline */}
        <h2
          className="font-display font-black leading-tight mb-4"
          style={{
            fontSize: 'clamp(26px, 4.2vw, 40px)',
            letterSpacing: '-0.01em',
            background: 'linear-gradient(135deg, #ffffff 0%, #c8f5e0 60%, #a8edc8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Would you rather have ₦10,000,000 right now, or ₦1 doubled every day for 30 days?
        </h2>

        {/* Sub */}
        <p className="text-sm sm:text-base leading-relaxed mb-9" style={{ color: '#7ecfa8' }}>
          Pick one. Most people get this wrong on purpose — that's the point.
        </p>

        {/* Choice buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-1">
          {([
            {
              id: 'lump'  as const,
              label: 'OPTION A',
              value: '₦10,000,000 today',
              defaultBorder: 'rgba(251,191,36,0.45)',
              defaultBg: 'rgba(251,191,36,0.07)',
              defaultColor: '#fbbf24',
            },
            {
              id: 'double' as const,
              label: 'OPTION B',
              value: '₦1, doubled daily × 30',
              defaultBorder: 'rgba(0,183,107,0.5)',
              defaultBg: 'rgba(0,183,107,0.09)',
              defaultColor: '#00b86a',
            },
          ]).map(({ id, label, value, defaultBorder, defaultBg, defaultColor }) => {
            const isChosen  = choice === id;
            const isCorrect = id === 'double';
            const answered  = choice !== null;

            let borderColor = defaultBorder;
            let bg          = defaultBg;
            let opacity     = 1;

            if (answered) {
              if (isChosen && !isCorrect) { borderColor = '#e2543f'; bg = 'rgba(226,84,63,0.12)'; }
              else if (isCorrect)          { borderColor = '#d4af37'; bg = 'rgba(212,175,55,0.15)'; }
              else                         { opacity = 0.38; }
            }

            return (
              <motion.button
                key={id}
                onClick={() => handleChoice(id)}
                disabled={answered}
                className="flex flex-col items-start px-5 py-4 rounded-2xl border-2 text-left w-full sm:min-w-[210px] sm:w-auto cursor-pointer disabled:cursor-default"
                style={{ borderColor, background: bg, opacity }}
                whileHover={!answered ? { y: -3, scale: 1.02, borderColor: '#00e887', boxShadow: '0 8px 30px rgba(0,183,107,0.25)' } : {}}
                whileTap={!answered ? { scale: 0.97 } : {}}
                transition={{ duration: 0.15 }}
              >
                <span className="block text-xs font-bold tracking-widest mb-1" style={{ color: defaultColor }}>
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
                boxShadow:    '0 32px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,183,107,0.2)',
                color:        '#14231F',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="p-7 sm:p-9">
                <div className="flex items-center justify-between text-xs font-bold tracking-widest mb-3" style={{ color: '#B98F35' }}>
                  <span>DAY 30 RESULT</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: '#6c8a7e' }}>
                    Day {displayDay} / {DAYS}
                  </span>
                </div>

                <p
                  className="font-semibold leading-none mb-1"
                  style={{
                    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                    fontSize: 'clamp(30px, 6vw, 46px)',
                    color: '#14231F',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatNaira(displayAmt)}
                </p>

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

                <p
                  className="text-sm sm:text-[15px] leading-relaxed pt-5 mb-6"
                  style={{ color: '#3A4B45', borderTop: '1px solid #E4DBC5' }}
                >
                  One Naira, doubled every day for 30 days, becomes over{' '}
                  <strong style={{ color: '#14231F' }}>₦536 million</strong>. That's compound
                  interest, but extreme. In the real world, investing isn't this aggressive —
                  it's slower. But it's the same idea:{' '}
                  <strong style={{ color: '#14231F' }}>growth on top of growth</strong>.
                </p>

                <button
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: '#14231F', color: '#F6F1E4' }}
                  onClick={() => navigate('/category/savings')}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1f3a2e'; }}
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
