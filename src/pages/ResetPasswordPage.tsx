import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, updatePassword, friendlyAuthError } from '../lib/supabase';
import { sound } from '../components/ui/SoundController';

type PageState = 'loading' | 'ready' | 'success' | 'invalid';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase embeds the recovery token in the URL hash.
    // onAuthStateChange fires with event 'PASSWORD_RECOVERY' after the page loads,
    // which establishes a temporary session we can use to call updateUser.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready');
      } else if (event === 'SIGNED_IN') {
        // Also valid — some Supabase versions fire SIGNED_IN on recovery
        setPageState((prev) => prev === 'loading' ? 'ready' : prev);
      }
    });

    // If no event fires within 3 s the link is invalid/expired
    const timeout = setTimeout(() => {
      setPageState((prev) => prev === 'loading' ? 'invalid' : prev);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    sound.click();

    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(friendlyAuthError(err.message));
        return;
      }
      sound.levelUp();
      setPageState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(friendlyAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
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
              🔒
            </motion.div>
            <h1 className="font-display text-3xl text-white">Set New Password</h1>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Loading: waiting for Supabase recovery event ── */}
            {pageState === 'loading' && (
              <motion.div
                key="loading"
                className="card-glass p-8 flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="w-8 h-8 border-4 border-white/20 border-t-naira-green rounded-full animate-spin" />
                <p className="text-white/50 text-sm">Verifying your reset link…</p>
              </motion.div>
            )}

            {/* ── Invalid / expired link ── */}
            {pageState === 'invalid' && (
              <motion.div
                key="invalid"
                className="card-glass p-6 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-4xl mb-3">⏰</div>
                <h2 className="font-display text-red-400 text-xl mb-2">Link expired or invalid</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Password reset links expire after 1 hour. Please request a new one.
                </p>
                <button
                  className="btn-primary w-full"
                  onClick={() => { sound.click(); navigate('/forgot-password'); }}
                >
                  Request a New Link →
                </button>
              </motion.div>
            )}

            {/* ── Form: enter new password ── */}
            {pageState === 'ready' && (
              <motion.form
                key="form"
                className="card-glass p-6 space-y-4"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-white/50 text-sm">
                  Choose a strong password — at least 8 characters.
                </p>

                {/* New password */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green transition-colors"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-lg"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength =
                          password.length >= 12 && /[^a-zA-Z0-9]/.test(password) ? 4
                          : password.length >= 10 ? 3
                          : password.length >= 8 ? 2
                          : 1;
                        const color =
                          strength >= 4 ? 'bg-naira-green'
                          : strength >= 3 ? 'bg-yellow-400'
                          : strength >= 2 ? 'bg-amber-500'
                          : 'bg-red-500';
                        return (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= strength ? color : 'bg-white/10'
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Confirm new password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/25 focus:outline-none transition-colors ${
                      confirm && confirm !== password
                        ? 'border-red-500/60'
                        : confirm && confirm === password
                        ? 'border-naira-green/60'
                        : 'border-white/15 focus:border-naira-green'
                    }`}
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  {confirm && confirm !== password && (
                    <p className="text-red-400 text-xs mt-1">Passwords don't match yet</p>
                  )}
                  {confirm && confirm === password && (
                    <p className="text-naira-green text-xs mt-1">✓ Passwords match</p>
                  )}
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
                  disabled={loading}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving new password…
                    </>
                  ) : (
                    'Save New Password →'
                  )}
                </button>
              </motion.form>
            )}

            {/* ── Success ── */}
            {pageState === 'success' && (
              <motion.div
                key="success"
                className="card-glass p-6 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="font-display text-naira-green text-xl mb-2">Password updated!</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Your password has been changed. Sign in with your new password to continue your quest.
                </p>
                <button
                  className="btn-primary w-full"
                  onClick={() => { sound.click(); navigate('/auth'); }}
                >
                  → Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
