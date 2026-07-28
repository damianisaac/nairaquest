import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPlayNaira } from '../../utils/wallet';

interface Props {
  value: number;
  className?: string;
  duration?: number; // ms
}

export default function BalanceTickUp({ value, className = '', duration = 1200 }: Props) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    prevRef.current = value;

    if (value <= prev) {
      setDisplay(value);
      return;
    }

    setFlash(true);
    const diff = value - prev;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        setTimeout(() => setFlash(false), 400);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={flash ? 'flash' : 'normal'}
        className={className}
        animate={flash ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {formatPlayNaira(display)}
      </motion.span>
    </AnimatePresence>
  );
}
