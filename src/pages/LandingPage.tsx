import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { AgeTrack } from '../types';

const HeroScene = lazy(() => import('../components/3d/HeroScene'));

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

const FEATURE_BADGES = [
  { icon: '🗺️', label: '9 Financial Zones' },
  { icon: '🏆', label: '18 Badges' },
  { icon: '🆓', label: 'Free to Play' },
  { icon: '🇳🇬', label: 'Made for Nigeria' },
  { icon: '📱', label: 'Works Offline' },
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
  const { profile, liteMode } = useGameStore();
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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = '';
    };
  }, []);

  const trackRoute = (track: AgeTrack) =>
    track === 'kids' ? '/kids' : track === 'teens' ? '/teens' : '/adults';

  const handleCTA = () => {
    sound.click();
    if (profile) navigate(trackRoute(profile.ageTrack));
    else setShowOnboarding(true);
  };

  const handleTrackPill = (track: OnboardingTrack) => {
    sound.click();
    if (profile) navigate(trackRoute(profile.ageTrack));
    else { setDefaultTrack(track); setShowOnboarding(true); }
  };

  return (
    <div className="h-screen bg-gray-950 ankara-bg overflow-hidden">
      <TopNav />

      <section className="relative h-screen flex flex-col items-center px-4 overflow-hidden">

        {/* ── Video + 3D background ── */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover object-center">
            <source src="/banner.mp4" type="video/mp4" />
          </video>
          {!liteMode && (
            <Suspense fallback={null}><HeroScene /></Suspense>
          )}
          {/* Gradient overlay — richer than before for legibility */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(3,7,18,0.2) 0%, rgba(3,7,18,0.38) 60%, rgba(3,7,18,0.7) 100%)' }} />

          {/* Coloured ambient orbs */}
          <motion.div className="absolute rounded-full pointer-events-none"
            style={{ width: 500, height: 500, top: -180, right: -150, background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 65%)', filter: 'blur(70px)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div className="absolute rounded-full pointer-events-none"
            style={{ width: 400, height: 400, bottom: 0, left: -120, background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 65%)', filter: 'blur(80px)' }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          <motion.div className="absolute rounded-full pointer-events-none"
            style={{ width: 280, height: 280, top: '35%', left: '30%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 65%)', filter: 'blur(60px)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          />
        </div>

        {/* ── Floating ₦ symbols ── */}
        {[
          { size: 80, top: '15%', left: '8%', delay: 0 },
          { size: 48, top: '55%', left: '4%', delay: 1.5 },
          { size: 100, top: '20%', right: '6%', left: undefined, delay: 0.8 },
          { size: 56, top: '65%', right: '5%', left: undefined, delay: 2.2 },
          { size: 36, top: '40%', left: '92%', delay: 1 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute font-black select-none pointer-events-none"
            style={{
              fontSize: p.size,
              top: p.top,
              left: p.left,
              right: (p as { right?: string }).right,
              color: i % 2 === 0 ? 'rgba(212,175,55,0.07)' : 'rgba(34,197,94,0.07)',
              zIndex: 1,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          >
            ₦
          </motion.div>
        ))}

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center gap-3 sm:gap-4 pt-16">

          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              color: '#fbbf24',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(212,175,55,0.35)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <span>⚡</span>
            Master Money · Level Up Life
            <span>⚡</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display font-black tracking-tight leading-none text-6xl sm:text-8xl pointer-events-none select-none"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #22c55e 45%, #00b86a 70%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.8))',
            }}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            NairaQuest
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-white/85 text-sm sm:text-base font-semibold"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          >
            Nigeria's #1 Financial Literacy Adventure
          </motion.p>

          {/* Feature badges */}
          <motion.div
            className="flex gap-1.5 sm:gap-2 flex-wrap justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            {FEATURE_BADGES.map((b, i) => (
              <motion.span
                key={b.label}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white/75"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.07 }}
              >
                {b.icon} {b.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Returning user card */}
          <AnimatePresence mode="wait">
            {profile ? (
              <motion.div
                key="returning"
                className="w-full max-w-sm"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: 0.55 }}
              >
                <div
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{ background: 'rgba(3,7,18,0.65)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(34,197,94,0.2))', border: '1px solid rgba(212,175,55,0.4)' }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-black text-sm leading-tight">Welcome back, {profile.name}!</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(212,175,55,0.2)', color: '#fbbf24', border: '1px solid rgba(212,175,55,0.35)' }}>
                        Lv {profile.level}
                      </span>
                      {profile.dailyStreak > 0 && (
                        <span className="text-xs text-orange-400 font-semibold">{profile.dailyStreak}🔥 streak</span>
                      )}
                    </div>
                  </div>
                  <div className="text-white/30 text-lg flex-shrink-0">→</div>
                </div>
              </motion.div>
            ) : (
              /* Track selection grid */
              <motion.div
                key="tracks"
                className="grid grid-cols-4 gap-2 max-w-sm sm:max-w-md"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                {AGE_TRACKS.map((t, i) => (
                  <motion.button
                    key={t.id}
                    onClick={() => handleTrackPill(t.id)}
                    className="relative flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl border overflow-hidden text-center"
                    style={{
                      background: `linear-gradient(145deg, ${t.dark}60, rgba(3,7,18,0.8))`,
                      border: `1px solid ${t.color}45`,
                      backdropFilter: 'blur(8px)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
                    whileHover={{ scale: 1.06, y: -3, boxShadow: `0 8px 28px ${t.color}35`, borderColor: t.color + '90' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Glow bg on hover */}
                    <motion.div className="absolute inset-0 opacity-0 rounded-2xl"
                      style={{ background: `radial-gradient(circle at center, ${t.color}18, transparent 70%)` }}
                      whileHover={{ opacity: 1 }}
                    />
                    <span className="text-xl sm:text-2xl relative z-10">{t.emoji}</span>
                    <span className="text-xs font-black text-white relative z-10">{t.label}</span>
                    <span className="text-xs leading-tight relative z-10 hidden sm:block" style={{ color: t.color + 'bb' }}>{t.hook}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA button */}
          <motion.div
            className="flex flex-col items-center gap-2 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
          >
            <motion.button
              className="btn-gold text-base sm:text-lg px-7 py-3.5 sm:px-8 sm:py-4 shadow-xl shadow-naira-gold/20 animate-pulse-glow w-full sm:w-auto"
              onClick={handleCTA}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212,175,55,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              {profile ? 'Continue Adventure →' : 'Start Your Adventure →'}
            </motion.button>

            {!profile && (
              <motion.button
                onClick={() => { sound.click(); navigate('/auth'); }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{
                  background: '#0f172a',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  color: '#e2e8f0',
                }}
                whileHover={{ borderColor: '#22c55e', scale: 1.03 }}
              >
                Already have an account?&nbsp;
                <span style={{ color: '#22c55e', fontWeight: 700 }}>Sign in →</span>
              </motion.button>
            )}
          </motion.div>

        </div>

        {/* ── Footer ── */}
        <footer className="relative z-10 pb-3 text-center">
          <p className="text-white/35 text-xs">
            © 2026 NairaQuest 🇳🇬 · Powered by{' '}
            <a href="https://teenscancode.com.ng" target="_blank" rel="noopener noreferrer"
              className="text-naira-green/70 hover:text-naira-green transition-colors underline underline-offset-2">
              Teens Can Code
            </a>
            {' '}· Educational content only. Consult a licensed financial advisor for personal decisions.
          </p>
        </footer>
      </section>

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
