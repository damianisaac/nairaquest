import { motion } from 'framer-motion';

interface Props {
  count?: number;
  originX?: string;
  originY?: string;
  color?: string;
}

export default function CoinBurst({
  count = 16,
  originX = '50%',
  originY = '50%',
  color = '#d4af37',
}: Props) {
  return (
    <div
      className="pointer-events-none fixed z-[200]"
      style={{ left: originX, top: originY, width: 0, height: 0 }}
    >
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360;
        const distance = 60 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;
        const size = 8 + Math.random() * 10;
        const delay = Math.random() * 0.12;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              width: size,
              height: size,
              background: i % 3 === 0 ? color : i % 3 === 1 ? '#f0d060' : '#ffffff',
              top: -size / 2,
              left: -size / 2,
              fontSize: size * 0.7,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: tx,
              y: ty - 20,
              opacity: 0,
              scale: 0.4,
            }}
            transition={{
              duration: 0.9 + Math.random() * 0.3,
              ease: [0.22, 1, 0.36, 1],
              delay,
            }}
          >
            {i % 4 === 0 ? '₦' : ''}
          </motion.div>
        );
      })}
    </div>
  );
}
