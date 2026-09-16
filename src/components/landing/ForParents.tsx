// ─── Design tokens — shared with QuickQuestion and SavingsCalculator ─────────

const CORAL     = '#e2543f';
const GOLD      = '#d4af37';
const SAGE      = '#9db8ac';
const SAGE_DIM  = '#6c8a7e';
const INK_LIGHT = '#F6F1E4';
const PANEL     = {
  background:   '#0d201c',
  border:       'rgba(157,184,172,0.18)',
  borderRadius: '18px',
};

// ─── Card data ────────────────────────────────────────────────────────────────
//
// NOTE: The tie-in lines on the 9-12 and 12-15 cards explicitly reference
// "above" — meaning the Quick Question and Savings Calculator sections that
// sit directly above this one in the homepage. If section order ever changes,
// or this component is reused somewhere those sections aren't present,
// these tie-in lines must be revised.

const CARDS = [
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
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForParents() {
  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 900px 500px at 50% 0%, rgba(226,84,63,0.06), transparent 60%), #030712',
      }}
    >
      {/* Separator from Savings Calculator above */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(157,184,172,0.15), transparent)' }}
      />

      {/* Ledger-line texture */}
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
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{
              borderColor: 'rgba(226,84,63,0.3)',
              background:  'rgba(226,84,63,0.07)',
              color:       CORAL,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CORAL }} />
            For Parents
          </div>

          <h2
            className="font-display font-black text-white mb-4"
            style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', lineHeight: 1.18, letterSpacing: '-0.01em' }}
          >
            How to teach this to a child
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: SAGE }}>
            Every age needs a different hook. These are the conversations that actually land.
          </p>
        </div>

        {/* 2×2 card grid — collapses to 1 column on mobile */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))' }}
        >
          {CARDS.map((card) => (
            <div
              key={card.ages}
              className="relative rounded-[18px] p-7 sm:p-8 text-left overflow-hidden"
              style={{
                background:   PANEL.background,
                border:       `1px solid ${PANEL.border}`,
                borderRadius: PANEL.borderRadius,
              }}
            >
              {/* Left coral accent stripe */}
              <div
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: CORAL, borderRadius: '18px 0 0 18px' }}
              />

              {/* Age badge */}
              <span
                className="inline-block text-xs font-bold tracking-widest mb-4 px-3 py-1.5 rounded-full"
                style={{
                  color:       CORAL,
                  background:  'rgba(226,84,63,0.1)',
                  border:      '1px solid rgba(226,84,63,0.28)',
                  letterSpacing: '0.07em',
                }}
              >
                {card.ages}
              </span>

              {/* Title */}
              <h3
                className="font-display font-black mb-3"
                style={{ fontSize: 'clamp(17px, 2.2vw, 21px)', color: INK_LIGHT, lineHeight: 1.3 }}
              >
                {card.title}
              </h3>

              {/* Body */}
              <p className="text-sm leading-relaxed" style={{ color: SAGE }}>
                {card.body}
              </p>

              {/* Tie-in line (gold, italic) — references sections above this one */}
              {card.tieIn && (
                <p
                  className="mt-3 text-xs leading-relaxed italic"
                  style={{ color: GOLD }}
                >
                  {card.tieIn}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
