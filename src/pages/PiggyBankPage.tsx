import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import { formatFullNaira, WALLET_DISCLAIMER } from '../utils/wallet';

// ─── Piggy bank fill animation ────────────────────────────────────────────────

function PiggyFill({ percent }: { percent: number }) {
  // Clamp percent to [0, 100]
  const pct = Math.max(0, Math.min(100, percent));
  // SVG piggy silhouette — simplified circular body
  const fillY = 160 - (pct / 100) * 160;

  return (
    <div className="flex justify-center my-6">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <defs>
            <clipPath id="piggy-clip">
              {/* Body */}
              <circle cx="90" cy="100" r="65" />
            </clipPath>
            <linearGradient id="piggy-fill-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient id="piggy-empty" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          {/* Body outline */}
          <circle cx="90" cy="100" r="65" fill="url(#piggy-empty)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

          {/* Water fill (clipped) */}
          <g clipPath="url(#piggy-clip)">
            <motion.rect
              x="20" y={fillY}
              width="140" height="180"
              fill="url(#piggy-fill-grad)"
              initial={{ y: 180 }}
              animate={{ y: fillY }}
              transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
              opacity="0.85"
            />
            {/* Wave on top of fill */}
            <motion.ellipse
              cx="90" cy={fillY}
              rx="70" ry="6"
              fill="rgba(255,255,255,0.15)"
              animate={{ rx: [70, 65, 70], cy: [fillY - 2, fillY + 2, fillY - 2] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </g>

          {/* Ear */}
          <ellipse cx="130" cy="48" rx="16" ry="12" fill="rgba(249,115,22,0.6)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Eye */}
          <circle cx="110" cy="80" r="5" fill="rgba(0,0,0,0.5)" />
          <circle cx="111" cy="79" r="1.5" fill="rgba(255,255,255,0.6)" />

          {/* Snout */}
          <ellipse cx="120" cy="105" rx="14" ry="10" fill="rgba(0,0,0,0.2)" />
          <circle cx="115" cy="104" r="3" fill="rgba(0,0,0,0.4)" />
          <circle cx="125" cy="104" r="3" fill="rgba(0,0,0,0.4)" />

          {/* Coin slot */}
          <rect x="68" y="35" width="24" height="5" rx="2.5" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Legs */}
          {[40, 60, 110, 130].map((x, i) => (
            <rect key={i} x={x} y="158" width="12" height="22" rx="6" fill="rgba(249,115,22,0.5)" />
          ))}

          {/* Tail */}
          <path d="M 28 95 Q 10 85 18 70 Q 25 58 35 68" fill="none" stroke="rgba(249,115,22,0.6)" strokeWidth="5" strokeLinecap="round" />
        </svg>

        {/* Percent label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="font-display text-3xl text-white drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {Math.round(pct)}%
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PiggyBankPage() {
  const navigate = useNavigate();
  const { profile } = useGameStore();

  if (!profile) {
    navigate('/');
    return null;
  }

  if (profile.ageTrack !== 'kids') {
    navigate('/wallet');
    return null;
  }

  // Fill percent: 0 at ₦0, 100% at ₦50,000 (fun milestone for kids)
  const milestoneTarget = 50_000;
  const fillPct = Math.min(100, (profile.walletBalance / milestoneTarget) * 100);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f9731620 0%, #030712 40%)' }}>
      <TopNav />
      <main className="pt-20 pb-10 px-4 max-w-sm mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl text-white mb-1">🐷 My Piggy Bank</h1>
          <p className="text-white/40 text-sm">Learning Credits — Play Naira</p>
        </motion.div>

        <PiggyFill percent={fillPct} />

        {/* Big number */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 250 }}
        >
          <div className="font-display text-5xl text-orange-400 mb-1">
            {formatFullNaira(profile.walletBalance)}
          </div>
          <div className="text-white/40 text-sm">saved so far!</div>
        </motion.div>

        {/* Progress to milestone */}
        <motion.div
          className="card-glass p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-sm text-white/60 mb-3">
            🎯 Goal: {formatFullNaira(milestoneTarget)}
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f97316 0%, #fbbf24 100%)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-2">
            <span>₦0</span>
            <span>{formatFullNaira(milestoneTarget)}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="card-glass p-3 text-center">
            <div className="font-display text-2xl text-orange-400">{profile.walletTransactions.length}</div>
            <div className="text-xs text-white/40 mt-0.5">Credits earned</div>
          </div>
          <div className="card-glass p-3 text-center">
            <div className="font-display text-2xl text-orange-400">{profile.dailyStreak}🔥</div>
            <div className="text-xs text-white/40 mt-0.5">Day streak</div>
          </div>
        </motion.div>

        <button
          className="btn-primary w-full"
          onClick={() => navigate('/map')}
        >
          Keep Learning →
        </button>

        {/* Disclaimer — always visible, required */}
        <div className="mt-6 text-xs text-white/20 leading-relaxed px-2">
          {WALLET_DISCLAIMER}
        </div>
      </main>
    </div>
  );
}
