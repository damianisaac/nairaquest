import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { AgeTrack, UserRole } from '../types';

const HeroScene = lazy(() => import('../components/3d/HeroScene'));

type OnboardingTrack = AgeTrack | 'teacher';

const AGE_TRACKS: { id: OnboardingTrack; label: string; emoji: string; desc: string; color: string }[] = [
  {
    id: 'kids',
    label: 'Kids',
    emoji: '🌟',
    desc: 'Ages 6–12 · Fun, colorful, no penalties',
    color: '#22c55e',
  },
  {
    id: 'teens',
    label: 'Teens',
    emoji: '🚀',
    desc: 'Ages 13–17 · Compete, badge up, level up',
    color: '#8b5cf6',
  },
  {
    id: 'adults',
    label: 'Adults',
    emoji: '💼',
    desc: 'Full financial mastery · Investing, loans, tax',
    color: '#d4af37',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    emoji: '👨‍🏫',
    desc: 'Set up a classroom, assign zones, track students',
    color: '#0ea5e9',
  },
];


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
    // Teachers must create a cloud account — local guest profiles can't
    // manage classes or share class codes with students.
    if (selectedTrack === 'teacher') {
      navigate('/auth?role=teacher');
      return;
    }
    const ageTrack: AgeTrack = selectedTrack as AgeTrack;
    createProfile(name.trim(), ageTrack, 'general');
    if (selectedTrack === 'kids') navigate('/kids');
    else if (selectedTrack === 'teens') navigate('/teens');
    else navigate('/adults');
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md card-glass p-6 space-y-6"
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-center">
          <motion.div
            className="text-5xl mb-3"
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            🐚
          </motion.div>
          <h2 className="font-display text-2xl text-white">Welcome, Explorer!</h2>
          <p className="text-white/60 text-sm mt-1">Let's set up your adventure profile</p>
        </div>

        {/* Name input */}
        <div>
          <label className="block text-sm text-white/60 mb-2">What should we call you?</label>
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

        {/* Age track */}
        <div>
          <label className="block text-sm text-white/60 mb-3">Choose your adventure track:</label>
          <div className="space-y-2">
            {AGE_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => { setSelectedTrack(track.id); sound.click(); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedTrack === track.id
                    ? 'border-current bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
                style={selectedTrack === track.id ? { borderColor: track.color, color: track.color } : {}}
              >
                <span className="text-2xl">{track.emoji}</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">{track.label}</div>
                  <div className="text-xs text-white/50">{track.desc}</div>
                </div>
                {selectedTrack === track.id && (
                  <motion.div
                    className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: track.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-gold w-full"
          onClick={handleStart}
          disabled={!name.trim()}
          style={{ opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
        >
          Enter the Adventure →
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { profile, liteMode } = useGameStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [defaultTrack, setDefaultTrack] = useState<OnboardingTrack>('adults');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // TopNav "Start" button deep-links here via ?onboard=1
  useEffect(() => {
    if (searchParams.get('onboard') === '1' && !profile) {
      setShowOnboarding(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, profile, setSearchParams]);

  // Lock body scroll while on the landing page (prevents mobile overscroll revealing dark bg)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = '';
    };
  }, []);

  /** Returns the correct dashboard route for an existing profile */
  const trackRoute = (track: AgeTrack) =>
    track === 'kids' ? '/kids' : track === 'teens' ? '/teens' : '/adults';

  const handleCTA = () => {
    sound.click();
    if (profile) {
      navigate(trackRoute(profile.ageTrack));
    } else {
      setShowOnboarding(true);
    }
  };

  /** Called when a track pill is clicked */
  const handleTrackPill = (track: OnboardingTrack) => {
    sound.click();
    if (profile) {
      // Existing user — go to their own dashboard (ignore the pill that was clicked)
      navigate(trackRoute(profile.ageTrack));
    } else {
      setDefaultTrack(track);
      setShowOnboarding(true);
    }
  };

  return (
    <div className="h-screen bg-gray-950 ankara-bg overflow-hidden">
      <TopNav />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-between px-4 pt-28 pb-3 sm:pt-20 sm:pb-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-gray-950">
          {/* Full-bleed video background on all screen sizes */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/banner.mp4" type="video/mp4" />
          </video>
          {!liteMode && (
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          )}
          {/* Subtle full-screen overlay — high transparency, just takes the edge off */}
          <div className="absolute inset-0 bg-gray-950/20" />
        </div>

        {/* Title + CTA — all centred together */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full gap-6 pb-4 sm:pb-0">

          {/* NairaQuest title */}
          <motion.div
            className="flex flex-col items-center gap-2 pointer-events-none select-none"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1
              className="font-display text-6xl sm:text-8xl md:text-9xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #22c55e 40%, #00b86a 70%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                WebkitTextStroke: '0.1px white',
                filter: 'drop-shadow(0 2px 8px #000) drop-shadow(0 4px 20px #000)',
              }}
            >
              NairaQuest
            </h1>
            <p
              className="font-display text-base sm:text-xl md:text-2xl font-semibold tracking-wide text-white"
              style={{ textShadow: '0 2px 8px #000, 0 4px 20px #000' }}
            >
              Nigeria's #1 Financial Literacy Game
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col gap-3 justify-center items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="btn-gold text-lg sm:text-xl px-7 py-3.5 sm:px-8 sm:py-4 shadow-xl shadow-naira-gold/20 animate-pulse-glow w-full sm:w-auto"
              onClick={handleCTA}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {profile ? `Continue Adventure →` : 'Start Your Adventure →'}
            </motion.button>
            {profile && (
              <div className="text-white/60 text-sm">
                Welcome back, <span className="text-white font-semibold">{profile.name}</span> · Lv {profile.level}
              </div>
            )}
          </motion.div>

          {/* Age track pills — clickable, open onboarding pre-set to that track */}
          {!profile && (
            <motion.div
              className="flex flex-wrap justify-center gap-2 sm:gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {AGE_TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTrackPill(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border text-sm font-semibold text-white hover:scale-105 active:scale-95 transition-transform"
                  style={{ background: 'rgba(3,7,18,0.72)', borderColor: 'rgba(255,255,255,0.25)' }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </motion.div>
          )}

        </div>

        <footer className="relative z-10 w-full mt-4 sm:mt-16">
          <div
            className="text-center text-white/70 text-xs px-6 py-3 rounded-xl mx-auto w-max max-w-full"
            style={{ background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <p className="font-semibold whitespace-nowrap">
              © 2026 NairaQuest🇳🇬 · Powered by{' '}
              <a
                href="https://virtuallysafe.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-naira-green hover:text-naira-green-light underline underline-offset-2 transition-colors"
              >
                VirtuallySafe
              </a>
            </p>
            <p className="mt-0.5 text-white/45 whitespace-nowrap">Content is educational. Always consult a licensed financial advisor for personal financial decisions.</p>
          </div>
        </footer>
      </section>

      {/* Onboarding Modal */}
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
