import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  createClass,
  fetchTeacherClass,
  fetchClassRoster,
  setFocusCategory,
  deleteClass,
  fetchClassProgress,
} from '../lib/supabase-social';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { generateClassCode } from '../utils/social';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import { sound } from '../components/ui/SoundController';
import type { AgeTrack, CategoryId, ClassInfo, ClassMemberRow } from '../types';

const AGE_OPTIONS: { id: AgeTrack; label: string; emoji: string }[] = [
  { id: 'kids', label: 'Kids (6–12)', emoji: '🌟' },
  { id: 'teens', label: 'Teens (13–17)', emoji: '🚀' },
  { id: 'adults', label: 'Adults / Mixed', emoji: '💼' },
];

interface CategoryStat {
  categoryId: CategoryId;
  playedCount: number;
  avgMastery: number;
  coverage: number;
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { profile } = useGameStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [roster, setRoster] = useState<ClassMemberRow[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [tab, setTab] = useState<'roster' | 'analytics' | 'assign'>('roster');
  // Create form
  const [className, setClassName] = useState('');
  const [classTrack, setClassTrack] = useState<AgeTrack>('teens');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const isCloud = isSupabaseConfigured && !!user;
  const isTeacher = (profile?.userRole ?? 'general') === 'teacher';

  useEffect(() => {
    if (!isCloud || !isTeacher) { setLoading(false); return; }
    loadClass();
  }, [isCloud, isTeacher, user]);

  async function loadClass() {
    setLoading(true);
    const { classInfo: ci } = await fetchTeacherClass(user!.id);
    setClassInfo(ci);
    if (ci) {
      const rows = await fetchClassRoster(ci.id);
      setRoster(rows);
      loadAnalytics(rows, ci.ageTrack);
    }
    setLoading(false);
  }

  async function loadAnalytics(rows: ClassMemberRow[], ageTrack: AgeTrack) {
    if (rows.length === 0) { setCategoryStats([]); return; }
    const memberIds = rows.map((r) => r.userId);
    const progress = await fetchClassProgress(memberIds);

    const cap = ageTrack === 'kids' ? 100 : 300;
    const stats: CategoryStat[] = CATEGORIES.map((cat) => {
      const catProgress = progress.filter((p) => p.category_id === cat.id);
      const played = catProgress.filter((p) => p.questions_answered > 0);
      const avgMastery = played.length > 0
        ? played.reduce((sum, p) => sum + Math.min(1, p.mastery_points / cap), 0) / played.length
        : 0;
      return {
        categoryId: cat.id,
        playedCount: played.length,
        avgMastery,
        coverage: rows.length > 0 ? played.length / rows.length : 0,
      };
    });
    setCategoryStats(stats);
  }

  const handleCreateClass = async () => {
    if (!className.trim()) return;
    setSubmitting(true); setFormError(null);
    const code = generateClassCode();
    const { classInfo: ci, error } = await createClass({
      teacherUserId: user!.id,
      teacherName: profile!.name,
      name: className.trim(),
      ageTrack: classTrack,
      classCode: code,
    });
    if (error) { setFormError(error); setSubmitting(false); return; }
    setClassInfo(ci); setSubmitting(false);
  };

  const handleSetFocus = async (categoryId: CategoryId | null) => {
    if (!classInfo) return;
    sound.click();
    const { error } = await setFocusCategory(classInfo.id, categoryId);
    if (!error) setClassInfo({ ...classInfo, focusCategoryId: categoryId });
  };

  const handleDeleteClass = async () => {
    if (!classInfo || !confirm(`Delete "${classInfo.name}"? Students will lose their class membership.`)) return;
    await deleteClass(classInfo.id);
    setClassInfo(null); setRoster([]);
  };

  const handleCopyCode = () => {
    if (!classInfo) return;
    navigator.clipboard.writeText(classInfo.classCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    sound.click();
  };

  const sortedStrong = useMemo(() =>
    [...categoryStats].filter((s) => s.playedCount > 0).sort((a, b) => b.avgMastery - a.avgMastery),
    [categoryStats]);
  const sortedWeak = useMemo(() =>
    [...categoryStats].filter((s) => s.playedCount > 0).sort((a, b) => a.avgMastery - b.avgMastery),
    [categoryStats]);

  if (!profile) { navigate('/'); return null; }

  if (!isTeacher) return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-28 pb-12 px-4 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">👨‍🏫</div>
        <h1 className="font-display text-2xl text-white mb-3">Teacher Dashboard</h1>
        <p className="text-white/50 mb-6">Your account isn't set to Teacher role. Update your role in Profile Settings.</p>
        <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
      </main>
    </div>
  );

  if (!isCloud) return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-28 pb-12 px-4 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">👨‍🏫</div>
        <h1 className="font-display text-2xl text-white mb-3">Teacher Dashboard</h1>
        <p className="text-white/50 mb-6">Sign in with a cloud account to create and manage a classroom.</p>
        <button className="btn-primary" onClick={() => navigate('/auth')}>Sign In / Sign Up</button>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg print:bg-white">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div className="text-center mb-8 print:mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-5xl mb-3 print:hidden">👨‍🏫</div>
          <h1 className="font-display text-3xl text-white print:text-black">
            {classInfo ? classInfo.name : 'Teacher Dashboard'}
          </h1>
          {classInfo && (
            <p className="text-white/50 text-sm mt-1 print:text-gray-600">
              {AGE_OPTIONS.find((a) => a.id === classInfo.ageTrack)?.label} · {roster.length} student{roster.length !== 1 ? 's' : ''}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-6 h-6 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
          </div>
        ) : !classInfo ? (
          /* ── Create Class ── */
          <motion.div className="max-w-md mx-auto card-glass p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-xl text-white mb-5">Create Your Classroom</h2>

            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Class Name</label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green text-sm mb-4"
              placeholder="e.g. SS2 Economics 2025"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />

            <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Student Age Track</label>
            <div className="space-y-2 mb-5">
              {AGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                    classTrack === opt.id ? 'border-naira-green bg-naira-green/15 text-white' : 'border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                  onClick={() => setClassTrack(opt.id)}
                >
                  <span>{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-white/30 mb-4">
              A 6-character class code will be generated automatically. Share it with students to join.
            </p>
            {formError && <p className="text-red-400 text-xs mb-3">{formError}</p>}
            <button
              className="btn-primary w-full"
              onClick={handleCreateClass}
              disabled={submitting || !className.trim()}
            >
              {submitting ? '…' : 'Create Classroom →'}
            </button>
          </motion.div>
        ) : (
          /* ── Manage Class ── */
          <>
            {/* Class code card */}
            <div className="card-glass p-4 mb-5 flex items-center gap-4 print:hidden">
              <div className="flex-1">
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Class Code</p>
                <code className="text-2xl font-bold text-naira-green tracking-widest">{classInfo.classCode}</code>
                <p className="text-xs text-white/30 mt-0.5">Students go to NairaQuest → Join Class → enter this code</p>
              </div>
              <button
                className="px-4 py-2 rounded-xl bg-naira-green/10 border border-naira-green/30 text-naira-green text-sm hover:bg-naira-green/20 transition-colors"
                onClick={handleCopyCode}
              >
                {codeCopied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-5 print:hidden">
              {(['roster', 'analytics', 'assign'] as const).map((t) => (
                <button
                  key={t}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-naira-green text-white' : 'text-white/40 hover:text-white/70'}`}
                  onClick={() => { setTab(t); sound.click(); }}
                >
                  {t === 'roster' ? '📋 Roster' : t === 'analytics' ? '📊 Analytics' : '🎯 Assign Focus'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'roster' ? (
                <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Print header */}
                  <div className="hidden print:block mb-6">
                    <h2 className="text-xl font-bold text-black">Class Roster — {classInfo.name}</h2>
                    <p className="text-gray-600 text-sm">Generated {new Date().toLocaleDateString()}</p>
                  </div>

                  {roster.length === 0 ? (
                    <div className="text-center py-12 text-white/30">
                      <div className="text-4xl mb-3">📋</div>
                      <p>No students yet. Share the class code with your students.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {roster.map((student, i) => {
                        const pct = Math.min(100, Math.round((student.totalMastery / 300) * 100));
                        const daysSince = student.lastPlayed
                          ? Math.floor((Date.now() - new Date(student.lastPlayed).getTime()) / 86400000)
                          : null;
                        return (
                          <motion.div
                            key={student.userId}
                            className="card-glass p-4 print:border print:border-gray-200 print:rounded-none print:mb-2"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-naira-green/20 flex items-center justify-center font-bold text-naira-green text-sm flex-shrink-0 print:bg-green-100">
                                {student.displayName[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-white print:text-black truncate">{student.displayName}</span>
                                  <span className="text-xs text-naira-gold flex-shrink-0 ml-2">Lv {student.level}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden print:bg-gray-200">
                                    <div className="h-full rounded-full bg-naira-green print:bg-green-500" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs text-white/40 print:text-gray-500 flex-shrink-0">{pct}%</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-3">
                                <p className="text-xs text-white/30 print:text-gray-400">
                                  {daysSince === null ? 'Never' : daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                                </p>
                                <p className="text-xs text-white/20 print:text-gray-300">{student.earnedBadgeIds.length} badges</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {roster.length > 0 && (
                    <button
                      className="mt-5 w-full py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:bg-white/5 transition-colors print:hidden"
                      onClick={() => window.print()}
                    >
                      🖨️ Print / Export Roster
                    </button>
                  )}
                </motion.div>
              ) : tab === 'analytics' ? (
                <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {roster.length === 0 ? (
                    <div className="text-center py-12 text-white/30">
                      <p>No student data yet.</p>
                    </div>
                  ) : (
                    <>
                      {/* Strongest + weakest */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="card-glass p-4">
                          <p className="text-xs text-naira-green uppercase tracking-wide mb-2">💪 Strongest</p>
                          {sortedStrong.slice(0, 3).map((s) => {
                            const cat = CATEGORY_MAP[s.categoryId];
                            return (
                              <div key={s.categoryId} className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm">{cat?.emoji}</span>
                                <span className="text-xs text-white/70 truncate flex-1">{cat?.name}</span>
                                <span className="text-xs text-naira-green flex-shrink-0">{Math.round(s.avgMastery * 100)}%</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="card-glass p-4">
                          <p className="text-xs text-red-400 uppercase tracking-wide mb-2">⚠️ Needs Work</p>
                          {sortedWeak.slice(0, 3).map((s) => {
                            const cat = CATEGORY_MAP[s.categoryId];
                            return (
                              <div key={s.categoryId} className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm">{cat?.emoji}</span>
                                <span className="text-xs text-white/70 truncate flex-1">{cat?.name}</span>
                                <span className="text-xs text-red-400 flex-shrink-0">{Math.round(s.avgMastery * 100)}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Full category grid */}
                      <h3 className="text-sm font-bold text-white/50 mb-3">All Zones — Class Coverage</h3>
                      <div className="space-y-3">
                        {categoryStats.map((s) => {
                          const cat = CATEGORY_MAP[s.categoryId];
                          if (!cat) return null;
                          return (
                            <div key={s.categoryId} className="card-glass p-3">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl">{cat.emoji}</span>
                                <span className="text-sm text-white flex-1">{cat.name}</span>
                                <span className="text-xs text-white/40">{s.playedCount}/{roster.length} played</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-white/40">
                                  <span>Class avg mastery</span>
                                  <span style={{ color: s.avgMastery >= 0.6 ? '#22c55e' : s.avgMastery >= 0.3 ? '#f59e0b' : '#ef4444' }}>
                                    {Math.round(s.avgMastery * 100)}%
                                  </span>
                                </div>
                                <MasteryBar percent={s.avgMastery} color={cat.color} showPercent={false} height="h-1.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="assign" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-sm text-white/50 mb-4">
                    Assign a focus zone for the week. Students will see a highlighted banner on that zone.
                  </p>
                  {classInfo.focusCategoryId && (
                    <div className="mb-4 p-3 rounded-xl border border-naira-gold/30 bg-naira-gold/10 flex items-center gap-3">
                      <span className="text-2xl">{CATEGORY_MAP[classInfo.focusCategoryId]?.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white">Currently Assigned:</p>
                        <p className="text-xs text-naira-gold">{CATEGORY_MAP[classInfo.focusCategoryId]?.name}</p>
                      </div>
                      <button className="text-xs text-white/30 hover:text-red-400 transition-colors" onClick={() => handleSetFocus(null)}>
                        Clear
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => {
                      const isFocused = classInfo.focusCategoryId === cat.id;
                      const stat = categoryStats.find((s) => s.categoryId === cat.id);
                      return (
                        <motion.button
                          key={cat.id}
                          className="card-glass p-4 text-left transition-all border"
                          style={{
                            borderColor: isFocused ? cat.color : 'rgba(255,255,255,0.06)',
                            background: isFocused ? cat.color + '15' : undefined,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSetFocus(isFocused ? null : cat.id)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{cat.emoji}</span>
                            {isFocused && <span className="text-xs text-naira-gold ml-auto">📌</span>}
                          </div>
                          <p className="text-xs font-medium text-white">{cat.name}</p>
                          {stat && stat.playedCount > 0 && (
                            <p className="text-xs text-white/30 mt-0.5">{Math.round(stat.avgMastery * 100)}% class avg</p>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Class leaderboard link */}
            <div className="mt-6 flex gap-3 print:hidden">
              <button
                className="flex-1 py-3 rounded-2xl border border-naira-green/30 text-naira-green text-sm hover:bg-naira-green/10 transition-colors"
                onClick={() => navigate(`/class/${classInfo.id}/leaderboard`)}
              >
                🏆 Class Leaderboard
              </button>
              <button
                className="py-3 px-4 rounded-2xl border border-red-500/20 text-red-400/60 text-sm hover:border-red-500/40 hover:text-red-400 transition-colors"
                onClick={handleDeleteClass}
              >
                Delete Class
              </button>
            </div>
          </>
        )}

        <button className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors print:hidden" onClick={() => navigate('/map')}>
          ← World Map
        </button>
      </main>
    </div>
  );
}
