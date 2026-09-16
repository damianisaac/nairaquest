import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Finance constants ────────────────────────────────────────────────────────

const INFLATION_RATE = 0.15;

const SLIDERS = {
  start:   { min: 0,   max: 500_000,   step: 5_000, default: 0     },
  monthly: { min: 0,   max: 1_000_000, step: 5_000, default: 5_000 },
  years:   { min: 1,   max: 40,        step: 1,     default: 20    },
  rate:    { min: 1,   max: 30,        step: 0.5,   default: 12    },
} as const;

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
  return `linear-gradient(to right, #b8941f ${pct}%, #e2e8e4 ${pct}%)`;
}

// ─── Floating ₦ watermarks ────────────────────────────────────────────────────

const FLOATERS = [
  { size: 110, top: '6%',  left: '1%',        dur: 6.5, delay: 0   },
  { size: 65,  top: '65%', left: '3%',         dur: 8,   delay: 1.5 },
  { size: 130, top: '5%',  left: undefined, right: '1%', dur: 7,   delay: 0.7 },
  { size: 50,  top: '70%', left: undefined, right: '2%', dur: 5.5, delay: 2.1 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string; value: number; displayValue: string;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, displayValue, min, max, step, onChange }: SliderRowProps) {
  return (
    <div className="mb-7 last:mb-0">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: '#1a2e1a' }}>{label}</span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: '#8a6a00' }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range" className="calc-slider"
        min={min} max={max} step={step} value={value}
        style={{ background: sliderBg(value, min, max) }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}

interface StatCardProps {
  label: string; value: string; explainer: string;
  variant?: 'default' | 'highlight' | 'caution' | 'growth';
}

function StatCard({ label, value, explainer, variant = 'default' }: StatCardProps) {
  const configs = {
    highlight: {
      bg:         '#ffffff',
      border:     'rgba(180,148,31,0.4)',
      topBar:     'linear-gradient(to right, #d4af37, #f0d060)',
      shadow:     '0 4px 24px rgba(180,148,31,0.15)',
      labelColor: '#8a6a00',
      valueColor: '#7a5a00',
      valueFz:    'clamp(22px, 4vw, 36px)',
    },
    growth: {
      bg:         '#ffffff',
      border:     'rgba(0,135,81,0.3)',
      topBar:     'linear-gradient(to right, #008751, #00b86a)',
      shadow:     '0 4px 24px rgba(0,135,81,0.12)',
      labelColor: '#005c38',
      valueColor: '#004a2e',
      valueFz:    'clamp(20px, 3.4vw, 30px)',
    },
    caution: {
      bg:         '#ffffff',
      border:     'rgba(192,64,48,0.3)',
      topBar:     'linear-gradient(to right, #e2543f, #f07060)',
      shadow:     '0 4px 20px rgba(192,64,48,0.1)',
      labelColor: '#a03020',
      valueColor: '#c04030',
      valueFz:    'clamp(18px, 3vw, 28px)',
    },
    default: {
      bg:         '#ffffff',
      border:     'rgba(0,0,0,0.08)',
      topBar:     'rgba(200,210,205,0.6)',
      shadow:     '0 2px 12px rgba(0,0,0,0.06)',
      labelColor: '#5a7a6a',
      valueColor: '#1a2e1a',
      valueFz:    'clamp(18px, 3vw, 26px)',
    },
  };
  const c = configs[variant];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.shadow }}
    >
      {/* Colored top accent bar */}
      <div style={{ height: 4, background: c.topBar }} />
      <div className="p-5 sm:p-6">
        <p className="text-xs font-bold tracking-widest mb-2.5" style={{ color: c.labelColor, letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p
          className="font-semibold leading-none mb-2.5 tabular-nums"
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: c.valueFz, color: c.valueColor }}
        >
          {value}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#7a9a8a' }}>{explainer}</p>
      </div>
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
      style={{ background: '#EEF7F2' }}
    >
      {/* Section separator */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(0,135,81,0.2), transparent)' }}
      />

      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,100,50,0.07) 1px, transparent 1px)',
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

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-6"
            style={{
              borderColor: 'rgba(140,110,0,0.35)',
              background:  'rgba(140,110,0,0.08)',
              color:       '#7a5a00',
              letterSpacing: '0.06em',
            }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#b8941f' }} />
            Savings Calculator
          </div>

          <h2
            className="font-display font-black mb-4"
            style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', lineHeight: 1.18, letterSpacing: '-0.01em', color: '#0c1f14' }}
          >
            What if you started saving today?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#3d5a48' }}>
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
              background: '#ffffff',
              border:     '1px solid rgba(0,135,81,0.15)',
              boxShadow:  '0 4px 32px rgba(0,0,0,0.07)',
            }}
          >
            <SliderRow
              label="Starting balance" value={startBalance} displayValue={formatNaira(startBalance)}
              min={SLIDERS.start.min} max={SLIDERS.start.max} step={SLIDERS.start.step}
              onChange={setStartBalance}
            />
            <SliderRow
              label="Monthly contribution" value={monthly} displayValue={formatNaira(monthly)}
              min={SLIDERS.monthly.min} max={SLIDERS.monthly.max} step={SLIDERS.monthly.step}
              onChange={setMonthly}
            />
            <SliderRow
              label="Years invested"
              value={years} displayValue={`${years} ${years === 1 ? 'year' : 'years'}`}
              min={SLIDERS.years.min} max={SLIDERS.years.max} step={SLIDERS.years.step}
              onChange={setYears}
            />
            <SliderRow
              label="Annual return" value={annualReturnPct} displayValue={rateLabel}
              min={SLIDERS.rate.min} max={SLIDERS.rate.max} step={SLIDERS.rate.step}
              onChange={setAnnualReturnPct}
            />

            <div
              className="mt-7 pt-6 text-xs leading-relaxed italic"
              style={{ color: '#7a9a8a', borderTop: '1px solid rgba(0,135,81,0.12)' }}
            >
              Using your chosen{' '}
              <strong className="not-italic font-semibold" style={{ color: '#4a6a55' }}>{rateLabel}</strong>,
              compounded monthly. A diversified Nigerian portfolio might average around 12–18% long-term,
              but it moves around a lot. Also assumes{' '}
              <strong className="not-italic font-semibold" style={{ color: '#a03020' }}>15% average annual inflation</strong>,
              a rough long-term estimate for Nigeria. This calculator teaches the idea of compounding — not a guarantee.
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
              explainer="The actual cash that came out of your pocket — starting balance plus every monthly contribution, with no growth included."
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
              className="rounded-2xl overflow-hidden"
              style={{ background: '#ffffff', border: '1px solid rgba(0,135,81,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ height: 4, background: 'linear-gradient(to right, #008751, #d4af37)' }} />
              <div className="p-5 sm:p-6">
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
                <p className="text-xs text-center mt-3" style={{ color: '#7a9a8a' }}>
                  Year-by-year balance — watch the curve bend upward.
                </p>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-center"
              style={{ background: '#008751', color: '#ffffff', border: 'none' }}
              onClick={() => navigate('/category/savings')}
              whileHover={{ background: '#005c38', scale: 1.01, boxShadow: '0 8px 28px rgba(0,135,81,0.3)' }}
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
