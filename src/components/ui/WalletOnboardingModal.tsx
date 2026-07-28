import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { WALLET_NAMES, WALLET_DISCLAIMER } from '../../utils/wallet';
import { sound } from './SoundController';

export default function WalletOnboardingModal() {
  const { profile, markWalletDisclaimerSeen } = useGameStore();

  if (!profile) return null;

  const walletName = WALLET_NAMES[profile.ageTrack];

  const handleAccept = () => {
    sound.click();
    markWalletDisclaimerSeen();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="card-glass max-w-sm w-full p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        {/* Icon + title */}
        <div className="text-center mb-5">
          <motion.div
            className="text-5xl mb-3 inline-block"
            animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            {walletName.icon}
          </motion.div>
          <h2 className="font-display text-xl text-naira-gold">
            Your {walletName.title} is Ready!
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Earn Learning Credits as you play
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-2.5 mb-5">
          {[
            { icon: '✅', label: 'Correct answers earn credits' },
            { icon: '🔥', label: 'Streak multiplies your credits' },
            { icon: '🏅', label: 'Badge unlocks give bonus credits' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm text-white/70">
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Legal disclaimer — MANDATORY, verbatim */}
        <div
          className="rounded-xl p-3 mb-5 text-xs leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-1.5">Important Notice</div>
          <p className="text-white/55">{WALLET_DISCLAIMER}</p>
        </div>

        <button
          className="btn-gold w-full"
          onClick={handleAccept}
        >
          Got it — Let's earn credits!
        </button>
      </motion.div>
    </div>
  );
}
