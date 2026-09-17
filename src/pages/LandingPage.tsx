import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import QuickQuestion from '../components/landing/QuickQuestion';
import AudienceSection from '../components/landing/AudienceSection';
import SavingsCalculator from '../components/landing/SavingsCalculator';
import ForParents from '../components/landing/ForParents';
import type { AgeTrack } from '../types';

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { profile } = useGameStore();
  const navigate = useNavigate();

  const trackRoute = (track: AgeTrack) =>
    track === 'kids' ? '/kids' : track === 'teens' ? '/teens' : '/adults';

  const handleCTA = () => {
    sound.click();
    if (profile) navigate(trackRoute(profile.ageTrack));
    else navigate('/auth');
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
          <div className="flex-1 min-h-[110px]" />

          {/* Subtext + CTA — frosted card in the lower half of the hero */}
          <motion.div
            className="w-full max-w-lg mx-auto mb-8 rounded-2xl px-9 pt-5 pb-7 text-center"
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
              className="mb-7 font-semibold"
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

      {/* ── Audience / Tier section ── */}
      <AudienceSection />

      {/* ── Quick Question section ── */}
      <QuickQuestion />

      {/* ── Savings Calculator section ── */}
      <SavingsCalculator />

      {/* ── For Parents section ── */}
      <ForParents />

      {/* ── Footer ── */}
      <footer className="bg-gray-950 pb-6 pt-4 text-center border-t border-white/5">
        <p className="text-white/50 text-xs px-4 font-semibold">
          © 2026 NairaQuest 🇳🇬 · Powered by{' '}
          <a href="https://teenscancode.com.ng" target="_blank" rel="noopener noreferrer"
            className="text-naira-green/70 hover:text-naira-green transition-colors underline underline-offset-2">
            Teens Can Code
          </a>
          {' '}· Educational content only. Consult a licensed financial advisor for personal decisions. ·{' '}
          <a href="/privacy" className="text-naira-green/70 hover:text-naira-green transition-colors underline underline-offset-2">
            Trust &amp; Safety
          </a>
        </p>
      </footer>

    </div>
  );
}
