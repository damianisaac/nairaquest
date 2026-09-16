import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import QuickQuestion from '../components/landing/QuickQuestion';
import SavingsCalculator from '../components/landing/SavingsCalculator';
import ForParents from '../components/landing/ForParents';
import type { AgeTrack } from '../types';

type OnboardingTrack = AgeTrack | 'teacher';

const AGE_TRACKS: {
  id: OnboardingTrack; label: string; emoji: string;
  hook: string; color: string; dark: string;
}[] = [
  { id: 'kids',    label: 'Kids',    emoji: '🌟', hook: 'Fun zones, earn stars',        color: '#22c55e', dark: '#14532d' },
  { id: 'teens',   label: 'Teens',   emoji: '🚀', hook: 'Level up, beat the board',     color: '#a78bfa', dark: '#3b0764' },
  { id: 'adults',  label: 'Adults',  emoji: '💼', hook: 'Investing, loans, tax & more', color: '#d4af37', dark: '#78350f' },
  { id: 'teacher', label: 'Teacher', emoji: '🏫', hook: 'Manage class & track students',color: '#38bdf8', dark: '#0c4a6e' },
];

// ─── Onboarding modal ─────────────────────────────────────────────────────────
function OnboardingModal({
  onClose: _onClose,
  defaultTrack = 'adults',
}: {
  onClose: () => void;
  defaultTrack?: OnboardingTrack;
}) {
  const [name, setName] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<OnboardingTrack>(defaultTrack);
  const { createProfile } = useGameStore();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name.trim()) return;
    sound.levelUp();
    if (selectedTrack === 'teacher') { navigate('/auth?role=teacher'); return; }
    const ageTrack = selectedTrack as AgeTrack;
    createProfile(name.trim(), ageTrack, 'general');
    if (selectedTrack === 'kids') navigate('/kids');
    else if (selectedTrack === 'teens') navigate('/teens');
    else navigate('/adults');
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md card-glass p-6 space-y-5"
        initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-center">
          <motion.div className="text-5xl mb-3"
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
            🐚
          </motion.div>
          <h2 className="font-display text-2xl text-white">Welcome, Explorer!</h2>
          <p className="text-white/55 text-sm mt-1">Set up your adventure profile</p>
        </div>

        <div>
          <label className="block text-xs text-white/55 mb-2 font-semibold">What should we call you?</label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-naira-green transition-colors"
            placeholder="Your name or nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            maxLength={24}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs text-white/55 mb-2.5 font-semibold">Choose your adventure track:</label>
          <div className="grid grid-cols-2 gap-2">
            {AGE_TRACKS.map((track) => {
              const active = selectedTrack === track.id;
              return (
                <motion.button
                  key={track.id}
                  onClick={() => { setSelectedTrack(track.id); sound.click(); }}
                  className="relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left overflow-hidden"
                  style={{
                    borderColor: active ? track.color : 'rgba(255,255,255,0.1)',
                    background: active
                      ? `linear-gradient(135deg, ${track.dark}80, ${track.color}18)`
                      : 'rgba(255,255,255,0.04)',
                    boxShadow: active ? `0 0 16px ${track.color}30` : 'none',
                  }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{track.emoji}</span>
                  <div className="font-black text-sm text-white">{track.label}</div>
                  <div className="text-xs leading-tight" style={{ color: active ? track.color + 'cc' : 'rgba(255,255,255,0.4)' }}>
                    {track.hook}
                  </div>
                  {active && (
                    <motion.div
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: track.color }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.button
          className="btn-gold w-full"
          onClick={handleStart}
          disabled={!name.trim()}
          style={{ opacity: name.trim() ? 1 : 0.45, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
          whileHover={name.trim() ? { scale: 1.02 } : {}}
          whileTap={name.trim() ? { scale: 0.98 } : {}}
        >
          Enter the Adventure →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { profile } = useGameStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [defaultTrack, setDefaultTrack] = useState<OnboardingTrack>('adults');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('onboard') === '1' && !profile) {
      setShowOnboarding(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, profile, setSearchParams]);

  // Scrolling is intentionally enabled — the Quick Question section lives below the hero.

  const trackRoute = (track: AgeTrack) =>
    track === 'kids' ? '/kids' : track === 'teens' ? '/teens' : '/adults';

  const handleCTA = () => {
    sound.click();
    if (profile) navigate(trackRoute(profile.ageTrack));
    else setShowOnboarding(true);
  };

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  return (
    <div className="bg-gray-950 ankara-bg">
      <TopNav />

      {/*
        ── Hero: Lagos street video background ──────────────────────────────────
        Performance note: /public/nairaquestbanner.mp4 should be compressed
        before shipping (target ≤ 4 MB, H.264 + AAC, 1280×720 or lower).
        A separate WebM/VP9 version improves load times on Chrome/Firefox.
        Consider a 480p mobile version served via <source media="…">.
      */}
      <section
        className="relative h-screen flex flex-col overflow-hidden"
        style={{ background: '#BFE0F2' }}
      >
        {/* Video — hidden when prefers-reduced-motion is set */}
        {!reduceMotion ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/banner.jpeg"
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
          >
            {/* Mobile: 480p H.264 — 320 KB */}
            <source src="/nairaquestbanner-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            {/* Desktop: VP9/WebM — 2.5 MB (Chrome/Firefox/Edge) */}
            <source src="/nairaquestbanner.webm" type="video/webm" />
            {/* Desktop: H.264 fallback — 3.5 MB (Safari) */}
            <source src="/nairaquestbanner.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Reduced-motion fallback: static sky gradient, no autoplay */
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, #7FC4E8 0%, #CDEAF6 78%)' }}
          />
        )}

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col items-center text-center px-6">

          {/* Headline — pushed down into the sky */}
          <motion.div
            className="w-full max-w-2xl mx-auto pt-44 sm:pt-52"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1
              className="font-display font-bold leading-tight"
              style={{
                fontSize: 'clamp(26px, 4.4vw, 50px)',
                letterSpacing: '-0.01em',
                color: '#2A1D12',
                textShadow: '0 2px 20px rgba(255,255,255,0.6)',
              }}
            >
              MASTER THE GAME BEHIND THE MONEY
            </h1>
          </motion.div>

          {/* Spacer — pushes bottom content past the midpoint */}
          <div className="flex-1 min-h-[32px]" />

          {/* Subtext + CTA — frosted card in the lower half of the hero */}
          <motion.div
            className="w-full max-w-md mx-auto mb-10 rounded-2xl px-7 py-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: '0 8px 40px rgba(42,29,18,0.14)',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p
              className="mb-7"
              style={{
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                lineHeight: 1.7,
                color: '#2A1D12',
              }}
            >
              Put your financial IQ to the test, unlock new topics, build streaks, and turn what you learn into smarter financial decisions.
            </p>

            {/* CTA */}
            <AnimatePresence mode="wait">
              {profile ? (
                <motion.div
                  key="returning"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.button
                    onClick={handleCTA}
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base"
                    style={{ background: '#2A1D12', color: '#FBF6E9', boxShadow: '0 14px 30px -12px rgba(42,29,18,0.45)' }}
                    whileHover={{ y: -2, boxShadow: '0 18px 34px -12px rgba(42,29,18,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Continue Quest →
                  </motion.button>
                  <span className="text-sm font-semibold" style={{ color: '#4A3A28' }}>
                    Welcome back, {profile.name}!
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="new"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.button
                    onClick={handleCTA}
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base"
                    style={{ background: '#2A1D12', color: '#FBF6E9', boxShadow: '0 14px 30px -12px rgba(42,29,18,0.45)' }}
                    whileHover={{ y: -2, boxShadow: '0 18px 34px -12px rgba(42,29,18,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Start Your Quest
                  </motion.button>
                  <motion.button
                    onClick={() => { sound.click(); navigate('/auth'); }}
                    className="text-xs font-semibold"
                    style={{ color: '#6A5A48', background: 'none', border: 'none', cursor: 'pointer' }}
                    whileHover={{ color: '#2A1D12' } as Record<string, string>}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Already have an account? <span style={{ color: '#2A1D12', fontWeight: 700 }}>Sign in →</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="relative z-10 pb-5 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: 'rgba(42,29,18,0.4)' }}>Scroll</span>
          <motion.div
            style={{ color: 'rgba(42,29,18,0.35)' }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Quick Question section ── */}
      <QuickQuestion />

      {/* ── Savings Calculator section ── */}
      <SavingsCalculator />

      {/* ── For Parents section ── */}
      <ForParents />

      {/* ── Footer ── */}
      <footer className="bg-gray-950 pb-6 pt-4 text-center border-t border-white/5">
        <p className="text-white/30 text-xs px-4">
          © 2026 NairaQuest 🇳🇬 · Powered by{' '}
          <a href="https://teenscancode.com.ng" target="_blank" rel="noopener noreferrer"
            className="text-naira-green/60 hover:text-naira-green transition-colors underline underline-offset-2">
            Teens Can Code
          </a>
          {' '}· Educational content only. Consult a licensed financial advisor for personal decisions.
        </p>
      </footer>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal
            onClose={() => setShowOnboarding(false)}
            defaultTrack={defaultTrack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
