import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../data/categories';
import { BADGES } from '../data/badges';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import AvatarCustomizer, { AvatarPreview } from '../components/ui/AvatarCustomizer';
import { sound } from '../components/ui/SoundController';
import type { AgeTrack } from '../types';

const TRACK_LABELS: Record<AgeTrack, string> = {
  kids: '🌟 Kids',
  teens: '🚀 Teens',
  adults: '💼 Adults',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { profile, updateAgeTrack, equipAvatarItems } = state;
  const { user, syncNow, signOut } = useAuth();
  const { clearProfile } = state;
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!profile) {
    navigate('/');
    return null;
  }

  const earnedBadges = BADGES.filter((b) => profile.earnedBadgeIds.includes(b.id));
  const totalQuestions = Object.values(state.progress).reduce((s, p) => s + p.questionsAnswered, 0);

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        {/* Avatar + name header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <AvatarPreview profile={profile} size={96} />
            </motion.div>
          </div>
          <h1 className="font-display text-2xl text-white">{profile.name}</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              className="text-sm font-semibold text-white/70 hover:text-naira-green transition-colors"
              onClick={() => { sound.click(); setShowTrackModal(true); }}
            >
              {TRACK_LABELS[profile.ageTrack]} · Change track
            </button>
            <span className="text-white/30">·</span>
            <button
              className="text-sm font-semibold text-naira-gold hover:text-naira-gold-light transition-colors"
              onClick={() => { sound.click(); setShowAvatarCustomizer(true); }}
            >
              ✨ Customize avatar
            </button>
          </div>
          {/* Cloud sync status */}
          <div className="mt-2 text-sm font-semibold text-white/60">
            {user ? (
              <button
                className="text-naira-green hover:text-naira-green-light transition-colors"
                onClick={() => { sound.click(); syncNow(); }}
              >
                ☁️ Synced · tap to sync now
              </button>
            ) : (
              <button
                className="hover:text-white/80 transition-colors"
                onClick={() => { sound.click(); navigate('/auth'); }}
              >
                🔗 Sign in to sync across devices
              </button>
            )}
          </div>
          {/* Account ID for parent linking */}
          <div className="mt-2 text-sm font-medium text-white/50">
            ID: {profile.id.slice(0, 8)}…
            <button
              className="ml-2 font-semibold text-white/40 hover:text-white/70 transition-colors"
              onClick={() => { navigator.clipboard.writeText(profile.id); sound.click(); }}
            >
              copy
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-4 gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: 'Level', value: profile.level, color: '#8b5cf6', icon: '⚡' },
            { label: 'Total XP', value: profile.totalMasteryPoints, color: '#d4af37', icon: '⭐' },
            { label: 'Streak', value: `${profile.dailyStreak}🔥`, color: '#f97316', icon: '' },
            { label: 'Answered', value: totalQuestions, color: '#3b82f6', icon: '❓' },
          ].map((s) => (
            <div key={s.label} className="card-glass p-3 text-center">
              <div className="font-display text-lg sm:text-xl" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-white/40 leading-tight mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Category mastery */}
        <motion.div
          className="card-glass p-5 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-base text-white mb-4">Zone Mastery</h2>
          <div className="space-y-4">
            {CATEGORIES.map((cat, i) => {
              const mastery = selectMasteryPercent(state, cat.id);
              const prog = state.progress[cat.id] ?? { questionsAnswered: 0 };
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-sm text-white/80 flex-1">{cat.name}</span>
                    <span className="text-xs text-white/40">{prog.questionsAnswered} Qs</span>
                    {mastery >= 0.8 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-naira-green/20 text-naira-green">
                        Master
                      </span>
                    )}
                  </div>
                  <MasteryBar
                    percent={mastery}
                    color={cat.color}
                    showPercent={true}
                    height="h-2"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          className="card-glass p-5 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-base text-white mb-4">
            Badges ({earnedBadges.length}/{BADGES.filter(b => b.ageTrack.includes(profile.ageTrack)).length})
          </h2>
          {earnedBadges.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-sm">
              <div className="text-4xl mb-2">🏅</div>
              <p>Complete sessions to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {earnedBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  className="card-glass p-3 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  whileHover={{ scale: 1.04 }}
                >
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className="text-xs font-bold text-naira-gold">{badge.name}</div>
                  <div className="text-xs text-white/40 mt-0.5 leading-tight">{badge.description}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Locked badges preview */}
          {BADGES.filter(b => b.ageTrack.includes(profile.ageTrack) && !profile.earnedBadgeIds.includes(b.id)).length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-white/30 mb-2">Still to unlock:</p>
              <div className="flex flex-wrap gap-2">
                {BADGES
                  .filter(b => b.ageTrack.includes(profile.ageTrack) && !profile.earnedBadgeIds.includes(b.id))
                  .slice(0, 6)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/30"
                    >
                      <span>🔒</span>
                      <span>{badge.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            className="btn-primary w-full"
            onClick={() => { sound.click(); navigate('/map'); }}
          >
            Continue Adventure →
          </button>

          <button
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all text-sm font-semibold"
            onClick={() => { sound.click(); setShowSignOutConfirm(true); }}
          >
            🚪 Sign Out
          </button>
        </motion.div>
      </main>

      {/* Avatar customizer */}
      <AnimatePresence>
        {showAvatarCustomizer && profile && (
          <AvatarCustomizer
            profile={profile}
            onSave={(ids) => equipAvatarItems(ids)}
            onClose={() => setShowAvatarCustomizer(false)}
          />
        )}
      </AnimatePresence>

      {/* Sign-out confirmation modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card-glass p-6 w-full max-w-sm space-y-4"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🚪</div>
                <h3 className="font-display text-white text-lg mb-1">Sign Out?</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {user
                    ? 'Your progress is saved to the cloud. You can sign back in anytime to continue.'
                    : 'You are not signed in, so your progress is saved locally on this device only. Signing out will clear your local profile.'}
                </p>
                {!user && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
                    ⚠️ Consider signing in first to back up your progress to the cloud.
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  disabled={signingOut}
                  className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all text-sm font-bold disabled:opacity-50"
                  onClick={async () => {
                    setSigningOut(true);
                    sound.click();
                    if (user) await signOut();
                    clearProfile();
                    navigate('/', { replace: true });
                  }}
                >
                  {signingOut ? 'Signing out…' : 'Yes, sign out'}
                </button>
                <button
                  className="w-full py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                  onClick={() => { sound.click(); setShowSignOutConfirm(false); }}
                >
                  Cancel
                </button>
                {!user && (
                  <button
                    className="w-full py-2 text-sm text-naira-green hover:text-naira-green-light transition-colors"
                    onClick={() => { sound.click(); setShowSignOutConfirm(false); navigate('/auth'); }}
                  >
                    → Sign in to back up first
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track change modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            className="card-glass p-6 w-full max-w-sm space-y-4"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
          >
            <h3 className="font-display text-white text-lg">Change Adventure Track</h3>
            {(['kids', 'teens', 'adults'] as AgeTrack[]).map((t) => (
              <button
                key={t}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  profile.ageTrack === t
                    ? 'border-naira-green bg-naira-green/10 text-naira-green'
                    : 'border-white/10 text-white/60 hover:bg-white/5'
                }`}
                onClick={() => {
                  sound.click();
                  updateAgeTrack(t);
                  setShowTrackModal(false);
                }}
              >
                {TRACK_LABELS[t]}
              </button>
            ))}
            <button
              className="w-full text-sm text-white/40 hover:text-white/70 mt-2"
              onClick={() => setShowTrackModal(false)}
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
