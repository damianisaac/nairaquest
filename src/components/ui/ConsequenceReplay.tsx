import { motion } from 'framer-motion';
import type { ConsequenceReplay as CR } from '../../types';

interface Props {
  replay: CR;
  onDismiss: () => void;
}

export default function ConsequenceReplay({ replay, onDismiss }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        {/* Header */}
        <div className="bg-red-900/80 px-5 py-4 border-b border-red-700/40">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📽️</span>
            <div>
              <h3 className="font-display text-white text-base">Consequence Replay</h3>
              <p className="text-red-300 text-xs">What would have happened...</p>
            </div>
          </div>
        </div>

        {/* Scenario */}
        <div className="bg-gray-900 px-5 py-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">The scenario</p>
            <p className="text-white/90 text-sm leading-relaxed">{replay.scenario}</p>
          </div>

          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">What happened</p>
            <p className="text-red-300 text-sm leading-relaxed">{replay.outcome}</p>
          </motion.div>

          <motion.div
            className="bg-naira-green/10 border border-naira-green/30 rounded-xl p-3 space-y-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs font-bold text-naira-green uppercase tracking-widest">The lesson</p>
            <p className="text-naira-green-light text-sm leading-relaxed">{replay.lesson}</p>
          </motion.div>

          <motion.button
            className="btn-primary w-full mt-2"
            onClick={onDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            Got it — Next Question →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
