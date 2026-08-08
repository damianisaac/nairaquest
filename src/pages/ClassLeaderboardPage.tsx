import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchClassRoster } from '../lib/supabase-social';
import { CATEGORY_MAP } from '../data/categories';
import TopNav from '../components/ui/TopNav';
import { sound } from '../components/ui/SoundController';
import type { ClassMemberRow } from '../types';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ClassLeaderboardPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { classContext } = useGameStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<ClassMemberRow[]>([]);
  const [className, setClassName] = useState(classContext?.className ?? 'Class');
  const [focusCategoryId, setFocusCategoryId] = useState(classContext?.focusCategoryId ?? null);

  const isCloud = isSupabaseConfigured && !!user;

  useEffect(() => {
    if (!isCloud || !classId) { setLoading(false); return; }
    fetchClassRoster(classId).then((rows) => {
      setRoster(rows.sort((a, b) => b.totalMastery - a.totalMastery));
      setLoading(false);
    });
    // If classContext is stale, refresh focus from store
    if (classContext?.classId === classId) {
      setFocusCategoryId(classContext.focusCategoryId);
      setClassName(classContext.className);
    }
  }, [isCloud, classId, classContext]);

  if (!isCloud) return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-28 pb-12 px-4 max-w-lg mx-auto text-center">
        <p className="text-white/50 mb-4">Sign in to view the class leaderboard.</p>
        <button className="btn-primary" onClick={() => navigate('/auth')}>Sign In</button>
      </main>
    </div>
  );

  const focusCat = focusCategoryId ? CATEGORY_MAP[focusCategoryId] : null;

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-3xl text-white">{className}</h1>
          <p className="text-white/40 text-sm mt-1">Class Leaderboard — ranked by total mastery XP</p>
        </motion.div>

        {/* Focus zone banner */}
        {focusCat && (
          <motion.div
            className="mb-5 p-3 rounded-2xl border border-naira-gold/30 bg-naira-gold/10 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-2xl">{focusCat.emoji}</span>
            <div>
              <p className="text-xs text-naira-gold uppercase tracking-wide">📌 This Week's Focus</p>
              <p className="text-sm text-white">{focusCat.name}</p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-6 h-6 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
          </div>
        ) : roster.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <div className="text-4xl mb-3">🏫</div>
            <p>No students in this class yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roster.map((student, i) => {
              const isMe = student.userId === user!.id;
              const rank = i + 1;
              const medal = MEDALS[i] ?? null;
              const pct = Math.min(100, Math.round((student.totalMastery / 300) * 100));
              const daysSince = student.lastPlayed
                ? Math.floor((Date.now() - new Date(student.lastPlayed).getTime()) / 86400000)
                : null;

              return (
                <motion.div
                  key={student.userId}
                  className={`card-glass p-4 flex items-center gap-3 ${isMe ? 'border-naira-green/40' : ''}`}
                  style={isMe ? { borderColor: '#22c55e40', background: '#22c55e08' } : {}}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-sm text-white/30 font-bold">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      background: isMe ? '#22c55e25' : rank <= 3 ? '#d4af3715' : 'rgba(255,255,255,0.08)',
                      color: isMe ? '#22c55e' : rank <= 3 ? '#d4af37' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {student.displayName[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{student.displayName}</span>
                      {isMe && <span className="text-xs text-naira-green flex-shrink-0">(you)</span>}
                      <span className="ml-auto text-xs text-naira-gold flex-shrink-0">Lv {student.level}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: isMe ? '#22c55e' : rank <= 3 ? '#d4af37' : 'rgba(255,255,255,0.3)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.04 }}
                        />
                      </div>
                      <span className="text-xs text-white/40 flex-shrink-0">{student.totalMastery} XP</span>
                    </div>
                    {/* Focus category progress */}
                    {focusCat && (
                      <p className="text-xs text-white/25 mt-0.5">
                        {daysSince === null ? 'Never played' : daysSince === 0 ? 'Active today' : `Last active ${daysSince}d ago`}
                      </p>
                    )}
                  </div>

                  {/* Badge count */}
                  {student.earnedBadgeIds.length > 0 && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-naira-gold">🏅 {student.earnedBadgeIds.length}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Note: no wallet data shown here */}
        <p className="text-center text-xs text-white/20 mt-8">
          Ranked by learning mastery XP only — not wallet credits.
        </p>

        <button
          className="mt-4 block mx-auto text-sm text-white/30 hover:text-white/60 transition-colors"
          onClick={() => { sound.click(); navigate('/map'); }}
        >
          ← World Map
        </button>
      </main>
    </div>
  );
}
