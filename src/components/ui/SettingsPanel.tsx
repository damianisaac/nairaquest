import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore, selectIsUnlocked, selectProgress, TRACK_DEFAULT_TIMER } from '../../store/gameStore';
import { CATEGORIES, CATEGORY_MAP } from '../../data/categories';
import { getMasteryCap, getMasteryPercent, getUnlockThreshold } from '../../utils/scoring';
import { sound } from './SoundController';
import type { AgeTrack, CategoryId } from '../../types';

const TIMER_STOPS = [5, 10, 15, 20, 25, 30];

const TRACK_OPTIONS: { id: AgeTrack; label: string; emoji: string }[] = [
  { id: 'kids',   label: 'Kids',   emoji: '🌟' },
  { id: 'teens',  label: 'Teens',  emoji: '🚀' },
  { id: 'adults', label: 'Adults', emoji: '💼' },
];

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title, icon, open, onToggle, children,
}: {
  title: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/8">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-white/90 text-sm">{title}</span>
        </div>
        <motion.span
          className="text-white/30 text-xs"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 font-medium">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5 leading-snug">{description}</p>}
      </div>
      <button
        onClick={() => { sound.click(); onChange(); }}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-naira-green' : 'bg-white/15'}`}
        role="switch"
        aria-checked={checked}
      >
        <motion.span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? '1.375rem' : '0.125rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </button>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const state = useGameStore();
  const {
    profile,
    soundEnabled, toggleSound,
    musicEnabled, toggleMusic,
    notificationsEnabled, toggleNotifications,
    liteMode, setLiteMode,
    accessibilityMode, toggleAccessibilityMode,
    questionTimerSeconds, setQuestionTimer, timerManuallySet,
    excludedCategoryIds, toggleCategoryExclusion,
    updateAgeTrack,
    resetCategoryProgress, resetAllProgress,
  } = state;

  const progress = selectProgress(state);

  const [expanded, setExpanded] = useState({ experience: true, sound: true, account: false, data: false });
  const [resetTarget, setResetTarget] = useState<'all' | CategoryId | null>(null);

  const toggle = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleTrackChange = (track: AgeTrack) => {
    sound.click();
    updateAgeTrack(track);
  };

  const handleTimerChange = (val: number) => {
    setQuestionTimer(val, true);
  };

  const handleResetCategory = (categoryId: CategoryId) => {
    if (resetTarget === categoryId) {
      sound.wrong();
      resetCategoryProgress(categoryId);
      setResetTarget(null);
    } else {
      setResetTarget(categoryId);
    }
  };

  const handleResetAll = () => {
    if (resetTarget === 'all') {
      sound.wrong();
      resetAllProgress();
      setResetTarget(null);
    } else {
      setResetTarget('all');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[190] bg-black/50"
        style={{ backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        className="fixed top-0 right-0 bottom-0 z-[195] w-[85vw] sm:w-[440px] flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0a0f1e 0%, #030712 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      >
        {/* Sticky header */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/8"
          style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(8px)' }}
        >
          <div>
            <h2 className="font-display text-base text-white">Customize Your Experience</h2>
            {profile && (
              <p className="text-xs text-white/40 mt-0.5">{profile.name} · {profile.ageTrack}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/15 hover:text-white transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Section 1: Experience ────────────────────────────────── */}
          <Section title="Experience" icon="🎮" open={expanded.experience} onToggle={() => toggle('experience')}>

            {/* Age Track */}
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3 font-semibold">Age Track</p>
              <div className="grid grid-cols-3 gap-2">
                {TRACK_OPTIONS.map((t) => {
                  const active = profile?.ageTrack === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTrackChange(t.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        active
                          ? 'bg-naira-green/15 border-naira-green/40 text-naira-green'
                          : 'bg-white/4 border-white/10 text-white/50 hover:bg-white/8 hover:text-white/80'
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-xs">{t.label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-naira-green" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timer */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Question Timer</p>
                <span className="text-sm font-bold text-naira-green">{questionTimerSeconds}s</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={questionTimerSeconds}
                onChange={(e) => handleTimerChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#22c55e' }}
              />
              <div className="flex justify-between mt-1.5">
                {TIMER_STOPS.map((s) => (
                  <span
                    key={s}
                    className={`text-xs transition-colors ${s === questionTimerSeconds ? 'text-naira-green font-bold' : 'text-white/25'}`}
                  >
                    {s}s
                  </span>
                ))}
              </div>
              {timerManuallySet && profile && questionTimerSeconds !== TRACK_DEFAULT_TIMER[profile.ageTrack] && (
                <button
                  className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
                  onClick={() => {
                    sound.click();
                    if (profile) setQuestionTimer(TRACK_DEFAULT_TIMER[profile.ageTrack], false);
                  }}
                >
                  ↩ Reset to track default ({TRACK_DEFAULT_TIMER[profile.ageTrack]}s)
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3 font-semibold">Active Categories</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const unlocked = profile ? selectIsUnlocked(state, cat.id) : cat.tier === 0;
                  const excluded = excludedCategoryIds.includes(cat.id);
                  const prog = progress[cat.id];
                  const prereqId = cat.prerequisite;
                  let unlockHint = '';
                  if (!unlocked && prereqId && profile) {
                    const prereqName = CATEGORY_MAP[prereqId]?.name ?? prereqId;
                    const threshold = Math.round(getUnlockThreshold(profile.ageTrack) * 100);
                    const prereqCap = getMasteryCap(prereqId, profile.ageTrack);
                    const prereqPct = Math.round(getMasteryPercent(progress[prereqId]?.masteryPoints ?? 0, prereqCap) * 100);
                    unlockHint = `${prereqPct}% / ${threshold}% mastery in ${prereqName}`;
                  }

                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                        unlocked ? 'bg-white/3 hover:bg-white/5' : 'bg-white/1 opacity-50'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{unlocked ? cat.emoji : '🔒'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${unlocked ? 'text-white/80' : 'text-white/40'}`}>
                          {cat.name}
                        </p>
                        {!unlocked && unlockHint && (
                          <p className="text-xs text-white/30 truncate mt-0.5">{unlockHint}</p>
                        )}
                        {unlocked && prog && (
                          <p className="text-xs text-white/30 mt-0.5">
                            {Math.round(getMasteryPercent(prog.masteryPoints, getMasteryCap(cat.id, profile?.ageTrack ?? 'adults')) * 100)}% mastery
                          </p>
                        )}
                      </div>
                      {unlocked ? (
                        <button
                          onClick={() => { sound.click(); toggleCategoryExclusion(cat.id); }}
                          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${!excluded ? 'bg-naira-green' : 'bg-white/15'}`}
                          role="switch"
                          aria-checked={!excluded}
                        >
                          <motion.span
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                            animate={{ left: !excluded ? '1.15rem' : '0.1rem' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        </button>
                      ) : (
                        <span className="text-white/20 text-xs flex-shrink-0">🔒</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* ── Section 2: Sound & Notifications ────────────────────── */}
          <Section title="Sound & Notifications" icon="🔊" open={expanded.sound} onToggle={() => toggle('sound')}>
            <ToggleRow
              label="Sound Effects"
              description="Correct/wrong answers, coins, level-up fanfare"
              checked={soundEnabled}
              onChange={toggleSound}
            />
            <ToggleRow
              label="Background Music"
              description="Ambient music during gameplay"
              checked={musicEnabled}
              onChange={toggleMusic}
            />
            <ToggleRow
              label="Streak Reminders"
              description="Daily nudge to keep your streak alive"
              checked={notificationsEnabled}
              onChange={toggleNotifications}
            />
            <ToggleRow
              label="♿ Accessibility Mode"
              description="Questions and options are read aloud. Answer by tapping or saying A, B, C or D. Timer pauses while reading."
              checked={accessibilityMode}
              onChange={toggleAccessibilityMode}
            />
          </Section>

          {/* ── Section 3: Account & Family ─────────────────────────── */}
          <Section title="Account & Family" icon="👤" open={expanded.account} onToggle={() => toggle('account')}>
            <div className="space-y-2">
              {[
                { label: 'Edit Profile & Avatar', icon: '✏️', path: '/profile' },
                { label: 'Family Hub', icon: '👨‍👩‍👧', path: '/family' },
                { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
                ...(profile?.ageTrack === 'kids' ? [{ label: 'Parent View', icon: '👩‍👧', path: '/parent' }] : []),
                ...(profile?.userRole === 'teacher' ? [{ label: 'Teacher Dashboard', icon: '👨‍🏫', path: '/teacher' }] : []),
                { label: 'Join a Class', icon: '🏫', path: '/class/join' },
              ].map(({ label, icon, path }) => (
                <button
                  key={path}
                  onClick={() => { sound.click(); onClose(); navigate(path); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/4 border border-white/8 text-sm text-white/70 hover:bg-white/8 hover:text-white/90 transition-all text-left"
                >
                  <span>{icon}</span>
                  <span className="flex-1">{label}</span>
                  <span className="text-white/20">→</span>
                </button>
              ))}
            </div>
          </Section>

          {/* ── Section 4: Data & Reset ──────────────────────────────── */}
          <Section title="Data & Reset" icon="🗄️" open={expanded.data} onToggle={() => toggle('data')}>
            <ToggleRow
              label="Lite Mode"
              description="Disable 3D and heavy animations (helps on older devices)"
              checked={liteMode}
              onChange={() => { sound.click(); setLiteMode(!liteMode); }}
            />

            {/* Per-category reset */}
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3 font-semibold">Reset Category Progress</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {CATEGORIES.filter((c) => (progress[c.id]?.questionsAnswered ?? 0) > 0).map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="flex-1 text-xs text-white/60 truncate">{cat.name}</span>
                    {resetTarget === cat.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleResetCategory(cat.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/80 text-white text-xs font-bold hover:bg-red-500 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setResetTarget(null)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-white/50 text-xs hover:bg-white/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { sound.click(); setResetTarget(cat.id); }}
                        className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/10 text-xs text-white/40 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                ))}
                {CATEGORIES.filter((c) => (progress[c.id]?.questionsAnswered ?? 0) > 0).length === 0 && (
                  <p className="text-xs text-white/25 italic">No progress to reset yet.</p>
                )}
              </div>
            </div>

            {/* Reset all */}
            <div className="pt-1">
              {resetTarget === 'all' ? (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/8 space-y-3">
                  <p className="text-sm text-red-300 font-semibold">⚠️ Reset everything?</p>
                  <p className="text-xs text-white/50">This wipes all mastery, badges, streak, and wallet credits. Cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetAll}
                      className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                    >
                      Yes, reset everything
                    </button>
                    <button
                      onClick={() => setResetTarget(null)}
                      className="flex-1 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/15 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { sound.click(); setResetTarget('all'); }}
                  className="w-full py-3 rounded-xl border border-red-500/20 text-red-400/70 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all"
                >
                  ⚠️ Reset All Progress
                </button>
              )}
            </div>

            {/* Privacy */}
            <p className="text-xs text-white/25 leading-relaxed pt-1">
              All game data is stored locally on your device. No personal data is shared without your consent. For Kids and Teens accounts, parent linking adds family visibility only.{' '}
              <button
                className="underline hover:text-white/45 transition-colors"
                onClick={() => { sound.click(); onClose(); navigate('/privacy'); }}
              >
                Privacy policy →
              </button>
            </p>
          </Section>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </motion.div>
    </>
  );
}
