import { motion, AnimatePresence } from 'framer-motion';

type MascotMood = 'idle' | 'excited' | 'thinking' | 'sad' | 'celebrating';

interface Props {
  mood?: MascotMood;
  message?: string;
  size?: number;
  className?: string;
}

const moodFaces: Record<MascotMood, string> = {
  idle: '😊',
  excited: '🤩',
  thinking: '🤔',
  sad: '😔',
  celebrating: '🥳',
};

export default function Cowrie({ mood = 'idle', message, size = 64, className = '' }: Props) {
  const face = moodFaces[mood];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        style={{ width: size, height: size, fontSize: size * 0.65 }}
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-naira-gold to-yellow-600 shadow-lg shadow-naira-gold/30"
        animate={
          mood === 'celebrating'
            ? { scale: [1, 1.2, 0.9, 1.15, 1], rotate: [0, -10, 10, -5, 0] }
            : mood === 'excited'
            ? { y: [0, -8, 0, -4, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          mood === 'celebrating'
            ? { duration: 0.8, repeat: Infinity, repeatDelay: 1 }
            : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <span role="img" aria-label={`Cowrie mascot feeling ${mood}`}>
          {face}
        </span>
        {/* Cowrie shell decoration */}
        <div
          className="absolute inset-0 rounded-full border-2 border-naira-gold/40"
          style={{ transform: 'scale(1.1)' }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-xs px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 text-center"
          >
            {/* Speech bubble pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white/20" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
