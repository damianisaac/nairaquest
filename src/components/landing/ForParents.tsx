import { motion } from 'framer-motion';

// ─── Per-age card themes ──────────────────────────────────────────────────────

const CARD_THEMES = {
  'AGES 6–9': {
    color:   '#007a4a',
    topBar:  'linear-gradient(to right, #008751, #00b86a)',
    border:  'rgba(0,135,81,0.25)',
    shadow:  '0 4px 24px rgba(0,135,81,0.12)',
    badgeBg: 'rgba(0,135,81,0.1)',
    badgeBorder: 'rgba(0,135,81,0.3)',
    labelColor: '#005c38',
    icon:    '🍪',
  },
  'AGES 9–12': {
    color:   '#8a6a00',
    topBar:  'linear-gradient(to right, #b8941f, #d4af37)',
    border:  'rgba(180,148,31,0.3)',
    shadow:  '0 4px 24px rgba(180,148,31,0.12)',
    badgeBg: 'rgba(180,148,31,0.1)',
    badgeBorder: 'rgba(180,148,31,0.3)',
    labelColor: '#6a4a00',
    icon:    '🎲',
  },
  'AGES 12–15': {
    color:   '#6d28d9',
    topBar:  'linear-gradient(to right, #7c3aed, #a78bfa)',
    border:  'rgba(109,40,217,0.22)',
    shadow:  '0 4px 24px rgba(109,40,217,0.1)',
    badgeBg: 'rgba(109,40,217,0.08)',
    badgeBorder: 'rgba(109,40,217,0.25)',
    labelColor: '#5b21b6',
    icon:    '📊',
  },
  'AGES 15–18': {
    color:   '#0369a1',
    topBar:  'linear-gradient(to right, #0284c7, #38bdf8)',
    border:  'rgba(3,105,161,0.22)',
    shadow:  '0 4px 24px rgba(3,105,161,0.1)',
    badgeBg: 'rgba(3,105,161,0.08)',
    badgeBorder: 'rgba(3,105,161,0.25)',
    labelColor: '#075985',
    icon:    '🏦',
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

// ─── Floating ₦ watermarks ────────────────────────────────────────────────────

const FLOATERS = [
  { size: 110, top: '6%',  left: '1%',        dur: 6,   delay: 0   },
  { size: 60,  top: '64%', left: '3%',         dur: 8,   delay: 1.3 },
  { size: 130, top: '7%',  left: undefined, right: '1%', dur: 7,   delay: 0.8 },
  { size: 48,  top: '68%', left: undefined, right: '3%', dur: 5.5, delay: 2   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForParents() {
  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{ background: '#FEF6F2' }}
    >
      {/* Section separator */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(226,84,63,0.2), transparent)' }}
      />

      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(180,60,30,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating ₦ watermarks */}
      {FLOATERS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute font-black select-none pointer-events-none"
          style={{ fontSize: p.size, top: p.top, left: p.left, right: p.right, color: 'rgba(180,60,30,0.06)', zIndex: 0 }}
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
              borderColor: 'rgba(192,64,48,0.35)',
              background:  'rgba(192,64,48,0.08)',
              color:       '#a03020',
              letterSpacing: '0.06em',
            }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#e2543f' }} />
            For Parents
          </div>

          <h2
            className="font-display font-black mb-4"
            style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', lineHeight: 1.18, letterSpacing: '-0.01em', color: '#1a0c08' }}
          >
            How to teach this to a child
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#6a3a2a' }}>
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
                className="relative rounded-2xl overflow-hidden text-left"
                style={{ background: '#ffffff', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}
                whileHover={{ y: -4, boxShadow: `0 16px 48px ${theme.border}` }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: cardIdx * 0.08 }}
              >
                {/* Colored top bar */}
                <div style={{ height: 5, background: theme.topBar }} />

                <div className="p-7 sm:p-8">
                  {/* Icon — top right */}
                  <div
                    className="float-right text-4xl ml-4 mb-2 leading-none select-none pointer-events-none"
                    aria-hidden
                    style={{ opacity: 0.85 }}
                  >
                    {theme.icon}
                  </div>

                  {/* Age badge */}
                  <span
                    className="inline-block text-xs font-bold tracking-widest mb-4 px-3 py-1.5 rounded-full"
                    style={{ color: theme.color, background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, letterSpacing: '0.07em' }}
                  >
                    {card.ages}
                  </span>

                  {/* Title */}
                  <h3
                    className="font-display font-black mb-3 clear-right"
                    style={{ fontSize: 'clamp(17px, 2.2vw, 21px)', color: '#1a2e1a', lineHeight: 1.3 }}
                  >
                    {card.title}
                  </h3>

                  {/* Body */}
                  <p className="text-sm leading-relaxed" style={{ color: '#4a6a55' }}>
                    {card.body}
                  </p>

                  {/* Tie-in line */}
                  {card.tieIn && (
                    <p
                      className="mt-3 text-xs leading-relaxed italic font-medium"
                      style={{ color: '#8a6a00' }}
                    >
                      ↑ {card.tieIn}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
