import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchClassByCode, joinClass, fetchStudentClass, leaveClass } from '../lib/supabase-social';
import { sound } from '../components/ui/SoundController';
import type { ClassInfo, UserRole } from '../types';

export default function ClassJoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, createProfile, setClassContext } = useGameStore();
  const { user } = useAuth();

  const [codeInput, setCodeInput] = useState(searchParams.get('code') ?? '');
  const [nameInput, setNameInput] = useState(profile?.name ?? '');
  const [preview, setPreview] = useState<ClassInfo | null>(null);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  const [step, setStep] = useState<'code' | 'confirm' | 'done'>('code');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingCurrent, setCheckingCurrent] = useState(true);

  const isCloud = isSupabaseConfigured && !!user;
  const needsProfile = !profile;

  useEffect(() => {
    if (!isCloud) { setCheckingCurrent(false); return; }
    fetchStudentClass(user!.id).then(({ classInfo: ci }) => {
      setCurrentClass(ci);
      if (ci && setClassContext) {
        setClassContext({
          classId: ci.id,
          className: ci.name,
          teacherName: ci.teacherName,
          classCode: ci.classCode,
          focusCategoryId: ci.focusCategoryId,
        });
      }
      setCheckingCurrent(false);
    });
  }, [isCloud, user]);

  const handleLookupCode = async () => {
    if (!codeInput.trim()) return;
    if (needsProfile && !nameInput.trim()) { setError('Enter your name first.'); return; }
    setLoading(true); setError(null);
    const { classInfo: ci, error: e } = await fetchClassByCode(codeInput.trim());
    if (e || !ci) { setError(e ?? 'Class not found.'); setLoading(false); return; }
    setPreview(ci); setStep('confirm'); setLoading(false);
  };

  const handleJoin = async () => {
    if (!preview) return;
    setLoading(true); setError(null);

    let userId = user?.id;

    // If no profile yet — create one (simplified student onboarding)
    if (needsProfile && nameInput.trim()) {
      createProfile(nameInput.trim(), preview.ageTrack, 'general' as UserRole);
      // Note: profile ID is generated synchronously by createProfile
      // Give the store a tick to update
      await new Promise((r) => setTimeout(r, 50));
      userId = useGameStore.getState().profile?.id;
    }

    if (!userId) { setError('Could not determine your user ID.'); setLoading(false); return; }

    const displayName = nameInput.trim() || profile?.name || 'Student';
    const { error: joinErr } = await joinClass(preview.id, userId, displayName);
    if (joinErr) { setError(joinErr); setLoading(false); return; }

    // Update class context in store
    setClassContext({
      classId: preview.id,
      className: preview.name,
      teacherName: preview.teacherName,
      classCode: preview.classCode,
      focusCategoryId: preview.focusCategoryId,
    });

    setCurrentClass(preview);
    setStep('done');
    setLoading(false);
    sound.levelUp();
  };

  const handleLeave = async () => {
    if (!currentClass || !user || !confirm('Leave this class?')) return;
    await leaveClass(currentClass.id, user.id);
    setClassContext(null);
    setCurrentClass(null);
    setStep('code');
  };

  if (!isCloud) return (
    <div className="min-h-screen bg-gray-950 ankara-bg flex items-center justify-center p-4">
      <motion.div
        className="max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="font-display text-2xl text-white mb-2">Join a Class</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Get a class code from your teacher and track your quiz progress together.
          </p>
        </div>

        {/* How it works */}
        <div className="card-glass p-5 mb-4">
          <h2 className="font-display text-white text-sm mb-3">How to Join a Class</h2>
          <div className="space-y-3">
            {[
              { emoji: '👩‍🏫', text: 'Ask your teacher for your class code (it\'s 6 characters, like ABC123)' },
              { emoji: '✏️', text: 'Enter the code here — the app will look up your class automatically' },
              { emoji: '📊', text: 'Your scores appear on the class leaderboard so your teacher can track your progress' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{s.emoji}</span>
                <p className="text-white/60 text-xs leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { emoji: '🏆', label: 'Class Leaderboard' },
            { emoji: '📌', label: 'Teacher Assignments' },
            { emoji: '📈', label: 'Progress Tracking' },
            { emoji: '🎯', label: 'Focus Zones' },
          ].map((f) => (
            <div key={f.label} className="card-glass p-3 flex items-center gap-2">
              <span className="text-lg">{f.emoji}</span>
              <span className="text-white/70 text-xs font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 mb-4">
          <p className="text-blue-300/80 text-xs text-center">☁️ Joining a class requires a cloud account linked to your school.</p>
        </div>
        <button
          className="btn-primary w-full mb-3"
          onClick={() => navigate('/auth')}
        >
          Sign Up / Sign In →
        </button>
        <button
          className="block mx-auto text-sm text-white/30 hover:text-white/60 transition-colors"
          onClick={() => navigate('/map')}
        >
          ← Back to World Map
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg flex items-center justify-center p-4">
      <motion.div
        className="max-w-sm w-full card-glass p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="font-display text-2xl text-white">Join a Class</h1>
          <p className="text-white/40 text-sm mt-1">Enter the code your teacher shared</p>
        </div>

        {checkingCurrent ? (
          <div className="flex justify-center py-8">
            <span className="w-6 h-6 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
          </div>
        ) : step === 'done' || (currentClass && step === 'code') ? (
          /* ── Already in a class ── */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-naira-green/30 bg-naira-green/10">
              <p className="text-xs text-naira-green uppercase tracking-wide mb-1">Current Class</p>
              <p className="font-display text-white text-lg">{currentClass?.name ?? preview?.name}</p>
              <p className="text-xs text-white/40 mt-0.5">Teacher: {currentClass?.teacherName ?? preview?.teacherName}</p>
              <p className="text-xs text-white/30">Code: {currentClass?.classCode ?? preview?.classCode}</p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentClass?.focusCategoryId && (
                <div className="p-3 rounded-xl border border-naira-gold/30 bg-naira-gold/10 text-xs text-naira-gold mb-3">
                  📌 Focus this week: assigned zone from your teacher
                </div>
              )}
            </motion.div>
            <button
              className="btn-primary w-full"
              onClick={() => navigate('/map')}
            >
              Go to World Map →
            </button>
            <button
              className="w-full py-2.5 rounded-2xl border border-naira-green/30 text-naira-green text-sm hover:bg-naira-green/10 transition-colors"
              onClick={() => { sound.click(); navigate(`/class/${currentClass?.id}/leaderboard`); }}
            >
              🏆 Class Leaderboard
            </button>
            <button
              className="w-full text-sm text-white/25 hover:text-red-400 transition-colors"
              onClick={handleLeave}
            >
              Leave Class
            </button>
          </div>
        ) : step === 'confirm' && preview ? (
          /* ── Confirm join ── */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Class Found</p>
              <p className="font-display text-white text-lg">{preview.name}</p>
              <p className="text-xs text-white/50 mt-0.5">Teacher: {preview.teacherName}</p>
              <p className="text-xs text-white/30">
                {preview.ageTrack === 'kids' ? '🌟 Kids track' : preview.ageTrack === 'teens' ? '🚀 Teens track' : '💼 Adults track'}
              </p>
            </div>

            {(needsProfile || !nameInput) && (
              <div>
                <label className="text-xs text-white/50 mb-1 block">Your display name in class</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green text-sm"
                  placeholder="Your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button className="btn-primary flex-1 py-2.5 text-sm" onClick={handleJoin} disabled={loading}>
                {loading ? '…' : 'Join Class ✓'}
              </button>
              <button
                className="px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm"
                onClick={() => { setStep('code'); setPreview(null); }}
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          /* ── Enter code ── */
          <div className="space-y-4">
            {needsProfile && (
              <div>
                <label className="text-xs text-white/50 mb-1 block">Your name</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green text-sm"
                  placeholder="Enter your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Class code (from teacher)</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green text-sm uppercase tracking-widest text-center text-lg font-bold"
                placeholder="ABC123"
                value={codeInput}
                maxLength={6}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookupCode()}
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              className="btn-primary w-full"
              onClick={handleLookupCode}
              disabled={loading || !codeInput.trim() || (needsProfile && !nameInput.trim())}
            >
              {loading ? '…' : 'Find Class →'}
            </button>
            <button
              className="block mx-auto text-sm text-white/30 hover:text-white/60 transition-colors"
              onClick={() => navigate('/map')}
            >
              ← Back to World Map
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
