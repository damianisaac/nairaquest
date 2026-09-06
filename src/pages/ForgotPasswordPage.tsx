import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPassword, friendlyAuthError, isSupabaseConfigured } from '../lib/supabase';
import { sound } from '../components/ui/SoundController';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sound.click();

    try {
      const { error: err } = await resetPassword(email.trim());
      if (err) {
        setError(friendlyAuthError(err.message));
        return;
      }
      // Always show the "check your email" screen even if the address isn't registered
      // (Supabase does this too — avoids leaking which emails exist)
      setSent(true);
      sound.levelUp();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(friendlyAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg overflow-y-auto">
      <button
        className="fixed top-4 left-4 z-10 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
        onClick={() => { sound.click(); navigate('/auth'); }}
      >
        ← Back to Sign In
      </button>

      <div className="flex items-center justify-center min-h-screen p-4 pt-14">
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
              🔑
            </motion.div>
            <h1 className="font-display text-3xl text-white">Forgot Password?</h1>
            <p className="text-white/50 text-sm mt-1">
              No worries — we'll send a reset link to your email
            </p>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ── */
              <motion.div
                key="sent"
                className="card-glass p-6 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-4xl mb-3">📧</div>
                <h2 className="font-display text-naira-green text-xl mb-2">Check your inbox!</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-1">
                  If <strong className="text-white">{email}</strong> is linked to an account,
                  you'll receive a password reset link shortly.
                </p>
                <p className="text-white/40 text-xs mb-6">
                  Check your spam folder if it doesn't arrive within a minute.
                </p>
                <button
                  className="btn-primary w-full"
                  onClick={() => { sound.click(); navigate('/auth'); }}
                >
                  → Back to Sign In
                </button>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.form
                key="form"
                className="card-glass p-6 space-y-4"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {!isSupabaseConfigured && (
                  <div className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    Cloud features are not enabled. Password reset is unavailable.
                  </div>
                )}

                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Email address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green transition-colors"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!isSupabaseConfigured}
                  />
                </div>

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
                  disabled={loading || !isSupabaseConfigured}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending reset link…
                    </>
                  ) : (
                    'Send Reset Link →'
                  )}
                </button>

                <p className="text-center text-xs text-white/30">
                  Remembered it?{' '}
                  <button
                    type="button"
                    className="text-white/50 hover:text-white/70 hover:underline transition-colors"
                    onClick={() => { sound.click(); navigate('/auth'); }}
                  >
                    Back to Sign In
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
