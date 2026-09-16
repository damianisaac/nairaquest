import { motion } from 'framer-motion';

// ─── Per-age card themes ──────────────────────────────────────────────────────

const CARD_THEMES = {
  'AGES 6–9': {
    color:  '#00b86a',
    bg:     'linear-gradient(160deg, rgba(0,183,107,0.13) 0%, rgba(0,183,107,0.04) 60%, rgba(255,255,255,0.02) 100%)',
    border: 'rgba(0,183,107,0.35)',
    shadow: '0 0 0 1px rgba(0,183,107,0.06), 0 20px 50px -20px rgba(0,183,107,0.25)',
    badge:  { bg: 'rgba(0,183,107,0.12)', border: 'rgba(0,183,107,0.3)' },
    icon:   '🍪',
  },
  'AGES 9–12': {
    color:  '#d4af37',
    bg:     'linear-gradient(160deg, rgba(212,175,55,0.13) 0%, rgba(212,175,55,0.04) 60%, rgba(255,255,255,0.02) 100%)',
    border: 'rgba(212,175,55,0.38)',
    shadow: '0 0 0 1px rgba(212,175,55,0.08), 0 20px 50px -20px rgba(212,175,55,0.28)',
    badge:  { bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.3)' },
    icon:   '🎲',
  },
  'AGES 12–15': {
    color:  '#a78bfa',
    bg:     'linear-gradient(160deg, rgba(139,92,246,0.13) 0%, rgba(139,92,246,0.04) 60%, rgba(255,255,255,0.02) 100%)',
    border: 'rgba(139,92,246,0.35)',
    shadow: '0 0 0 1px rgba(139,92,246,0.06), 0 20px 50px -20px rgba(139,92,246,0.22)',
    badge:  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
    icon:   '📊',
  },
  'AGES 15–18': {
    color:  '#38bdf8',
    bg:     'linear-gradient(160deg, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.04) 60%, rgba(255,255,255,0.02) 100%)',
    border: 'rgba(56,189,248,0.35)',
    shadow: '0 0 0 1px rgba(56,189,248,0.06), 0 20px 50px -20px rgba(56,189,248,0.22)',
    badge:  { bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)' },
    icon:   '🏦',
  },
} as const;

// ─── Card data ────────────────────────────────────────────────────────────────
//
// NOTE: The tie-in lines on the 9-12 and 12-15 cards explicitly reference
// "above" — meaning the Quick Question and Savings Calculator sections that
// sit directly above this one in the homepage. If section order ever changes,
// or this component is reused somewhere those sections aren't present,
// these tie-in lines must be revised.

const CARDS: {
  ages: keyof typeof CARD_THEMES;
  title: string;
  body: string;
  tieIn: string | null;
}[] = [
  {
    ages:  'AGES 6–9',
    title: 'The Biscuit Test',
    body:  'Hand your child one pack of biscuits. Tell them: "You can eat it now, or wait one week. If you wait, you get two packs. Wait two weeks, four packs." Watch them think it over. Then tell them: that\'s exactly how money works in a savings account. Patience multiplies.',
    tieIn: null,
  },
  {
    ages:  'AGES 9–12',
    title: 'The Naira Doubling Game',
    body:  'Ask: "Would you rather have ₦10,000,000 right now, or ₦1 that doubles every day for 30 days?" Let them think. Then write the doubling out on paper, day by day. By day 21 they\'re shocked. By day 30, they understand compound interest better than most adults.',
    tieIn: 'This is the exact question in the Quick Question section above — scroll up and try it together.',
  },
  {
    ages:  'AGES 12–15',
    title: 'Run Their Numbers',
    body:  'Sit them at the Savings Calculator above. Have them put their actual age into "years invested." Plug in ₦5,000 a month, then ₦20,000. What changes? They\'ll see their own future balance, in naira, in front of them. Most teens never have. It\'s a defining moment.',
    tieIn: 'Try it in the Savings Calculator above — put in their age and a monthly amount they could realistically save.',
  },
  {
    ages:  'AGES 15–18',
    title: 'Open Their First Account',
    body:  'The day your child turns 18, walk with them to open their own bank account, in their own name. Set up one automatic transfer — even ₦2,000 a month — the day it opens. The habit matters more than the amount. Everything they practised in the app becomes real the moment that first transfer goes through.',
    tieIn: null,
  },
];

// ─── Floating decoration data ─────────────────────────────────────────────────

const FLOATERS = [
  { size: 75,  top: '10%', left: '3%',        color: '#e2543f', opacity: 0.11, dur: 6,   delay: 0   },
  { size: 45,  top: '62%', left: '5%',         color: '#d4af37', opacity: 0.09, dur: 7.5, delay: 1.3 },
  { size: 95,  top: '12%', left: undefined, right: '4%',  color: '#e2543f', opacity: 0.10, dur: 5.5, delay: 0.8 },
  { size: 36,  top: '68%', left: undefined, right: '5%',  color: '#00b86a', opacity: 0.09, dur: 8,   delay: 2   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForParents() {
  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 1000px 700px at 50% -5%, rgba(226,84,63,0.16), rgba(150,40,20,0.04) 50%, transparent 70%), ' +
          'radial-gradient(ellipse 600px 400px at 15% 85%, rgba(212,175,55,0.09), transparent 60%), ' +
          '#08040a',
      }}
    >
      {/* Separator from Savings Calculator above */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(226,84,63,0.2), transparent)' }}
      />

      {/* Ledger-line texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, rgba(226,84,63,0.04) 43px, rgba(226,84,63,0.04) 44px)',
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
              borderColor: 'rgba(226,84,63,0.5)',
              background:  'rgba(226,84,63,0.1)',
              color:       '#ff7a63',
              letterSpacing: '0.06em',
            }}
            animate={{ boxShadow: ['0 0 10px rgba(226,84,63,0.1)', '0 0 28px rgba(226,84,63,0.3)', '0 0 10px rgba(226,84,63,0.1)'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff7a63' }} />
            For Parents
          </motion.div>

          <h2
            className="font-display font-black text-white mb-4"
            style={{
              fontSize: 'clamp(26px, 4.2vw, 40px)', lineHeight: 1.18, letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #ffffff 0%, #ffd4cc 60%, #ffb5a0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            How to teach this to a child
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#b08070' }}>
            Every age needs a different hook. These are the conversations that actually land.
          </p>
        </div>

        {/* 2×2 card grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))' }}>
          {CARDS.map((card, cardIdx) => {
            const theme = CARD_THEMES[card.ages];
            return (
              <motion.div
                key={card.ages}
                className="relative rounded-[18px] p-7 sm:p-8 text-left overflow-hidden"
                style={{ background: theme.bg, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: cardIdx * 0.08 }}
                whileHover={{ y: -4, boxShadow: `0 0 0 1px ${theme.border}, 0 28px 60px -16px ${theme.color}40` }}
              >
                {/* Colored top border accent */}
                <div
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: `linear-gradient(to right, ${theme.color}, ${theme.color}80, transparent)`, borderRadius: '18px 18px 0 0' }}
                />

                {/* Icon — top right */}
                <div
                  className="absolute top-5 right-6 text-3xl select-none pointer-events-none"
                  style={{ opacity: 0.7 }}
                  aria-hidden
                >
                  {theme.icon}
                </div>

                {/* Age badge */}
                <span
                  className="inline-block text-xs font-bold tracking-widest mb-4 px-3 py-1.5 rounded-full"
                  style={{ color: theme.color, background: theme.badge.bg, border: `1px solid ${theme.badge.border}`, letterSpacing: '0.07em' }}
                >
                  {card.ages}
                </span>

                {/* Title */}
                <h3
                  className="font-display font-black mb-3"
                  style={{ fontSize: 'clamp(17px, 2.2vw, 21px)', color: '#F6F1E4', lineHeight: 1.3 }}
                >
                  {card.title}
                </h3>

                {/* Body */}
                <p className="text-sm leading-relaxed" style={{ color: '#8aab9c' }}>
                  {card.body}
                </p>

                {/* Tie-in line (gold, italic) */}
                {card.tieIn && (
                  <p className="mt-3 text-xs leading-relaxed italic" style={{ color: '#d4af37' }}>
                    {card.tieIn}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
