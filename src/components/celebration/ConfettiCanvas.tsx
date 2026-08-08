/**
 * ConfettiCanvas — Framer Motion particle confetti.
 * Seeded with useMemo so pieces don't reshuffle on parent re-renders.
 * Respects liteMode (fewer particles, simpler animation).
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { AgeTrack } from '../../types';

const PALETTE: Record<AgeTrack, string[]> = {
  kids: ['#FFD700', '#FF69B4', '#00FF7F', '#FF6347', '#87CEEB', '#FFA07A', '#9370DB', '#00CED1'],
  teens: ['#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff', '#d4af37'],
  adults: ['#d4af37', '#22c55e', '#ffffff', '#c0c0c0', '#d4af37'],
};

type PieceShape = 'circle' | 'square' | 'rect';

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotateEnd: number;
  shape: PieceShape;
  driftX: number;
}

function seedPieces(count: number, ageTrack: AgeTrack): Piece[] {
  const colors = PALETTE[ageTrack];
  // Use deterministic-ish seeding via sine functions so the memo is reproducible
  // but varied enough to look random
  return Array.from({ length: count }, (_, i) => {
    const s = (v: number) => Math.sin(i * v);
    const r = (min: number, max: number, wave: number) =>
      min + ((s(wave) + 1) / 2) * (max - min);
    const shapes: PieceShape[] = ['circle', 'square', 'rect'];
    return {
      id: i,
      left: (i / count) * 100 + s(2.3) * 8,
      delay: r(0, 0.7, 1.9),
      duration: r(1.6, 2.8, 3.1),
      size: r(5, 12, 2.7),
      color: colors[i % colors.length],
      rotateEnd: s(1.3) * 540,
      shape: shapes[i % 3],
      driftX: s(2.1) * 80,
    };
  });
}

interface Props {
  count?: number;
  ageTrack?: AgeTrack;
  lite?: boolean;
}

export default function ConfettiCanvas({ count = 60, ageTrack = 'adults', lite = false }: Props) {
  const actualCount = lite ? Math.max(10, Math.floor(count * 0.28)) : count;
  const pieces = useMemo(() => seedPieces(actualCount, ageTrack), [actualCount, ageTrack]);

  const screenH = typeof window !== 'undefined' ? window.innerHeight + 60 : 900;

  return (
    <div className="fixed inset-0 pointer-events-none z-[55]" aria-hidden="true">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: -16,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.4 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            background: p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, x: 0 }}
          animate={
            lite
              ? { y: screenH, opacity: [1, 1, 0] }
              : {
                  y: screenH,
                  opacity: [1, 1, 1, 0],
                  rotate: p.rotateEnd,
                  x: p.driftX,
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: lite ? 'linear' : [0.1, 0.6, 0.9, 1],
          }}
        />
      ))}
    </div>
  );
}
