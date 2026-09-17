import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TriviaOption {
  label: string;
  text: string;
  correct: boolean;
}

interface Tier {
  id: string;
  track: string;
  label: string;
  tagline: string;
  headline: string;
  description: string;
  topics: string[];
  challenge: {
    prompt: string;
    options: TriviaOption[];
  };
  cta: string;
  accent: string;
  accentLight: string;
  accentBg: string;
  cardBg: string;
  topBar: string;
  borderColor: string;
  decorIcon: string;
  xpLabel: string;
  ctaTextColor: string;
}

// ─── Tier data ────────────────────────────────────────────────────────────────

const TIERS: Tier[] = [
  {
    id: 'kids',
    track: '/auth',
    label: 'KIDS',
    tagline: 'Ages 6–12',
    headline: 'Build smart money habits early.',
    description:
      'Fun, simple challenges that introduce the building blocks of money.',
    topics: ['Saving', 'Spending', 'Needs vs. Wants', 'Counting Money', 'Setting Goals', 'Making Choices'],
    challenge: {
      prompt:
        'You receive ₦5,000 for your birthday. You save ₦2,000. What percentage did you save?',
      options: [
        { label: 'A', text: '20%',  correct: false },
        { label: 'B', text: '40%',  correct: true  },
        { label: 'C', text: '50%',  correct: false },
        { label: 'D', text: '60%',  correct: false },
      ],
    },
    cta: 'Play Kids Trivia',
    accent: '#92400e',
    accentLight: '#d97706',
    accentBg: 'rgba(217,119,6,0.09)',
    cardBg: '#fffef7',
    topBar: 'linear-gradient(to right, #f59e0b, #fbbf24)',
    borderColor: 'rgba(217,119,6,0.22)',
    decorIcon: '⭐',
    xpLabel: '+10 XP',
    ctaTextColor: '#4a2500',
  },
  {
    id: 'teens',
    track: '/auth',
    label: 'TEENS',
    tagline: 'Ages 13–17',
    headline: 'Get ready for your money independence.',
    description:
      "Real-life challenges that prepare teens for the money decisions they'll increasingly make for themselves.",
    topics: ['Budgeting', 'Bank Accounts', 'Digital Payments', 'Saving', 'Scams', 'Side Hustles', 'Intro to Investing'],
    challenge: {
      prompt:
        'You earn ₦50,000 from a side hustle and decide to save 20%. How much goes into savings?',
      options: [
        { label: 'A', text: '₦5,000',  correct: false },
        { label: 'B', text: '₦10,000', correct: true  },
        { label: 'C', text: '₦15,000', correct: false },
        { label: 'D', text: '₦20,000', correct: false },
      ],
    },
    cta: 'Play Teen Trivia',
    accent: '#005c38',
    accentLight: '#008751',
    accentBg: 'rgba(0,135,81,0.08)',
    cardBg: '#f7fdf9',
    topBar: 'linear-gradient(to right, #008751, #00b86a)',
    borderColor: 'rgba(0,135,81,0.2)',
    decorIcon: '🏆',
    xpLabel: '+15 XP',
    ctaTextColor: '#ffffff',
  },
  {
    id: 'adults',
    track: '/auth',
    label: 'ADULTS',
    tagline: 'Ages 18+',
    headline: 'Put your real-world money knowledge to the test.',
    description:
      'Challenge yourself on financial decisions that affect everyday life and long-term goals.',
    topics: ['Credit', 'Debt', 'Investing', 'Insurance', 'Taxes', 'Inflation', 'Fraud', 'Entrepreneurship'],
    challenge: {
      prompt:
        'An investment loses 50% of its value. What percentage must it gain to return to its original value?',
      options: [
        { label: 'A', text: '50%',  correct: false },
        { label: 'B', text: '75%',  correct: false },
        { label: 'C', text: '100%', correct: true  },
        { label: 'D', text: '150%', correct: false },
      ],
    },
    cta: 'Play Adult Trivia',
    accent: '#1e3a8a',
    accentLight: '#2563eb',
    accentBg: 'rgba(37,99,235,0.07)',
    cardBg: '#f8fafe',
    topBar: 'linear-gradient(to right, #2563eb, #60a5fa)',
    borderColor: 'rgba(37,99,235,0.18)',
    decorIcon: '💡',
    xpLabel: '+20 XP',
    ctaTextColor: '#ffffff',
  },
];

// ─── TopicChip ────────────────────────────────────────────────────────────────

function TopicChip({ text, accent, accentBg }: { text: string; accent: string; accentBg: string }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 cursor-default"
      style={{
        background: accentBg,
        color: accent,
        border: `1px solid ${accent}40`,
      }}
    >
      {text}
    </span>
  );
}

// ─── TriviaPreview ────────────────────────────────────────────────────────────

function TriviaPreview({ tier, reduceMotion }: { tier: Tier; reduceMotion: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const correctOption = tier.challenge.options.find((o) => o.correct);
  const chosenOption  = tier.challenge.options.find((o) => o.label === selected);
  const isCorrect     = chosenOption?.correct ?? false;

  return (
    <div
      className="rounded-xl p-4 mb-5"
      role="group"
      aria-label="Sample money challenge"
      style={{
        background: 'rgba(0,0,0,0.025)',
        border: `1px solid ${tier.borderColor}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-black tracking-widest uppercase"
          style={{ color: tier.accent }}
        >
          Money Challenge
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: tier.accentBg, color: tier.accent }}
        >
          {tier.xpLabel}
        </span>
      </div>

      {/* Prompt */}
      <p className="text-[13px] font-medium leading-relaxed mb-3" style={{ color: '#1a2318' }}>
        {tier.challenge.prompt}
      </p>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-1.5">
        {tier.challenge.options.map((opt) => {
          let bg      = 'rgba(255,255,255,0.85)';
          let border  = 'rgba(0,0,0,0.09)';
          let color   = '#2a3a28';
          let opacity = 1;

          if (answered) {
            if (opt.label === selected && isCorrect) {
              bg = 'rgba(0,135,81,0.1)'; border = '#008751'; color = '#005c38';
            } else if (opt.label === selected && !isCorrect) {
              bg = 'rgba(239,68,68,0.09)'; border = '#ef4444'; color = '#991b1b';
            } else if (opt.correct) {
              bg = 'rgba(0,135,81,0.07)'; border = '#008751'; color = '#005c38';
            } else {
              opacity = 0.45;
            }
          }

          return (
            <motion.button
              key={opt.label}
              onClick={() => { if (!answered) setSelected(opt.label); }}
              disabled={answered}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-left disabled:cursor-default"
              style={{ background: bg, border: `1.5px solid ${border}`, color, opacity, transition: 'opacity 0.2s, background 0.15s, border-color 0.15s' }}
              whileHover={!answered && !reduceMotion ? { scale: 1.025 } : {}}
              whileTap={!answered && !reduceMotion ? { scale: 0.97 }  : {}}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{
                  background: answered && opt.correct ? '#008751' : 'rgba(0,0,0,0.09)',
                  color:      answered && opt.correct ? '#fff' : 'inherit',
                }}
              >
                {opt.label}
              </span>
              <span className="truncate">{opt.text}</span>
              {answered && opt.correct && <span className="ml-auto flex-shrink-0">✓</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback line */}
      <AnimatePresence>
        {answered && (
          <motion.p
            className="text-[11px] font-semibold mt-2.5 text-center"
            style={{ color: isCorrect ? '#005c38' : '#991b1b' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isCorrect
              ? `✓ Correct! ${tier.xpLabel} earned.`
              : `✗ Not quite — the answer is ${correctOption?.text}.`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TierCard ─────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  index,
  reduceMotion,
}: {
  tier: Tier;
  index: number;
  reduceMotion: boolean;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      className="relative flex flex-col rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-offset-2"
      style={{
        background: tier.cardBg,
        border: `1.5px solid ${hovered ? tier.accentLight + '55' : tier.borderColor}`,
        boxShadow: hovered
          ? `0 20px 56px -12px ${tier.accentBg}, 0 4px 16px rgba(0,0,0,0.07)`
          : '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        outline: 'none',
      }}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={!reduceMotion ? { y: -6 } : {}}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Accent top bar */}
      <div aria-hidden style={{ height: 4, background: tier.topBar, flexShrink: 0 }} />

      <div className="flex flex-col flex-1 p-5 sm:p-6">

        {/* Card header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className="block text-[10px] font-black tracking-widest uppercase mb-0.5"
              style={{ color: tier.accent }}
            >
              {tier.label}
            </span>
            <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
              {tier.tagline}
            </span>
          </div>
          <span className="text-2xl select-none" aria-hidden role="presentation">
            {tier.decorIcon}
          </span>
        </div>

        {/* Headline */}
        <h3
          className="font-display font-bold leading-snug mb-2"
          style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: '#0d1f0e' }}
        >
          {tier.headline}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#4a5a48', lineHeight: 1.65 }}>
          {tier.description}
        </p>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-1.5 mb-5" aria-label={`${tier.label} topics`}>
          {tier.topics.map((topic) => (
            <TopicChip
              key={topic}
              text={topic}
              accent={tier.accent}
              accentBg={tier.accentBg}
            />
          ))}
        </div>

        {/* Interactive trivia preview */}
        <TriviaPreview tier={tier} reduceMotion={reduceMotion} />

        {/* CTA button */}
        <motion.button
          className="mt-auto w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: tier.topBar,
            color: tier.ctaTextColor,
            boxShadow: hovered ? `0 6px 20px -4px ${tier.accentBg}` : 'none',
            transition: 'box-shadow 0.2s ease',
          }}
          onClick={() => navigate(tier.track)}
          whileHover={!reduceMotion ? { scale: 1.02 } : {}}
          whileTap={!reduceMotion ? { scale: 0.97 } : {}}
          aria-label={`${tier.cta} — ${tier.tagline}`}
        >
          <span>{tier.cta}</span>
          <motion.span
            aria-hidden
            animate={hovered && !reduceMotion ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.15 }}
          >
            →
          </motion.span>
        </motion.button>

      </div>
    </motion.article>
  );
}

// ─── AudienceSection (exported) ───────────────────────────────────────────────

export default function AudienceSection() {
  const navigate = useNavigate();

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{ background: '#FDFBF5' }}
      aria-labelledby="audience-heading"
    >
      {/* Shadow bridge from dark hero above */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(3,7,18,0.13) 0%, transparent 100%)' }}
      />

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,100,50,0.055) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Intro ── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-6"
            style={{
              borderColor: 'rgba(0,135,81,0.35)',
              background:  'rgba(0,135,81,0.07)',
              color:       '#005c38',
              letterSpacing: '0.06em',
            }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#008751' }} />
            BUILT FOR EVERY STAGE
          </div>

          {/* Main headline */}
          <h2
            id="audience-heading"
            className="font-display font-black leading-tight mb-4"
            style={{ fontSize: 'clamp(26px, 4.2vw, 46px)', letterSpacing: '-0.015em', color: '#0d1f0e' }}
          >
            Different ages.{' '}
            <span className="hidden sm:inline"><br /></span>
            Different money decisions.{' '}
            <span style={{ color: '#008751' }}>One game.</span>
          </h2>

          {/* Supporting copy */}
          <p
            className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-3"
            style={{ color: '#4a6a55' }}
          >
            From understanding your first Naira to navigating real-world financial decisions,
            every challenge is designed for where you are in life.
          </p>

          {/* Nigerian relevance — intentionally subdued */}
          <p className="text-xs font-medium" style={{ color: '#a1a1aa' }}>
            🇳🇬 Built around money decisions Nigerians actually make.
          </p>
        </motion.div>

        {/* ── Tier cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-16">
          {TIERS.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} reduceMotion={reduceMotion} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Divider */}
          <div
            aria-hidden
            className="w-12 h-px mx-auto mb-8"
            style={{ background: 'rgba(0,135,81,0.3)' }}
          />

          <h3
            className="font-display font-bold mb-2"
            style={{ fontSize: 'clamp(20px, 3vw, 30px)', color: '#0d1f0e', letterSpacing: '-0.01em' }}
          >
            Ready to test your money knowledge?
          </h3>
          <p className="text-sm mb-7" style={{ color: '#6b7280' }}>
            Pick your level and see how money-smart you really are.
          </p>

          <motion.button
            className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-display font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naira-green"
            style={{
              background: '#008751',
              color: '#ffffff',
              boxShadow: '0 10px 30px -8px rgba(0,135,81,0.4)',
            }}
            onClick={() => navigate('/auth')}
            whileHover={!reduceMotion ? { y: -2, boxShadow: '0 14px 36px -8px rgba(0,135,81,0.5)' } : {}}
            whileTap={!reduceMotion ? { scale: 0.97 } : {}}
          >
            Choose Your Level →
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
