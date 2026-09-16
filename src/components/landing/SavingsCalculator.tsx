import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Finance constants ────────────────────────────────────────────────────────

const INFLATION_RATE = 0.15;

// ─── Slider config ────────────────────────────────────────────────────────────

const SLIDERS = {
  start:   { min: 0,   max: 500_000,   step: 5_000, default: 0     },
  monthly: { min: 0,   max: 1_000_000, step: 5_000, default: 5_000 },
  years:   { min: 1,   max: 40,        step: 1,     default: 20    },
  rate:    { min: 1,   max: 30,        step: 0.5,   default: 12    },
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

function futureValue(P: number, monthly: number, years: number, annualRate: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (n === 0) return P;
  const fvLump    = P * Math.pow(1 + r, n);
  const fvContrib = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return fvLump + fvContrib;
}

function sliderBg(value: number, min: number, max: number) {
  const pct = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, #d4af37 ${pct}%, rgba(157,184,172,0.18) ${pct}%)`;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const GOLD     = '#d4af37';
const CORAL    = '#e2543f';
const SAGE_DIM = '#6c8a7e';
const INK      = '#F6F1E4';
const MONO     = "'IBM Plex Mono', ui-monospace, monospace";

// Floating decoration data
const FLOATERS = [
  { size: 70,  top: '10%', left: '3%',        color: '#d4af37', opacity: 0.12, dur: 6,   delay: 0   },
  { size: 45,  top: '65%', left: '4%',         color: '#00b86a', opacity: 0.10, dur: 7.5, delay: 1.4 },
  { size: 90,  top: '8%',  left: undefined, right: '4%',  color: '#d4af37', opacity: 0.11, dur: 5.5, delay: 0.6 },
  { size: 38,  top: '72%', left: undefined, right: '5%',  color: '#a78bfa', opacity: 0.09, dur: 8,   delay: 2.1 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, displayValue, min, max, step, onChange }: SliderRowProps) {
  return (
    <div className="mb-7 last:mb-0">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: INK }}>{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ fontFamily: MONO, color: GOLD }}>
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        className="calc-slider"
        min={min} max={max} step={step} value={value}
        style={{ background: sliderBg(value, min, max) }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  explainer: string;
  variant?: 'default' | 'highlight' | 'caution' | 'growth';
}

function StatCard({ label, value, explainer, variant = 'default' }: StatCardProps) {
  const configs = {
    highlight: {
      bg:          'linear-gradient(160deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 50%, rgba(11,20,48,0.8) 100%)',
      border:      'rgba(212,175,55,0.5)',
      shadow:      '0 0 0 1px rgba(212,175,55,0.1), 0 24px 60px -20px rgba(212,175,55,0.4)',
      labelColor:  '#B98F35',
      valueColor:  GOLD,
      valueFz:     'clamp(22px, 4vw, 38px)',
    },
    growth: {
      bg:          'linear-gradient(160deg, rgba(0,183,107,0.14) 0%, rgba(0,183,107,0.05) 50%, rgba(11,20,48,0.8) 100%)',
      border:      'rgba(0,183,107,0.4)',
      shadow:      '0 0 0 1px rgba(0,183,107,0.08), 0 20px 50px -20px rgba(0,183,107,0.3)',
      labelColor:  '#00b86a',
      valueColor:  '#00e887',
      valueFz:     'clamp(20px, 3.4vw, 30px)',
    },
    caution: {
      bg:          'linear-gradient(160deg, rgba(226,84,63,0.12) 0%, rgba(226,84,63,0.04) 50%, rgba(11,20,48,0.8) 100%)',
      border:      'rgba(226,84,63,0.38)',
      shadow:      'none',
      labelColor:  '#e88276',
      valueColor:  CORAL,
      valueFz:     'clamp(18px, 3vw, 28px)',
    },
    default: {
      bg:          'rgba(255,255,255,0.04)',
      border:      'rgba(157,184,172,0.18)',
      shadow:      'none',
      labelColor:  SAGE_DIM,
      valueColor:  INK,
      valueFz:     'clamp(18px, 3vw, 26px)',
    },
  };
  const c = configs[variant];

  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.shadow }}>
      <p className="text-xs font-bold tracking-widest mb-2.5" style={{ color: c.labelColor, letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p className="font-semibold leading-none mb-2.5 tabular-nums" style={{ fontFamily: MONO, fontSize: c.valueFz, color: c.valueColor }}>
        {value}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: SAGE_DIM }}>{explainer}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SavingsCalculator() {
  const navigate = useNavigate();

  const [startBalance,    setStartBalance]    = useState<number>(SLIDERS.start.default);
  const [monthly,         setMonthly]         = useState<number>(SLIDERS.monthly.default);
  const [years,           setYears]           = useState<number>(SLIDERS.years.default);
  const [annualReturnPct, setAnnualReturnPct] = useState<number>(SLIDERS.rate.default);

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  const annualRate   = annualReturnPct / 100;
  const finalBalance = futureValue(startBalance, monthly, years, annualRate);
  const contributed  = startBalance + monthly * years * 12;
  const growth       = Math.max(finalBalance - contributed, 0);
  const realValue    = finalBalance / Math.pow(1 + INFLATION_RATE, years);

  const yearlyValues = Array.from({ length: years }, (_, i) =>
    futureValue(startBalance, monthly, i + 1, annualRate),
  );
  const chartMax = Math.max(...yearlyValues, 1);

  const rateLabel = `${annualReturnPct % 1 === 0 ? annualReturnPct : annualReturnPct.toFixed(1)}% Per Annum`;

  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 1100px 650px at 50% -5%, rgba(212,175,55,0.2), rgba(100,70,0,0.05) 50%, transparent 70%), ' +
          'radial-gradient(ellipse 700px 500px at 85% 85%, rgba(0,135,81,0.1), transparent 60%), ' +
          '#040612',
      }}
    >
      {/* Separator */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)' }}
      />

      {/* Ledger-line texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, rgba(212,175,55,0.04) 43px, rgba(212,175,55,0.04) 44px)',
        }}
      />

      {/* Floating ₦ decorations */}
      {FLOATERS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute font-black select-none pointer-events-none"
          style={{ fontSize: p.size, top: p.top, left: p.left, right: p.right, color: p.color, opacity: p.opacity, zIndex: 0 }}
          animate={{ y: [0, -16, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        >
          ₦
        </motion.div>
      ))}

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-6"
            style={{
              borderColor: 'rgba(212,175,55,0.5)',
              background:  'rgba(212,175,55,0.1)',
              color:       '#f0d060',
              letterSpacing: '0.06em',
            }}
            animate={{ boxShadow: ['0 0 10px rgba(212,175,55,0.1)', '0 0 26px rgba(212,175,55,0.3)', '0 0 10px rgba(212,175,55,0.1)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f0d060' }} />
            Savings Calculator
          </motion.div>

          <h2
            className="font-display font-black text-white mb-4"
            style={{
              fontSize: 'clamp(26px, 4.2vw, 40px)', lineHeight: 1.18, letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fde68a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            What if you started saving today?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#b8a060' }}>
            Move the sliders. Watch what starting early actually does to your final balance.
            This is the calculator we wish every young Nigerian saw at 18.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>

          {/* Controls column */}
          <div
            className="rounded-[18px] p-7 sm:p-8 text-left"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(212,175,55,0.2)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <SliderRow
              label="Starting balance"
              value={startBalance}
              displayValue={formatNaira(startBalance)}
              min={SLIDERS.start.min} max={SLIDERS.start.max} step={SLIDERS.start.step}
              onChange={setStartBalance}
            />
            <SliderRow
              label="Monthly contribution"
              value={monthly}
              displayValue={formatNaira(monthly)}
              min={SLIDERS.monthly.min} max={SLIDERS.monthly.max} step={SLIDERS.monthly.step}
              onChange={setMonthly}
            />
            <SliderRow
              label="Years invested"
              value={years}
              displayValue={`${years} ${years === 1 ? 'year' : 'years'}`}
              min={SLIDERS.years.min} max={SLIDERS.years.max} step={SLIDERS.years.step}
              onChange={setYears}
            />
            <SliderRow
              label="Annual return"
              value={annualReturnPct}
              displayValue={rateLabel}
              min={SLIDERS.rate.min} max={SLIDERS.rate.max} step={SLIDERS.rate.step}
              onChange={setAnnualReturnPct}
            />

            <div className="mt-7 pt-6 text-xs leading-relaxed italic" style={{ color: SAGE_DIM, borderTop: '1px solid rgba(157,184,172,0.14)' }}>
              Using your chosen <strong className="not-italic font-semibold" style={{ color: '#9db8ac' }}>{rateLabel}</strong>, compounded monthly. A diversified Nigerian portfolio might average around 12–18% long-term, but it moves around a lot. Also assumes <strong className="not-italic font-semibold" style={{ color: CORAL }}>15% average annual inflation</strong>, a rough long-term estimate for Nigeria. This calculator teaches the idea of compounding — not a guarantee of your exact future.
            </div>
          </div>

          {/* Results column */}
          <div className="flex flex-col gap-4 text-left">

            <StatCard
              variant="highlight"
              label="FINAL BALANCE"
              value={formatNaira(finalBalance)}
              explainer={`What your account grows to at ${rateLabel}, compounded monthly — your contributions plus everything they earned. Not yet adjusted for rising prices.`}
            />
            <StatCard
              label="TOTAL YOU PUT IN"
              value={formatNaira(contributed)}
              explainer="The actual cash that came out of your pocket over the years — starting balance plus every monthly contribution, with no growth included."
            />
            <StatCard
              variant="growth"
              label="GROWTH EARNED (THE MAGIC)"
              value={formatNaira(growth)}
              explainer="Final Balance minus Total You Put In — the extra money compounding added on its own. Money you didn't have to work for a second time."
            />
            <StatCard
              variant="caution"
              label="REAL VALUE, IN TODAY'S NAIRA"
              value={formatNaira(realValue)}
              explainer="Adjusted for 15% annual inflation — what your Final Balance would actually buy at today's prices. A more honest picture of your future purchasing power."
            />

            {/* Bar chart */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '16px' }}
            >
              <div
                className="flex items-end gap-0.5"
                style={{ height: 100 }}
                role="img"
                aria-label={`Bar chart showing year-by-year balance growth over ${years} years`}
              >
                {yearlyValues.map((v, i) => {
                  const heightPct = Math.max((v / chartMax) * 100, 1.5);
                  return (
                    <div
                      key={i}
                      className="calc-bar"
                      style={{ height: `${heightPct}%`, transition: reduceMotion ? 'none' : undefined }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-center mt-3" style={{ color: SAGE_DIM }}>
                Year-by-year balance — watch the curve bend upward.
              </p>
            </div>

            {/* CTA */}
            <motion.button
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-center"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', color: GOLD }}
              onClick={() => navigate('/category/savings')}
              whileHover={{ background: 'rgba(212,175,55,0.22)', borderColor: GOLD, scale: 1.01, boxShadow: '0 0 24px rgba(212,175,55,0.2)' }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Savings &amp; Investing in NairaQuest →
            </motion.button>

          </div>
        </div>
      </div>
    </section>
  );
}
