import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useGameStore } from '../store/gameStore';
import { sound } from '../components/ui/SoundController';
import type { AgeTrack } from '../types';

type Mode = 'sign-in' | 'sign-up';

const AGE_TRACKS: { id: AgeTrack; label: string; emoji: string }[] = [
  { id: 'kids', label: 'Kids (6–12)', emoji: '🌟' },
  { id: 'teens', label: 'Teens (13–17)', emoji: '🚀' },
  { id: 'adults', label: 'Adults', emoji: '💼' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTeacherFlow = searchParams.get('role') === 'teacher';
  const { signIn, signUp, isConfigured } = useAuth();
  const { profile } = useGameStore();
  // Teachers land here in sign-up mode by default
  const [mode, setMode] = useState<Mode>(isTeacherFlow ? 'sign-up' : 'sign-in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Teachers are always on the adults track
  const [ageTrack, setAgeTrack] = useState<AgeTrack>('adults');

  // Show the Coming Soon wall ONLY for non-teacher visitors when Supabase isn't configured.
  // Teachers who explicitly navigated here should always reach the sign-up form.
  if (!isConfigured && !isTeacherFlow) {
    return (
      <div className="min-h-screen bg-gray-950 ankara-bg flex items-center justify-center p-4">
        <button
          className="absolute top-4 left-4 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
          onClick={() => { sound.click(); navigate(-1); }}
        >
          ← Back
        </button>
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-display text-2xl text-white mb-3">Cloud Features Coming Soon</h1>
          <p className="text-white/60 mb-3 leading-relaxed">
            Family Hub, class sync, and cross-device progress are cloud-powered features that will be fully available soon.
          </p>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            All your current progress is saved locally on this device. Keep playing and earning — it'll be waiting when cloud sync launches.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { emoji: '👨‍👩‍👧', label: 'Family Hub', desc: 'Challenge family members' },
              { emoji: '🏫', label: 'Join a Class', desc: 'Sync with your teacher' },
              { emoji: '☁️', label: 'Cross-Device', desc: 'Play on any device' },
              { emoji: '🏆', label: 'Live Rankings', desc: 'Global leaderboards' },
            ].map((f) => (
              <div key={f.label} className="card-glass p-3 text-left">
                <div className="text-xl mb-1">{f.emoji}</div>
                <div className="text-white/80 text-xs font-semibold">{f.label}</div>
                <div className="text-white/40 text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
          <button
            className="btn-primary w-full"
            onClick={() => { sound.click(); navigate(profile ? '/map' : '/'); }}
          >
            {profile ? 'Continue Playing →' : 'Start Playing →'}
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sound.click();

    try {
      if (mode === 'sign-in') {
        const { error: err } = await signIn(email, password);
        if (err) { setError(err.message); return; }
        sound.levelUp();
        navigate(profile ? '/map' : '/');
      } else {
        if (!name.trim()) { setError('Please enter your name.'); return; }
        const result = await signUp(email, password, name.trim(), ageTrack);
        if (result.error) { setError(result.error.message); return; }
        sound.levelUp();
        if (result.needsConfirmation) {
          // Email confirmation required — stay on page, show message
          setPendingConfirm(true);
        } else {
          navigate('/map');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg flex items-center justify-center p-4">
      {/* Back to local play */}
      <button
        className="absolute top-4 left-4 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
        onClick={() => { sound.click(); navigate('/'); }}
      >
        ← Back
      </button>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-5xl mb-3"
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          >
            🐚
          </motion.div>
          <h1 className="font-display text-3xl text-white">NairaQuest</h1>
          <p className="text-white/50 text-sm mt-1">
            {isTeacherFlow
              ? 'Create a teacher account to manage your class'
              : mode === 'sign-in'
              ? 'Welcome back — sign in to your account'
              : 'Create an account to save your streak and progress'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
          {(['sign-in', 'sign-up'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === m
                  ? 'bg-naira-green text-white shadow-lg'
                  : 'text-white/40 hover:text-white/70'
              }`}
              onClick={() => { setMode(m); setError(null); sound.click(); }}
            >
              {m === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-glass p-6 space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'sign-up' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Name */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Your name</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green transition-colors"
                    placeholder="What should we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={24}
                  />
                </div>

                {/* Age track — hidden for teacher flow (always adults) */}
                {!isTeacherFlow && (
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Adventure track</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AGE_TRACKS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setAgeTrack(t.id); sound.click(); }}
                          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all ${
                            ageTrack === t.id
                              ? 'border-naira-green bg-naira-green/15 text-naira-green'
                              : 'border-white/10 text-white/50 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xl">{t.emoji}</span>
                          <span className="font-medium">{t.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher badge */}
                {isTeacherFlow && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-naira-gold/30 bg-naira-gold/10">
                    <span className="text-xl">🏫</span>
                    <div>
                      <p className="text-naira-gold text-xs font-semibold">Teacher Account</p>
                      <p className="text-white/40 text-xs">You'll be able to create classes and assign zones to students.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Email address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green transition-colors"
              placeholder={mode === 'sign-up' ? 'At least 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'sign-up' ? 8 : 1}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'sign-in' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              mode === 'sign-in' ? 'Sign In →' : 'Create Account →'
            )}
          </button>
        </form>

        {/* Email confirmation pending */}
        <AnimatePresence>
          {pendingConfirm && (
            <motion.div
              className="mt-4 p-4 rounded-2xl text-center"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-display text-naira-green text-base mb-1">Check your email!</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                We sent a confirmation link to <strong className="text-white">{email}</strong>.
                Click it to activate your account, then come back to sign in.
              </p>
              <button
                className="mt-3 text-sm text-naira-green hover:underline"
                onClick={() => { setPendingConfirm(false); setMode('sign-in'); sound.click(); }}
              >
                → Go to Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip to local play */}
        <p className="text-center text-xs text-white/30 mt-4">
          Want to Play as Guest?{' '}
          <button
            className="text-white/50 hover:text-white/70 hover:underline transition-colors"
            onClick={() => { sound.click(); navigate('/'); }}
          >
            Playing as guest won't save your earnings
          </button>
        </p>
      </motion.div>
    </div>
  );
}
