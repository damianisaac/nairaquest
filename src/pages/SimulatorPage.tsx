import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';

// ── Types ──────────────────────────────────────────────────────────────────────

type SimTrack = 'adults' | 'teens';
type Step = 1 | 2 | 3;

interface PersonaValues {
  savings: number; invest: number; property: number; vehicle: number;
  business: number; digital: number; valuables: number;
  loans: number; credit: number; informal: number;
}

interface Persona {
  id: string; emoji: string; name: string; blurb: string; start: string;
  values: PersonaValues;
}

interface EventFlags { jobloss: boolean; hustle: boolean; debt: boolean }

interface LifeEvent { id: keyof EventFlags; emoji: string; title: string; desc: string }

// ── Non-linear slider scales ───────────────────────────────────────────────────

const SCALE_SAVINGS: number[] = (() => {
  const s = [0];
  [5e3,1e4,2e4,3e4,4e4,5e4,6e4,7e4,8e4,9e4,1e5].forEach(v => s.push(v));
  [15e4,2e5,25e4,3e5,35e4,4e5,45e4,5e5].forEach(v => s.push(v));
  for (let v = 1e6; v <= 1e7; v += 5e5) s.push(v);
  for (let v = 2e7; v <= 1e8; v += 1e7) s.push(v);
  return s;
})();

const SCALE_INVEST: number[] = (() => {
  const s = [0];
  for (let v = 1e5; v <= 1e6; v += 1e5) s.push(v);
  for (let v = 2e6; v <= 1e7; v += 1e6) s.push(v);
  for (let v = 2e7; v <= 1e8; v += 1e7) s.push(v);
  for (let v = 2e8; v <= 1e9; v += 1e8) s.push(v);
  return s;
})();

type ScaledField = 'savings' | 'digital' | 'valuables' | 'invest' | 'business';
const SCALES: Record<ScaledField, number[]> = {
  savings: SCALE_SAVINGS, digital: SCALE_SAVINGS, valuables: SCALE_SAVINGS,
  invest: SCALE_INVEST, business: SCALE_INVEST,
};
const SCALED_FIELDS = new Set<string>(Object.keys(SCALES));

const LINEAR_CFG: Record<string, { max: number; step: number }> = {
  property: { max: 500_000_000, step: 2_000_000 },
  vehicle:  { max: 100_000_000, step: 500_000 },
  loans:    { max: 200_000_000, step: 1_000_000 },
  credit:   { max: 5_000_000,   step: 50_000 },
  informal: { max: 20_000_000,  step: 100_000 },
};

function nearestIdx(scale: number[], value: number): number {
  return scale.reduce((best, v, i) =>
    Math.abs(v - value) < Math.abs(scale[best] - value) ? i : best, 0);
}

// ── Formatting ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  const abs = Math.abs(n);
  let s: string;
  if (abs >= 1e9)      s = (abs / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  else if (abs >= 1e6) s = (abs / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  else if (abs >= 1e3) s = (abs / 1e3).toFixed(0) + 'K';
  else                 s = abs.toFixed(0);
  return (n < 0 ? '-₦' : '₦') + s;
}

function fmtFull(n: number): string {
  return (n < 0 ? '-₦' : '₦') + Math.abs(Math.round(n)).toLocaleString('en-NG');
}

// ── Personas ───────────────────────────────────────────────────────────────────

const ADULT_PERSONAS: Persona[] = [
  { id:'nysc', emoji:'🎓', name:'NYSC Corps Member, 22',
    blurb:'Just finished school, first small allowance, no debt yet.',
    start:'Starts near ₦50,000 net worth',
    values:{savings:50000,invest:0,property:0,vehicle:0,business:0,digital:0,valuables:0,loans:0,credit:0,informal:0}},
  { id:'biz', emoji:'🚀', name:'Small Business Owner, 28',
    blurb:'Running a growing business, some debt funding growth.',
    start:'Starts near ₦2,000,000 net worth',
    values:{savings:300000,invest:150000,property:0,vehicle:800000,business:1200000,digital:0,valuables:0,loans:600000,credit:50000,informal:0}},
  { id:'civil', emoji:'🏛️', name:'Civil Servant, 35, two kids',
    blurb:'Steady salary, a home, a car, a mortgage-style loan.',
    start:'Starts near ₦2,200,000 net worth',
    values:{savings:500000,invest:200000,property:2500000,vehicle:900000,business:0,digital:0,valuables:0,loans:1800000,credit:100000,informal:0}},
  { id:'custom', emoji:'🛠️', name:'Build Your Own',
    blurb:'Start from zero and make up every number yourself.',
    start:'Starts at ₦0 — totally yours',
    values:{savings:0,invest:0,property:0,vehicle:0,business:0,digital:0,valuables:0,loans:0,credit:0,informal:0}},
];

const TEEN_PERSONAS: Persona[] = [
  { id:'ss3grad', emoji:'🎓', name:'SS3 Graduate, 18',
    blurb:'Just finished secondary school, first ever savings stashed away.',
    start:'Starts near ₦25,000 net worth',
    values:{savings:25000,invest:0,property:0,vehicle:0,business:0,digital:0,valuables:0,loans:0,credit:0,informal:0}},
  { id:'seller', emoji:'🛒', name:'Side-Hustle Seller, 19',
    blurb:'Sells goods online and at school — small stock, real profit.',
    start:'Starts near ₦170,000 net worth',
    values:{savings:80000,invest:0,property:0,vehicle:0,business:120000,digital:0,valuables:0,loans:0,credit:0,informal:30000}},
  { id:'apprentice', emoji:'📱', name:'Tech Apprentice, 20',
    blurb:'Learning a digital skill, picking up small gigs along the way.',
    start:'Starts near ₦40,000 net worth',
    values:{savings:50000,invest:0,property:0,vehicle:0,business:0,digital:0,valuables:0,loans:0,credit:0,informal:10000}},
  { id:'custom', emoji:'🛠️', name:'Build Your Own',
    blurb:'Start from zero and make up every number yourself.',
    start:'Starts at ₦0 — totally yours',
    values:{savings:0,invest:0,property:0,vehicle:0,business:0,digital:0,valuables:0,loans:0,credit:0,informal:0}},
];

// ── Life events ────────────────────────────────────────────────────────────────

const ADULT_EVENTS: LifeEvent[] = [
  { id:'jobloss', emoji:'📉', title:'Job Loss (6 months)',
    desc:'No contributions for half a year, scaled to when it hurts most.' },
  { id:'hustle', emoji:'🚀', title:'Side Hustle Takes Off',
    desc:'A one-time ₦300,000 boost arrives a quarter through the simulation.' },
  { id:'debt', emoji:'💳', title:'Unexpected Debt',
    desc:'₦150,000 in new debt appears about an eighth of the way through.' },
];

const TEEN_EVENTS: LifeEvent[] = [
  { id:'jobloss', emoji:'📉', title:'Lost Part-Time Gig (6 months)',
    desc:'No contributions for half a year, scaled to when it hurts most.' },
  { id:'hustle', emoji:'🚀', title:'Side Hustle Blows Up',
    desc:'A ₦50,000 cash injection arrives a quarter through the simulation.' },
  { id:'debt', emoji:'💳', title:'Emergency Expense',
    desc:'₦30,000 in unexpected costs appears about an eighth of the way through.' },
];

// ── Feedback bank ──────────────────────────────────────────────────────────────

const FEEDBACK: Array<{ max: number; emoji: string; lines: string[] }> = [
  { max:0, emoji:'😬', lines:[
    "Chai. Your liabilities are throwing a party and your assets weren't invited.",
    "This na negative net worth, but no wahala — every comeback story starts somewhere.",
    "Technically, the bank owns more of \"you\" than you do right now. Time to flip the script.",
  ]},
  { max:1e6, emoji:'🌱', lines:[
    "You're not broke, you're pre-rich. Every empire starts with a small seed.",
    "Modest but moving. This is the \"before\" photo, and that's fine.",
    "You could buy a really nice small suya. Multiple times. It's a start.",
  ]},
  { max:1e7, emoji:'😌', lines:[
    "Comfortable enough to enjoy suya without checking your balance first. Respect.",
    "You're the friend who can actually contribute to the owambe without flinching.",
    "Solid ground. Not shaking table money, but you're not shaking either.",
  ]},
  { max:1e8, emoji:'🏠', lines:[
    "Landlord energy. Distant relatives are starting to remember your birthday.",
    "You could seriously consider real estate now. Or at least stop renting from your cousin.",
    "This is \"aunty/uncle at the family meeting whose opinion suddenly matters\" money.",
  ]},
  { max:1e9, emoji:'🚗', lines:[
    "You're the uncle everyone name-drops now. \"My guy is doing well o.\"",
    "This is convoy-adjacent wealth. Not quite convoy, but adjacent.",
    "People are starting to ask you for \"small help\" and mean it seriously.",
  ]},
  { max:Infinity, emoji:'👑', lines:[
    "Okay Oga/Madam. Even Dangote dey observe you small small.",
    "At this point you don't check exchange rates, exchange rates check you.",
    "This is generational wealth energy. Somebody's great-grandchildren thank you already.",
  ]},
];

function pickFeedback(net: number) {
  const tier = FEEDBACK.find(t => net < t.max) ?? FEEDBACK[FEEDBACK.length - 1];
  return { emoji: tier.emoji, line: tier.lines[Math.floor(Math.random() * tier.lines.length)] };
}

// ── Simulation math ────────────────────────────────────────────────────────────

function simulate(
  startNet: number, years: number, monthly: number,
  withEvents: boolean, activeEvents: EventFlags, track: SimTrack,
): number[] {
  const rM = 0.12 / 12;
  const totalMonths = years * 12;
  const hustleBonus = track === 'teens' ? 50_000 : 300_000;
  const debtHit     = track === 'teens' ? 30_000 : 150_000;
  // Scale life-event timing to the simulation length so it feels meaningful at any duration
  const jobLossStart = Math.max(1, Math.round(totalMonths * 0.06));
  const jobLossEnd   = jobLossStart + 5; // 6-month pause
  const hustleMonth  = Math.round(totalMonths * 0.25);
  const debtMonth    = Math.round(totalMonths * 0.12);

  let balance = startNet;
  const yearly: number[] = [balance];
  for (let m = 1; m <= totalMonths; m++) {
    let contrib = monthly;
    if (withEvents && activeEvents.jobloss && m >= jobLossStart && m <= jobLossEnd) contrib = 0;
    balance = balance * (1 + rM) + contrib;
    if (withEvents && activeEvents.hustle && m === hustleMonth) balance += hustleBonus;
    if (withEvents && activeEvents.debt   && m === debtMonth)   balance -= debtHit;
    if (m % 12 === 0) yearly.push(balance);
  }
  return yearly;
}

// ── localStorage ───────────────────────────────────────────────────────────────

const LS_KEY = 'nairaquest-simulator-v1';

interface SimSaved {
  track: SimTrack; personaId: string; step: Step;
  values: PersonaValues; years: number; contrib: number; events: EventFlags;
}

function lsLoad(): SimSaved | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); } catch { return null; }
}
function lsSave(s: SimSaved): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}

// ── Slider row component ───────────────────────────────────────────────────────

interface SliderRowProps {
  id: string; label: string; hint?: string;
  value: number; isDebt?: boolean; onChange: (v: number) => void;
}

function SliderRow({ id, label, hint, value, isDebt = false, onChange }: SliderRowProps) {
  const isScaled = SCALED_FIELDS.has(id);
  const scale    = isScaled ? SCALES[id as ScaledField] : [];
  const linCfg   = isScaled ? undefined : LINEAR_CFG[id];
  const color    = isDebt ? '#E2543F' : '#E8B84B';

  const sliderVal = isScaled ? nearestIdx(scale, value) : value;
  const sliderMax = isScaled ? scale.length - 1 : (linCfg?.max ?? 0);
  const sliderStp = isScaled ? 1 : (linCfg?.step ?? 1);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div>
          <span className="text-base font-medium" style={{ color: 'rgba(246,241,228,0.9)' }}>{label}</span>
          {hint && <span className="block text-xs mt-0.5" style={{ color: '#6C8A7E' }}>{hint}</span>}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color }}>
          {fmtFull(value)}
        </span>
      </div>
      <input type="range" min={0} max={sliderMax} step={sliderStp} value={sliderVal}
        onChange={e => {
          const raw = parseInt(e.target.value);
          onChange(isScaled ? scale[raw] : raw);
        }}
          className={`w-full ${isDebt ? 'sim-slider-debt' : 'sim-slider'}`}
      />
    </div>
  );
}

// ── SVG chart ─────────────────────────────────────────────────────────────────

function SimChart({ baseline, eventsLine }: { baseline: number[]; eventsLine: number[] }) {
  const W = 800, H = 200, PAD = 16;
  const all = [...baseline, ...eventsLine];
  const minV = Math.min(0, Math.min(...all));
  const maxV = (Math.max(...all) * 1.08) || 1;
  const xAt = (i: number, len: number) => PAD + (i / (len - 1)) * (W - PAD * 2);
  const yAt = (v: number) => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2);
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i, arr.length).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
      <line x1={PAD} y1={yAt(0).toFixed(1)} x2={W - PAD} y2={yAt(0).toFixed(1)}
        stroke="rgba(157,184,172,0.25)" strokeWidth="1" strokeDasharray="4 4" />
      <path d={path(baseline)} fill="none" stroke="#E8B84B" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(eventsLine)} fill="none" stroke="#E2543F" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {baseline.map((v, i) =>
        <circle key={`b${i}`} cx={xAt(i, baseline.length)} cy={yAt(v)} r="3" fill="#E8B84B" />)}
      {eventsLine.map((v, i) =>
        <circle key={`e${i}`} cx={xAt(i, eventsLine.length)} cy={yAt(v)} r="3" fill="#E2543F" />)}
    </svg>
  );
}

// ── Field config ───────────────────────────────────────────────────────────────

const ASSET_FIELDS = ['savings','invest','property','vehicle','business','digital','valuables'] as const;
const DEBT_FIELDS  = ['loans','credit','informal'] as const;

const ASSET_META: Record<typeof ASSET_FIELDS[number], { label: string; hint?: string }> = {
  savings:   { label: 'Savings',       hint: 'Physical cash or bank accounts' },
  invest:    { label: 'Investments',   hint: 'Tradable shares, stocks, etc.' },
  property:  { label: 'Real Estate',   hint: 'Land, offices, warehouses, factories' },
  vehicle:   { label: 'Vehicle' },
  business:  { label: 'Business value' },
  digital:   { label: 'Digital assets', hint: 'Domains, software, apps' },
  valuables: { label: 'Valuables',     hint: 'Jewellery, art, gold, antiques' },
};

const DEBT_META: Record<typeof DEBT_FIELDS[number], { label: string; hint?: string }> = {
  loans:    { label: 'Loans' },
  credit:   { label: 'Credit balance',
    hint: 'Card/overdraft/BNPL balance — not a credit score, Nigeria doesn\'t use one' },
  informal: { label: 'Informal debt' },
};

// ── Panel wrapper ──────────────────────────────────────────────────────────────

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`}
      style={{ background: '#16332C', border: '1px solid rgba(157,184,172,0.18)' }}>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const navigate    = useNavigate();
  const { profile } = useGameStore();
  const track: SimTrack = profile?.ageTrack === 'teens' ? 'teens' : 'adults';
  const personas    = track === 'teens' ? TEEN_PERSONAS : ADULT_PERSONAS;
  const lifeEvents  = track === 'teens' ? TEEN_EVENTS   : ADULT_EVENTS;

  useEffect(() => {
    if (profile?.ageTrack === 'kids') navigate('/kids', { replace: true });
  }, [profile, navigate]);

  // ── State ──────────────────────────────────────────────────────────────────

  const [step,    setStep]    = useState<Step>(1);
  const [persona, setPersona] = useState<Persona>(personas[0]);
  const [values,  setValues]  = useState<PersonaValues>({ ...personas[0].values });
  const [years,   setYears]   = useState(10);
  const [contrib, setContrib] = useState(track === 'teens' ? 5_000 : 20_000);
  const [events,  setEvents]  = useState<EventFlags>({ jobloss: false, hustle: false, debt: false });

  // Restore from localStorage once on mount
  useEffect(() => {
    const saved = lsLoad();
    if (!saved || saved.track !== track) return;
    const p = personas.find(x => x.id === saved.personaId) ?? personas[0];
    setPersona(p);
    setValues(saved.values ?? { ...p.values });
    setStep((Math.min(saved.step, 3) as Step) ?? 1);
    setYears(saved.years ?? 10);
    setContrib(saved.contrib ?? (track === 'teens' ? 5_000 : 20_000));
    setEvents(saved.events ?? { jobloss: false, hustle: false, debt: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever anything changes
  useEffect(() => {
    lsSave({ track, personaId: persona.id, step, values, years, contrib, events });
  }, [track, persona, step, values, years, contrib, events]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const setValue = (field: keyof PersonaValues, v: number) =>
    setValues(prev => ({ ...prev, [field]: v }));

  const toggleEvent = (id: keyof EventFlags) =>
    setEvents(prev => ({ ...prev, [id]: !prev[id] }));

  const netWorth = useMemo(() =>
    ASSET_FIELDS.reduce((s, f) => s + values[f], 0) -
    DEBT_FIELDS.reduce((s, f) => s + values[f], 0),
  [values]);

  const contribMax  = track === 'teens' ? 100_000 : 500_000;
  const contribStep = track === 'teens' ? 1_000   : 5_000;

  const baselineSeries = useMemo(() =>
    simulate(netWorth, years, contrib, false, events, track),
  [netWorth, years, contrib, events, track]);

  const eventsSeries = useMemo(() =>
    simulate(netWorth, years, contrib, true, events, track),
  [netWorth, years, contrib, events, track]);

  const finalBaseline = baselineSeries[baselineSeries.length - 1];
  const finalEvents   = eventsSeries[eventsSeries.length - 1];

  const feedback = useMemo(() => pickFeedback(finalEvents), [finalEvents]);

  const diffText = useMemo(() => {
    const diff = finalEvents - finalBaseline;
    if (Math.abs(diff) < 1) return '';
    return diff < 0
      ? ` Those life events cost this persona about ${fmt(Math.abs(diff))} compared to the steady path — that's the real price of a rough patch.`
      : ` Those events actually left this persona about ${fmt(diff)} ahead of the steady path — sometimes chaos pays off.`;
  }, [finalEvents, finalBaseline]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const pickPersona = (p: Persona) => {
    setPersona(p);
    setValues({ ...p.values });
    setStep(2);
  };

  const resetSim = () => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setStep(1);
    setPersona(personas[0]);
    setValues({ ...personas[0].values });
    setYears(10);
    setContrib(track === 'teens' ? 5_000 : 20_000);
    setEvents({ jobloss: false, hustle: false, debt: false });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const BG = track === 'teens'
    ? 'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(139,92,246,0.12), transparent 60%), #080012'
    : 'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(232,184,75,0.08), transparent 60%), #0E2620';

  const accentColor = track === 'teens' ? '#a78bfa' : '#E8B84B';
  const accentBg    = track === 'teens' ? 'rgba(139,92,246,0.1)' : 'rgba(232,184,75,0.08)';
  const accentBdr   = track === 'teens' ? 'rgba(139,92,246,0.3)' : 'rgba(232,184,75,0.3)';

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <TopNav />

      <main className="pt-20 pb-16 px-4 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <motion.div className="text-center max-w-2xl mx-auto mb-6"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: accentColor }}>
            <span className="w-2 h-2 rounded-full bg-current inline-block" />
            Build a financial story.
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-medium leading-snug mb-4"
            style={{ color: '#F6F1E4' }}>
            Net Worth Simulator
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#9DB8AC' }}>
            Know your Networth. Pick a character from below give them a financial life, then see your worth.
          </p>
        </motion.div>

        {/* ── Fiction banner — always visible on every step ── */}
        <motion.div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed"
          style={{ background: accentBg, border: `1px solid ${accentBdr}`, color: accentColor }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <span className="text-base mt-0.5 shrink-0">🎭</span>
          <p className="m-0">
            This is a simulation. The goal is to see how a net worth actually works.
          </p>
        </motion.div>

        {/* ── Step indicator ── */}
        <div className="flex justify-center items-center gap-3 mb-10">
          {([1, 2, 3] as Step[]).map((n, idx) => {
            const labels = ['Pick a persona', 'Build net worth', 'Simulate'];
            const done   = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center gap-3">
                {idx > 0 && (
                  <div className="w-10 h-px" style={{ background: 'rgba(157,184,172,0.22)' }} />
                )}
                <div className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: active || done ? accentColor : '#6C8A7E' }}>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 font-bold"
                    style={{
                      borderColor: active || done ? accentColor : '#6C8A7E',
                      background:  done ? accentColor : active ? `${accentColor}20` : 'transparent',
                      color:       done ? '#0E2620' : 'inherit',
                    }}>
                    {done ? '✓' : n}
                  </span>
                  <span className="hidden sm:inline">{labels[idx]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Steps ── */}
        <AnimatePresence mode="wait">

          {/* ─── Step 1: Persona picker ─── */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personas.map(p => (
                  <motion.button key={p.id} className="text-left p-6 rounded-2xl border transition-colors"
                    style={{ background: '#16332C', borderColor: 'rgba(157,184,172,0.18)' }}
                    whileHover={{ scale: 1.02, y: -3 } as never}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickPersona(p)}>
                    <span className="text-3xl mb-3 block">{p.emoji}</span>
                    <h3 className="font-display font-medium text-lg mb-2" style={{ color: '#F6F1E4' }}>
                      {p.name}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#9DB8AC' }}>
                      {p.blurb}
                    </p>
                    <span className="text-sm font-medium"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#B98F35' }}>
                      {p.start}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Build net worth ─── */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

              {/* Persona banner */}
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
                style={{ background: '#16332C', border: '1px solid rgba(157,184,172,0.18)' }}>
                <span className="text-xl">{persona.emoji}</span>
                <span className="font-semibold text-sm" style={{ color: '#F6F1E4' }}>{persona.name}</span>
                <span className="ml-auto text-xs text-right" style={{ color: '#6C8A7E' }}>
                  Fictional — edit any number below
                </span>
              </div>

              {/* Asset + debt columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Panel>
                  <h4 className="text-sm font-bold tracking-widest uppercase mb-5"
                    style={{ color: '#E8B84B' }}>Assets</h4>
                  {ASSET_FIELDS.map(f => (
                    <SliderRow key={f} id={f} label={ASSET_META[f].label} hint={ASSET_META[f].hint}
                      value={values[f]} onChange={v => setValue(f, v)} />
                  ))}
                </Panel>
                <Panel>
                  <h4 className="text-sm font-bold tracking-widest uppercase mb-5"
                    style={{ color: '#E2543F' }}>Debts</h4>
                  {DEBT_FIELDS.map(f => (
                    <SliderRow key={f} id={f} label={DEBT_META[f].label} hint={DEBT_META[f].hint}
                      value={values[f]} isDebt onChange={v => setValue(f, v)} />
                  ))}
                </Panel>
              </div>

              {/* Net worth total */}
              <div className="rounded-2xl p-5 text-center mb-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(232,184,75,0.14), transparent 70%), #16332C',
                  border: '1px solid rgba(232,184,75,0.45)',
                }}>
                <p className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: '#B98F35' }}>Starting Net Worth</p>
                <p className="text-5xl font-semibold tabular-nums"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#E8B84B' }}>
                  {fmtFull(netWorth)}
                </p>
              </div>

              <div className="flex justify-between">
                <button className="text-sm font-bold px-5 py-3 rounded-xl border"
                  style={{ color: '#9DB8AC', borderColor: 'rgba(157,184,172,0.22)', background: 'transparent' }}
                  onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="text-sm font-bold px-5 py-3 rounded-xl"
                  style={{ background: '#E8B84B', color: '#0E2620' }}
                  onClick={() => setStep(3)}>
                  Run the simulation →
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Simulate forward ─── */}
          {step === 3 && (
            <motion.div key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

              {/* Simulation controls */}
              <Panel className="mb-4">
                <div className="mb-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-base font-medium" style={{ color: 'rgba(246,241,228,0.9)' }}>
                        Years into the future
                      </span>
                      <span className="block text-xs mt-0.5" style={{ color: '#6C8A7E' }}>
                        Forward from today, not a historical replay
                      </span>
                    </div>
                    <span className="text-sm font-semibold shrink-0 tabular-nums"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#E8B84B' }}>
                      {years} {years === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                  <input type="range" min={1} max={30} step={1} value={years}
                    onChange={e => setYears(parseInt(e.target.value))}
                    className="w-full sim-slider" />
                </div>
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-base font-medium" style={{ color: 'rgba(246,241,228,0.9)' }}>
                      Monthly savings / investment contribution
                    </span>
                    <span className="text-sm font-semibold shrink-0 tabular-nums"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#E8B84B' }}>
                      {fmtFull(contrib)}
                    </span>
                  </div>
                  <input type="range" min={0} max={contribMax} step={contribStep} value={contrib}
                    onChange={e => setContrib(parseInt(e.target.value))}
                    className="w-full sim-slider" />
                </div>
              </Panel>

              {/* Life event cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {lifeEvents.map(ev => (
                  <motion.button key={ev.id}
                    className="p-4 rounded-2xl text-left border"
                    style={{
                      background:   events[ev.id] ? 'rgba(226,84,63,0.08)' : '#16332C',
                      borderColor:  events[ev.id] ? '#E2543F' : 'rgba(157,184,172,0.18)',
                      transition: 'background 160ms, border-color 160ms',
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleEvent(ev.id)}>
                    <span className="text-lg block mb-2">{ev.emoji}</span>
                    <h5 className="text-sm font-semibold mb-1.5"
                      style={{ color: events[ev.id] ? '#E2543F' : '#F6F1E4' }}>
                      {ev.title}
                    </h5>
                    <p className="text-xs leading-relaxed m-0" style={{ color: '#6C8A7E' }}>
                      {ev.desc}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Chart */}
              <Panel className="mb-4">
                <div className="flex gap-5 mb-3 text-xs">
                  <span className="flex items-center gap-2" style={{ color: '#9DB8AC' }}>
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#E8B84B' }} />
                    Steady path
                  </span>
                  <span className="flex items-center gap-2" style={{ color: '#9DB8AC' }}>
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#E2543F' }} />
                    With life events
                  </span>
                </div>
                <SimChart baseline={baselineSeries} eventsLine={eventsSeries} />
              </Panel>

              {/* Result cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-4"
                  style={{ background: '#1D3B32', border: '1px solid rgba(157,184,172,0.18)' }}>
                  <p className="text-xs font-bold tracking-wide uppercase mb-2"
                    style={{ color: '#6C8A7E' }}>Steady-path net worth</p>
                  <p className="text-3xl font-semibold tabular-nums"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#E8B84B' }}>
                    {fmt(finalBaseline)}
                  </p>
                </div>
                <div className="rounded-xl p-4"
                  style={{ background: '#1D3B32', border: '1px solid rgba(157,184,172,0.18)' }}>
                  <p className="text-xs font-bold tracking-wide uppercase mb-2"
                    style={{ color: '#6C8A7E' }}>Net worth with events</p>
                  <p className="text-3xl font-semibold tabular-nums"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#E2543F' }}>
                    {fmt(finalEvents)}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div className="flex items-start gap-4 rounded-2xl p-5 mb-6"
                style={{
                  background: 'linear-gradient(180deg, rgba(232,184,75,0.08), transparent 70%), #16332C',
                  border: '1px solid rgba(157,184,172,0.18)',
                }}>
                <span className="text-2xl leading-none mt-0.5 shrink-0">{feedback.emoji}</span>
                <p className="text-sm leading-relaxed m-0" style={{ color: '#F6F1E4' }}>
                  {feedback.line}{diffText}
                </p>
              </div>

              <div className="flex justify-between">
                <button className="text-sm font-bold px-5 py-3 rounded-xl border"
                  style={{ color: '#9DB8AC', borderColor: 'rgba(157,184,172,0.22)', background: 'transparent' }}
                  onClick={() => setStep(2)}>
                  ← Back to building
                </button>
                <button className="text-sm font-bold px-5 py-3 rounded-xl border"
                  style={{ color: '#9DB8AC', borderColor: 'rgba(157,184,172,0.22)', background: 'transparent' }}
                  onClick={resetSim}>
                  Start a new persona
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
