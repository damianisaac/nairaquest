import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { sound } from './SoundController';

type TabId = 'about' | 'why' | 'founders' | 'join';

const TABS: { id: TabId; label: string; short: string }[] = [
  { id: 'about',    label: 'About',            short: 'About'   },
  { id: 'why',      label: 'Why We Built This', short: 'Why'     },
  { id: 'founders', label: 'Founders',          short: 'Team'    },
  { id: 'join',     label: 'Join the Quest',    short: 'Join'    },
];

function AboutContent() {
  return (
    <div className="space-y-5 text-white/70 text-base leading-relaxed">
      <h2 className="font-display text-2xl sm:text-3xl text-naira-green">
        Where Learning Money Feels Like an Adventure
      </h2>
      <p>
        Welcome to NairaQuest, Nigeria's most exciting way to learn financial literacy.
      </p>
      <p>
        We believe money smarts shouldn't be boring — and they definitely shouldn't wait until adulthood to be taught. So we built a world where saving, budgeting, spotting scams, and understanding how money really works feel less like a lesson and more like a game you can't put down.
      </p>
      <p>
        Explore vibrant zones built around real Nigerian money life — from the everyday basics of naira and savings, to banking and mobile money, to the sharper skills of investing, credit, and spotting a scam before it spots you. Answer questions, level up, earn badges, build your streak, and watch your very own NairaQuest wallet grow as your knowledge grows.
      </p>
      <p>
        Whether you're a kid taking your first steps with a piggy bank, a teen managing your first allowance and mobile wallet, or an adult navigating loans, inflation, and investing — there's a track built for you, at a pace that respects where you are.
      </p>
    </div>
  );
}

function WhyContent() {
  return (
    <div className="space-y-5 text-white/70 text-base leading-relaxed">
      <h2 className="font-display text-2xl sm:text-3xl text-naira-green">
        Why We Built This
      </h2>
      <p>
        Financial literacy is one of the biggest gaps in how young Nigerians are prepared for the real world — and one of the most overlooked. Too many people learn how money actually works the hard way: through a scam, a bad loan, or a missed opportunity to save.
      </p>
      <p>
        We wanted to get ahead of that — by making the right lessons the fun ones, the ones kids beg to keep playing, and the ones families and classrooms come back to together.
      </p>
      <div className="mt-6 p-5 rounded-2xl border border-naira-green/20 bg-naira-green/5">
        <p className="text-white/80 font-medium italic text-center text-base sm:text-lg">
          "Turn financial education into something people <span className="text-naira-green">choose</span> to do — not something they're told to do."
        </p>
        <p className="text-white/40 text-sm text-center mt-2">— The NairaQuest Mission</p>
      </div>
    </div>
  );
}

function FoundersContent() {
  return (
    <div className="space-y-5 text-white/70 text-base leading-relaxed">
      <h2 className="font-display text-2xl sm:text-3xl text-naira-green">
        Who's Behind NairaQuest
      </h2>
      <p>NairaQuest is proudly built through a partnership between:</p>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🛡️</span>
            <h3 className="font-display text-white text-base">VirtuallySafe.org</h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            An organization dedicated to protecting and empowering young people in digital spaces — bringing deep expertise in youth safety, digital wellbeing, and building experiences that put young users first.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-naira-gold/20 bg-naira-gold/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💻</span>
            <h3 className="font-display text-white text-base">Teens Can Code</h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            A program equipping young Nigerians with real technical skills — embodying the belief that teens shouldn't just consume technology, they should build it. Their energy and technical craft power the adventure you're playing right now.
          </p>
        </div>
      </div>

      <p className="text-white/50 text-sm">
        Together, we're combining safety, purpose, and genuine technical talent to build something Nigeria — and young people everywhere — deserve: a fun, trustworthy place to grow smarter about money.
      </p>
    </div>
  );
}

function JoinContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 text-white/70 text-base leading-relaxed">
      <h2 className="font-display text-2xl sm:text-3xl text-naira-green">
        Join the Quest
      </h2>
      <p>
        Every question you answer is a step toward real financial confidence. So pick your track, step into your first zone, and start your quest — your wallet (and your future self) will thank you.
      </p>
      <p className="text-white/50">
        Ready to play? Your adventure starts now.
      </p>

      {/* Decorative coins */}
      <div className="flex justify-center gap-4 py-4">
        {['🪙','💰','🏆','⭐','🎯'].map((e, i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.2, ease: 'easeInOut' }}
          >
            {e}
          </motion.span>
        ))}
      </div>

      <motion.button
        className="btn-gold w-full text-base py-4 mt-2"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          sound.click();
          onClose();
          navigate('/');
        }}
      >
        Start Playing →
      </motion.button>
    </div>
  );
}

const TAB_COMPONENTS: Record<TabId, (props: { onClose: () => void }) => JSX.Element> = {
  about:    () => <AboutContent />,
  why:      () => <WhyContent />,
  founders: () => <FoundersContent />,
  join:     ({ onClose }) => <JoinContent onClose={onClose} />,
};

export default function AboutModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const directionRef = useRef(1);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleTabChange = (id: TabId) => {
    sound.click();
    const newIdx = TABS.findIndex(t => t.id === id);
    const curIdx = TABS.findIndex(t => t.id === activeTab);
    directionRef.current = newIdx > curIdx ? 1 : -1;
    setActiveTab(id);
  };

  const TabContent = TAB_COMPONENTS[activeTab];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full sm:max-w-2xl h-[96vh] sm:h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #030712 0%, rgba(21,128,61,0.07) 100%)',
          border: '1px solid rgba(34,197,94,0.18)',
          boxShadow: '0 0 80px rgba(34,197,94,0.08), 0 25px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-5 pb-4">
          <motion.span
            className="text-3xl select-none"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          >
            🐚
          </motion.span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg text-white leading-tight">NairaQuest</p>
            <p className="text-sm text-naira-green/70 truncate">Nigeria's #1 Financial Literacy Game</p>
          </div>
          {/* Decorative corner sparkles */}
          <span className="hidden sm:block text-naira-gold/30 text-lg select-none">✦</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/15 hover:text-white transition-all text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex-shrink-0 flex gap-1 px-4 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2.5 px-1 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'text-naira-green'
                  : 'text-white/35 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl bg-naira-green/15 border border-naira-green/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative hidden sm:block">{tab.label}</span>
              <span className="relative sm:hidden">{tab.short}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex-shrink-0 h-px bg-white/8 mx-4" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              className="px-5 py-5 sm:px-6 sm:py-6"
              initial={{ opacity: 0, x: directionRef.current * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: directionRef.current * -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <TabContent onClose={onClose} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
