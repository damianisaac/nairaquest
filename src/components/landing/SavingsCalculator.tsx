import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Finance constants ────────────────────────────────────────────────────────

const INFLATION_RATE = 0.15; // fixed 15% pa, explained in caption

// ─── Slider config ────────────────────────────────────────────────────────────

const SLIDERS = {
  start:   { min: 0,   max: 500_000,   step: 5_000, default: 0     },
  monthly: { min: 0,   max: 1_000_000, step: 5_000, default: 5_000 },
  years:   { min: 1,   max: 40,        step: 1,     default: 20    },
  rate:    { min: 1,   max: 30,        step: 0.5,   default: 12    }, // % per year
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

/**
 * Future value with monthly compounding.
 * Contributions are added at the START of each month (annuity-due).
 * Matches the prototype formula exactly.
 */
function futureValue(
  P: number,       // starting principal
  monthly: number, // monthly contribution
  years: number,
  annualRate: number,
): number {
  const r = annualRate / 12;          // monthly rate
  const n = years * 12;               // total months
  if (n === 0) return P;
  const fvLump    = P * Math.pow(1 + r, n);
  const fvContrib = r === 0
    ? monthly * n
    : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r); // annuity-due
  return fvLump + fvContrib;
}

/** Track-fill background for a range input (gold left, sage right). */
function sliderBg(value: number, min: number, max: number) {
  const pct = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, #d4af37 ${pct}%, rgba(157,184,172,0.22) ${pct}%)`;
}

// ─── Design tokens (match QuickQuestion section) ──────────────────────────────

const PANEL = {
  background:  '#0d201c',               // slightly lighter than section bg
  border:      'rgba(157,184,172,0.18)',
  borderRadius: '18px',
};
const GOLD       = '#d4af37';           // our naira-gold
const CORAL      = '#e2543f';           // "pay-attention / honest truth" accent
const SAGE       = '#9db8ac';
const SAGE_DIM   = '#6c8a7e';
const INK_LIGHT  = '#F6F1E4';          // card text on dark panels
const MONO       = "'IBM Plex Mono', ui-monospace, monospace";

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
        <span className="text-sm font-semibold" style={{ color: INK_LIGHT }}>{label}</span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ fontFamily: MONO, color: GOLD }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        className="calc-slider"
        min={min}
        max={max}
        step={step}
        value={value}
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
  variant?: 'default' | 'highlight' | 'caution';
}

function StatCard({ label, value, explainer, variant = 'default' }: StatCardProps) {
  const highlight = variant === 'highlight';
  const caution   = variant === 'caution';

  const borderColor = highlight
    ? 'rgba(212,175,55,0.45)'
    : caution
    ? 'rgba(226,84,63,0.38)'
    : 'rgba(157,184,172,0.18)';

  const background = highlight
    ? 'linear-gradient(180deg, rgba(212,175,55,0.13) 0%, transparent 70%), #0d201c'
    : '#0d201c';

  const boxShadow = highlight
    ? '0 0 0 1px rgba(212,175,55,0.08), 0 20px 50px -24px rgba(212,175,55,0.3)'
    : 'none';

  const labelColor  = highlight ? '#B98F35'      : caution ? '#e88276' : SAGE_DIM;
  const valueColor  = highlight ? GOLD           : caution ? CORAL     : INK_LIGHT;
  const valueSizeMd = highlight ? '38px'         : caution ? '30px'    : '24px';

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{ background, border: `1px solid ${borderColor}`, boxShadow }}
    >
      <p
        className="text-xs font-bold tracking-widest mb-2.5"
        style={{ color: labelColor, letterSpacing: '0.06em' }}
      >
        {label}
      </p>
      <p
        className="font-semibold leading-none mb-2.5 tabular-nums"
        style={{
          fontFamily: MONO,
          fontSize:   `clamp(22px, ${highlight ? '4vw' : caution ? '3.4vw' : '3vw'}, ${valueSizeMd})`,
          color:      valueColor,
        }}
      >
        {value}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: SAGE_DIM }}>
        {explainer}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SavingsCalculator() {
  const navigate = useNavigate();

  const [startBalance, setStartBalance] = useState<number>(SLIDERS.start.default);
  const [monthly,      setMonthly]      = useState<number>(SLIDERS.monthly.default);
  const [years,        setYears]        = useState<number>(SLIDERS.years.default);
  const [annualReturnPct, setAnnualReturnPct] = useState<number>(SLIDERS.rate.default);

  // Detect reduced-motion once at mount
  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  // ── Derived calculations (synchronous — no debounce, instant feedback) ──

  const annualRate   = annualReturnPct / 100;
  const finalBalance = futureValue(startBalance, monthly, years, annualRate);
  const contributed  = startBalance + monthly * years * 12;
  const growth       = Math.max(finalBalance - contributed, 0);
  const realValue    = finalBalance / Math.pow(1 + INFLATION_RATE, years);

  // Year-by-year values for bar chart (one bar per year, max 40)
  const yearlyValues = Array.from({ length: years }, (_, i) =>
    futureValue(startBalance, monthly, i + 1, annualRate),
  );
  const chartMax = Math.max(...yearlyValues, 1);

  // ── Render ──

  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(212,175,55,0.07), transparent 60%), #030712',
      }}
    >
      {/* Subtle separator from the Quick Question section */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(157,184,172,0.15), transparent)' }}
      />

      {/* Ledger-line texture — same as QuickQuestion */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, rgba(157,184,172,0.04) 43px, rgba(157,184,172,0.04) 44px)',
        }}
      />

      <div className="relative max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          {/* Tag */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{
              borderColor: 'rgba(212,175,55,0.3)',
              background:  'rgba(212,175,55,0.07)',
              color:       GOLD,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
            Savings Calculator
          </div>

          <h2
            className="font-display font-black text-white mb-4"
            style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', lineHeight: 1.18, letterSpacing: '-0.01em' }}
          >
            What if you started saving today?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: SAGE }}>
            Move the sliders. Watch what starting early actually does to your final balance.
            This is the calculator we wish every young Nigerian saw at 18.
          </p>
        </div>

        {/* Two-column grid: controls left, results right */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}
        >

          {/* ── Controls column ── */}
          <div
            className="rounded-[18px] p-7 sm:p-8 text-left"
            style={{ ...PANEL }}
          >
            <SliderRow
              label="Starting balance"
              value={startBalance}
              displayValue={formatNaira(startBalance)}
              min={SLIDERS.start.min}
              max={SLIDERS.start.max}
              step={SLIDERS.start.step}
              onChange={setStartBalance}
            />
            <SliderRow
              label="Monthly contribution"
              value={monthly}
              displayValue={formatNaira(monthly)}
              min={SLIDERS.monthly.min}
              max={SLIDERS.monthly.max}
              step={SLIDERS.monthly.step}
              onChange={setMonthly}
            />
            <SliderRow
              label="Years invested"
              value={years}
              displayValue={`${years} ${years === 1 ? 'year' : 'years'}`}
              min={SLIDERS.years.min}
              max={SLIDERS.years.max}
              step={SLIDERS.years.step}
              onChange={setYears}
            />
            <SliderRow
              label="Annual return"
              value={annualReturnPct}
              displayValue={`${annualReturnPct % 1 === 0 ? annualReturnPct : annualReturnPct.toFixed(1)}% p.a.`}
              min={SLIDERS.rate.min}
              max={SLIDERS.rate.max}
              step={SLIDERS.rate.step}
              onChange={setAnnualReturnPct}
            />

            {/* Assumptions caption */}
            <div
              className="mt-7 pt-6 text-xs leading-relaxed italic"
              style={{
                color:     SAGE_DIM,
                borderTop: `1px solid ${PANEL.border}`,
              }}
            >
              Using your chosen <strong className="not-italic font-semibold" style={{ color: SAGE }}>{annualReturnPct % 1 === 0 ? annualReturnPct : annualReturnPct.toFixed(1)}% annual return</strong>, compounded monthly. A diversified Nigerian portfolio might average around 12–18% long-term, but it moves around a lot. Also assumes <strong className="not-italic font-semibold" style={{ color: CORAL }}>15% average annual inflation</strong>, a rough long-term estimate for Nigeria. This calculator teaches the idea of compounding — not a guarantee of your exact future.
            </div>
          </div>

          {/* ── Results column ── */}
          <div className="flex flex-col gap-4 text-left">

            <StatCard
              variant="highlight"
              label="FINAL BALANCE"
              value={formatNaira(finalBalance)}
              explainer={`What your account grows to at ${annualReturnPct % 1 === 0 ? annualReturnPct : annualReturnPct.toFixed(1)}% p.a., compounded monthly — your contributions plus everything they earned. Not yet adjusted for rising prices.`}
            />

            <StatCard
              label="TOTAL YOU PUT IN"
              value={formatNaira(contributed)}
              explainer="The actual cash that came out of your pocket over the years — your starting balance plus every monthly contribution added up, with no growth included."
            />

            <StatCard
              label="GROWTH EARNED (THE MAGIC)"
              value={formatNaira(growth)}
              explainer="Final Balance minus Total You Put In. This is the extra money compounding added on its own — money you didn't have to work for a second time."
            />

            <StatCard
              variant="caution"
              label="REAL VALUE, IN TODAY'S NAIRA"
              value={formatNaira(realValue)}
              explainer="Prices rise over time, so a naira in the future buys less than a naira today. This is what your Final Balance would actually be worth if you could spend it at today's prices — a more honest picture of your future purchasing power."
            />

            {/* Bar chart */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ ...PANEL, borderRadius: '16px' }}
            >
              {/* Bars */}
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
                      style={{
                        height:     `${heightPct}%`,
                        transition: reduceMotion ? 'none' : undefined,
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-center mt-3" style={{ color: SAGE_DIM }}>
                Year-by-year balance — watch the curve bend upward.
              </p>
            </div>

            {/* CTA */}
            <button
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-colors text-center"
              style={{ background: '#0d201c', border: `1px solid rgba(212,175,55,0.3)`, color: GOLD }}
              onClick={() => navigate('/category/savings')}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#162e27';
                (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#0d201c';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.3)';
              }}
            >
              Explore Savings &amp; Investing in NairaQuest →
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
