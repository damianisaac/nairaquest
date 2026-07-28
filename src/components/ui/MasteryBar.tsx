import { motion } from 'framer-motion';

interface Props {
  percent: number;
  color: string;
  label?: string;
  showPercent?: boolean;
  height?: string;
}

export default function MasteryBar({ percent, color, label, showPercent = true, height = 'h-3' }: Props) {
  const pct = Math.round(percent * 100);

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-white/60 font-body">{label}</span>}
          {showPercent && <span className="text-xs font-bold" style={{ color }}>{pct}%</span>}
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-white/10 overflow-hidden`}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
