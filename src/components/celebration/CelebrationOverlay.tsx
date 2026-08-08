/**
 * CelebrationOverlay — data-driven, tiered celebration system.
 *
 * Tier 2 (every session): brief card, 2.5 s auto-dismiss, skippable after 1.2 s
 * Tier 3 (zone mastery):  bigger card, animated mastery bar, badge reveal, 5 s
 * Tier 4 (tier milestone): full-screen takeover, 6 s, share button
 *
 * Respects liteMode (fewer particles, simpler animation) and
 * accessibilityMode (speaks headline + subline via TTS).
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useAccessibility } from '../../hooks/useAccessibility';
import { formatPlayNaira } from '../../utils/wallet';
import Cowrie from '../mascot/Cowrie';
import ConfettiCanvas from './ConfettiCanvas';
import { sound } from '../ui/SoundController';
import type { CelebrationConfig } from '../../utils/celebration';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  config: CelebrationConfig;
  onDismiss: () => void;
}

// ─── Animated mastery bar (shows fill from `from` to `to`) ───────────────────

function AnimatedMasteryBar({
  from,
  to,
  color,
}: {
  from: number;
  to: number;
  color: string;
}) {
  const fromPct = Math.round(from * 100);
  const toPct = Math.round(to * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/40">{fromPct}% before</span>
        <span className="font-bold" style={{ color }}>
          {toPct}% now
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: `${fromPct}%` }}
          animate={{ width: `${toPct}%` }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.6 }}
        />
      </div>
      {toPct >= 80 && (
        <motion.p
          className="text-xs mt-1.5 text-center font-semibold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          ✓ Zone mastered!
        </motion.p>
      )}
    </div>
  );
}

// ─── Badge reveal card ────────────────────────────────────────────────────────

function BadgeReveal({ badges }: { badges: CelebrationConfig['newBadges'] }) {
  if (badges.length === 0) return null;
  return (
    <motion.div
      className="mt-4 space-y-2"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.8, type: 'spring', stiffness: 260, damping: 20 }}
    >
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)',
            border: '1px solid rgba(212,175,55,0.35)',
          }}
        >
          <span className="text-3xl">{badge.emoji}</span>
          <div className="text-left">
            <p className="text-naira-gold font-bold text-sm">{badge.name}</p>
            <p className="text-white/50 text-xs leading-snug">{badge.description}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Share button (Tier 4) ────────────────────────────────────────────────────

function ShareButton({ copy }: { copy: string }) {
  const [shared, setShared] = useState(false);
  const handleShare = async () => {
    sound.click();
    if (navigator.share) {
      await navigator.share({ title: 'NairaQuest', text: copy });
      setShared(true);
    } else {
      await navigator.clipboard.writeText(copy);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };
  return (
    <motion.button
      onClick={handleShare}
      className="mt-3 w-full py-3 rounded-2xl font-bold text-sm transition-all"
      style={{
        background: shared ? 'rgba(34,197,94,0.2)' : 'rgba(212,175,55,0.2)',
        border: `1px solid ${shared ? '#22c55e60' : '#d4af3760'}`,
        color: shared ? '#22c55e' : '#d4af37',
      }}
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.5 }}
    >
      {shared ? '✓ Copied / Shared!' : '📤 Share this achievement'}
    </motion.button>
  );
}

// ─── Kids confetti flourish (extra ring of emoji around mascot) ───────────────

function KidsRing({ active }: { active: boolean }) {
  const emojis = ['⭐', '🌟', '💰', '🎊', '🏅', '🎉', '✨', '🐚'];
  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {emojis.map((e, i) => {
        const angle = (i / emojis.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const r = 68;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        return (
          <motion.span
            key={i}
            className="absolute text-xl select-none"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={
              active
                ? { x, y, opacity: 1, scale: [0, 1.3, 1], rotate: [0, 20, -10, 0] }
                : { x: 0, y: 0, opacity: 0, scale: 0 }
            }
            transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
          >
            {e}
          </motion.span>
        );
      })}
      {/* Mascot sits in center */}
    </div>
  );
}

// ─── Tier 4 background treatment ─────────────────────────────────────────────

function Tier4Background({ color }: { color: string }) {
  return (
    <>
      {/* Radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${color}22 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      {/* Pulsing border glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: `inset 0 0 80px ${color}18` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

export default function CelebrationOverlay({ config, onDismiss }: Props) {
  const { liteMode, accessibilityMode } = useGameStore();
  const { speak } = useAccessibility(accessibilityMode);

  const [canDismiss, setCanDismiss] = useState(false);
  const [visible, setVisible] = useState(true);
  const dismissCalledRef = useRef(false);

  const doClose = () => {
    if (dismissCalledRef.current) return;
    dismissCalledRef.current = true;
    setVisible(false);
    // Delay to allow exit animation
    setTimeout(onDismiss, 350);
  };

  // Enable tap-to-skip after minDismissMs
  useEffect(() => {
    const t = setTimeout(() => setCanDismiss(true), config.minDismissMs);
    return () => clearTimeout(t);
  }, [config.minDismissMs]);

  // Auto-dismiss after durationMs
  useEffect(() => {
    const t = setTimeout(doClose, config.durationMs);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.durationMs]);

  // Play celebration sound on mount
  useEffect(() => {
    if (config.tier === 4) {
      sound.milestone();
    } else if (config.tier === 3) {
      sound.zoneMastered();
    } else {
      sound.sessionComplete(config.isPerfect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accessibility: speak headline + subline
  useEffect(() => {
    if (!accessibilityMode) return;
    const timer = setTimeout(() => {
      speak(`${config.headline}. ${config.subline}. ${
        config.newBadges.length > 0 ? `New badge: ${config.newBadges[0].name}.` : ''
      }`);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessibilityMode, config.headline]);

  // ── Mastery bar: only show for Tier 3+
  const showMasteryBar = config.tier >= 3;

  // ── Credits label
  const creditsLabel = useMemo(() => {
    if (config.isPracticeMode || config.creditsEarned <= 0) return null;
    return `+${formatPlayNaira(config.creditsEarned)}`;
  }, [config.creditsEarned, config.isPracticeMode]);

  // ── Track-specific accent color for adults overlay border
  const cardBorderStyle: React.CSSProperties = config.ageTrack === 'adults'
    ? { border: '1px solid rgba(212,175,55,0.25)' }
    : config.ageTrack === 'teens'
    ? { border: '1px solid rgba(139,92,246,0.35)' }
    : { border: '1px solid rgba(255,255,255,0.2)' };

  // ── Mascot mood
  const mascotMood = config.tier === 4 ? 'celebrating'
    : config.tier === 3 ? 'celebrating'
    : config.isPerfect ? 'celebrating'
    : 'excited';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-5"
          style={{
            background: config.ageTrack === 'adults'
              ? 'rgba(5,5,5,0.94)'
              : config.ageTrack === 'teens'
              ? 'rgba(10,1,24,0.94)'
              : 'rgba(2,14,6,0.94)',
            backdropFilter: 'blur(6px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => canDismiss && doClose()}
          role="dialog"
          aria-modal="true"
          aria-label={config.headline}
        >
          {/* Tier 4 background glow */}
          {config.tier === 4 && <Tier4Background color={config.categoryColor} />}

          {/* Confetti — behind the card */}
          <ConfettiCanvas
            count={config.confettiCount}
            ageTrack={config.ageTrack}
            lite={liteMode}
          />

          {/* ── Card ── */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-4 overflow-hidden"
            style={{
              background:
                config.ageTrack === 'adults'
                  ? 'linear-gradient(160deg, rgba(20,20,20,0.98) 0%, rgba(5,5,5,0.98) 100%)'
                  : config.ageTrack === 'teens'
                  ? 'linear-gradient(160deg, rgba(20,5,40,0.98) 0%, rgba(10,1,24,0.98) 100%)'
                  : 'linear-gradient(160deg, rgba(5,25,10,0.98) 0%, rgba(2,14,6,0.98) 100%)',
              ...cardBorderStyle,
              boxShadow:
                config.tier === 4
                  ? `0 0 60px ${config.categoryColor}22, 0 20px 60px rgba(0,0,0,0.7)`
                  : '0 20px 60px rgba(0,0,0,0.7)',
            }}
            initial={
              liteMode
                ? { opacity: 0, scale: 0.98 }
                : config.tier === 4
                ? { scale: 0.7, opacity: 0, rotate: -2 }
                : { scale: 0.85, opacity: 0, y: 24 }
            }
            animate={
              liteMode
                ? { opacity: 1, scale: 1 }
                : { scale: 1, opacity: 1, y: 0, rotate: 0 }
            }
            transition={
              liteMode
                ? { duration: 0.3 }
                : { type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }
            }
          >
            {/* Kids: emoji ring + mascot in center */}
            {config.ageTrack === 'kids' && (config.tier >= 3 || config.isPerfect) ? (
              <div className="relative flex items-center justify-center mb-1" style={{ minHeight: 100 }}>
                <KidsRing active={!liteMode} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cowrie mood={mascotMood} size={64} />
                </div>
              </div>
            ) : (
              <Cowrie mood={mascotMood} size={config.tier === 4 ? 72 : 56} />
            )}

            {/* Category emoji for Tier 3/4 */}
            {config.tier >= 3 && (
              <motion.div
                className="text-5xl"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.3 }}
              >
                {config.categoryEmoji}
              </motion.div>
            )}

            {/* Headline */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2
                className="font-display leading-tight"
                style={{
                  fontSize: config.tier === 4 ? '1.5rem' : '1.25rem',
                  color:
                    config.ageTrack === 'adults'
                      ? '#d4af37'
                      : config.ageTrack === 'teens'
                      ? '#a78bfa'
                      : '#ffffff',
                }}
              >
                {config.headline}
              </h2>
              <p className="text-white/60 text-sm mt-1.5 leading-snug">{config.subline}</p>
            </motion.div>

            {/* Tier 2: quick stats strip */}
            {config.tier === 2 && (
              <motion.div
                className="w-full grid grid-cols-3 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="card-glass p-2.5 text-center rounded-xl">
                  <div className="font-display text-base text-white">
                    {Math.round(config.accuracy * 100)}%
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">Accuracy</div>
                </div>
                {creditsLabel ? (
                  <div className="card-glass p-2.5 text-center rounded-xl">
                    <div className="font-display text-base text-naira-gold">{creditsLabel}</div>
                    <div className="text-xs text-white/40 mt-0.5">Credits</div>
                  </div>
                ) : (
                  <div className="card-glass p-2.5 text-center rounded-xl opacity-40">
                    <div className="font-display text-base text-white/50">—</div>
                    <div className="text-xs text-white/30 mt-0.5">Credits</div>
                  </div>
                )}
                <div className="card-glass p-2.5 text-center rounded-xl">
                  <div className="font-display text-base text-orange-400">
                    {config.streak > 0 ? `${config.streak}🔥` : '—'}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">Streak</div>
                </div>
              </motion.div>
            )}

            {/* Streak callout for Tier 2 */}
            {config.tier === 2 && config.streak >= 2 && (
              <motion.p
                className="text-xs text-orange-300 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                {config.streak}-day streak 🔥
                {config.streak < 7 ? ` — ${7 - config.streak} more for a big bonus!` : ' — streak bonus maxed! 🎯'}
              </motion.p>
            )}

            {/* Tier 3: mastery bar + credits + badges */}
            {config.tier >= 3 && (
              <motion.div
                className="w-full space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <AnimatedMasteryBar
                  from={config.masteryBefore}
                  to={config.masteryAfter}
                  color={config.categoryColor}
                />
                {creditsLabel && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm text-white/50">Total credits earned</span>
                    <span className="font-display text-naira-gold text-lg">{creditsLabel}</span>
                  </div>
                )}
                <BadgeReveal badges={config.newBadges} />
              </motion.div>
            )}

            {/* Tier 4: milestone details + share */}
            {config.tier === 4 && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div
                  className="rounded-2xl p-3 text-center mb-2"
                  style={{
                    background: `${config.categoryColor}12`,
                    border: `1px solid ${config.categoryColor}30`,
                  }}
                >
                  <p className="text-xs text-white/40 mb-0.5 uppercase tracking-widest">
                    {config.tierLabel ?? 'Milestone'} Complete
                  </p>
                  <p className="text-sm text-white/80 font-semibold leading-snug">
                    {config.milestoneLabel}
                  </p>
                </div>

                {config.shareCopy && <ShareButton copy={config.shareCopy} />}
              </motion.div>
            )}

            {/* Tap to continue hint (appears after minDismissMs) */}
            <AnimatePresence>
              {canDismiss && (
                <motion.p
                  className="text-xs text-white/30 text-center mt-1 select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  Tap anywhere to continue →
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
