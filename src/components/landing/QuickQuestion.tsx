import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const FINAL_AMOUNT = 536_870_912;
const LUMP_SUM     = 10_000_000;
const DAYS         = 30;
const ANIM_MS      = 1800;
const STEP_MS      = ANIM_MS / DAYS;

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

// ─── Floating ₦ watermarks (dark on light) ───────────────────────────────────

const FLOATERS = [
  { size: 120, top: '5%',  left: '1%',        dur: 6,   delay: 0   },
  { size: 70,  top: '62%', left: '3%',         dur: 8,   delay: 1.4 },
  { size: 140, top: '8%',  left: undefined, right: '1%', dur: 7,   delay: 0.8 },
  { size: 55,  top: '68%', left: undefined, right: '3%', dur: 5.5, delay: 2   },
];

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
      style={{ background: '#F8F5EE' }}
    >
      {/* Soft bridge shadow from the dark hero above */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(3,7,18,0.18) 0%, transparent 100%)' }}
      />

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,100,50,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating ₦ watermarks */}
      {FLOATERS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute font-black select-none pointer-events-none"
          style={{ fontSize: p.size, top: p.top, left: p.left, right: p.right, color: 'rgba(0,100,50,0.06)', zIndex: 0 }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        >
          ₦
        </motion.div>
      ))}

      <div className="relative z-10 max-w-xl mx-auto text-center">

        {/* Eyebrow tag */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-7"
          style={{
            borderColor: 'rgba(0,135,81,0.35)',
            background:  'rgba(0,135,81,0.08)',
            color:       '#005c38',
            letterSpacing: '0.06em',
          }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#008751' }} />
          Quick Question
        </div>

        {/* Headline */}
        <h2
          className="font-display font-black leading-tight mb-4"
          style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', letterSpacing: '-0.01em', color: '#0d1f0e' }}
        >
          Would you rather have ₦10,000,000 right now, or ₦1 doubled every day for 30 days?
        </h2>

        {/* Sub */}
        <p className="text-sm sm:text-base leading-relaxed mb-9" style={{ color: '#4a6a55' }}>
          Pick one. Most people get this wrong on purpose — that's the point.
        </p>

        {/* Choice buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-1">
          {([
            {
              id: 'lump'   as const,
              label: 'OPTION A',
              value: '₦10,000,000 today',
              defaultBorder: 'rgba(180,100,0,0.35)',
              defaultBg:     '#fffcf4',
              labelColor:    '#92600a',
            },
            {
              id: 'double' as const,
              label: 'OPTION B',
              value: '₦1, doubled daily × 30',
              defaultBorder: 'rgba(0,135,81,0.4)',
              defaultBg:     '#f0fbf5',
              labelColor:    '#005c38',
            },
          ]).map(({ id, label, value, defaultBorder, defaultBg, labelColor }) => {
            const isChosen  = choice === id;
            const isCorrect = id === 'double';
            const answered  = choice !== null;

            let borderColor = defaultBorder;
            let bg          = defaultBg;
            let opacity     = 1;

            if (answered) {
              if (isChosen && !isCorrect) { borderColor = '#e2543f'; bg = '#fff5f3'; }
              else if (isCorrect)          { borderColor = '#b8941f'; bg = '#fffbee'; }
              else                         { opacity = 0.4; }
            }

            return (
              <motion.button
                key={id}
                onClick={() => handleChoice(id)}
                disabled={answered}
                className="flex flex-col items-start px-5 py-4 rounded-2xl border-2 text-left w-full sm:min-w-[210px] sm:w-auto cursor-pointer disabled:cursor-default"
                style={{ borderColor, background: bg, opacity }}
                whileHover={!answered ? { y: -3, scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } : {}}
                whileTap={!answered ? { scale: 0.97 } : {}}
                transition={{ duration: 0.15 }}
              >
                <span className="block text-xs font-bold tracking-widest mb-1" style={{ color: labelColor, letterSpacing: '0.07em' }}>
                  {label}
                </span>
                <span
                  className="block font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '15px', color: '#1a2e1a' }}
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
              style={{ color: '#c04030' }}
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
                background:  '#ffffff',
                borderColor: '#e2d9c5',
                boxShadow:   '0 20px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,135,81,0.1)',
                color:       '#14231F',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="p-7 sm:p-9">
                <div className="flex items-center justify-between text-xs font-bold tracking-widest mb-3" style={{ color: '#9a7a2a' }}>
                  <span>DAY 30 RESULT</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: '#7a9a8a' }}>
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
                      style={{ color: '#c04030' }}
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
                  style={{ color: '#3A4B45', borderTop: '1px solid #e2d9c5' }}
                >
                  One Naira, doubled every day for 30 days, becomes over{' '}
                  <strong style={{ color: '#14231F' }}>₦536 million</strong>. That's compound
                  interest, but extreme. In the real world, investing isn't this aggressive —
                  it's slower. But it's the same idea:{' '}
                  <strong style={{ color: '#14231F' }}>growth on top of growth</strong>.
                </p>

                <button
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: '#008751', color: '#ffffff' }}
                  onClick={() => navigate('/category/savings')}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#005c38'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#008751'; }}
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
