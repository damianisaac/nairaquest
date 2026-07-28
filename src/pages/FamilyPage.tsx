import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  createFamily,
  joinFamilyByCode,
  fetchMyFamily,
  leaveFamilyGroup,
  createDuel,
  fetchFamilyDuels,
} from '../lib/supabase-social';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { generateInviteCode, sampleDuelQuestions } from '../utils/social';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import { sound } from '../components/ui/SoundController';
import type { CategoryId, Difficulty, FamilyGroup, Duel, FamilyMember } from '../types';

// ─── Family milestone tiers ───────────────────────────────────────────────────
const MILESTONES = [
  { key: 'study-buddies', label: 'Study Buddies', requiredXP: 300, emoji: '🌱', crest: '🤝' },
  { key: 'learning-household', label: 'Learning Household', requiredXP: 750, emoji: '📚', crest: '🏠' },
  { key: 'knowledge-family', label: 'Knowledge Family', requiredXP: 1500, emoji: '🧠', crest: '🏛️' },
  { key: 'financial-champions', label: 'Financial Champions', requiredXP: 3000, emoji: '🏆', crest: '👑' },
];

const DIFF_INFO: Record<Difficulty, { emoji: string; label: string; color: string }> = {
  easy: { emoji: '🌱', label: 'Easy', color: '#22c55e' },
  medium: { emoji: '⚡', label: 'Medium', color: '#f59e0b' },
  hard: { emoji: '🔥', label: 'Hard', color: '#ef4444' },
};

function getWeeklyChampion(duels: Duel[], members: FamilyMember[]): { member: FamilyMember; wins: number } | null {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recent = duels.filter((d) => d.status === 'completed' && new Date(d.createdAt) > weekAgo);
  const wins: Record<string, number> = {};
  for (const d of recent) {
    const iScore = d.initiatorScore ?? 0;
    const oScore = d.opponentScore ?? 0;
    if (iScore > oScore) wins[d.initiatorId] = (wins[d.initiatorId] ?? 0) + 1;
    else if (oScore > iScore) wins[d.opponentId] = (wins[d.opponentId] ?? 0) + 1;
  }
  const sorted = Object.entries(wins).sort(([, a], [, b]) => b - a);
  if (!sorted.length) return null;
  const [champId, champWins] = sorted[0];
  const member = members.find((m) => m.userId === champId);
  return member ? { member, wins: champWins } : null;
}

export default function FamilyPage() {
  const navigate = useNavigate();
  const { profile } = useGameStore();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [tab, setTab] = useState<'hub' | 'duels'>('hub');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Duel invite state
  const [duelOpponent, setDuelOpponent] = useState<FamilyMember | null>(null);
  const [duelCategory, setDuelCategory] = useState<CategoryId>('money-basics');
  const [duelDifficulty, setDuelDifficulty] = useState<Difficulty>('easy');

  const isCloud = isSupabaseConfigured && !!user;

  useEffect(() => {
    if (!isCloud) { setLoading(false); return; }
    fetchMyFamily(user!.id).then(({ family: f }) => {
      setFamily(f);
      if (f) fetchFamilyDuels(f.id).then(setDuels);
      setLoading(false);
    });
  }, [isCloud, user]);

  if (!profile) { navigate('/'); return null; }
  if (!isCloud) {
    return (
      <div className="min-h-screen bg-gray-950 ankara-bg">
        <TopNav />
        <main className="pt-24 pb-12 px-4 max-w-lg mx-auto">
          {/* Hero */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-6xl mb-3">👨‍👩‍👧</div>
            <h1 className="font-display text-3xl text-white mb-2">Family Hub</h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Learn together, compete together, grow together. Family Hub brings your whole household into the financial literacy adventure.
            </p>
          </motion.div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { emoji: '🏆', title: 'Family Challenges', desc: 'Friendly quiz duels between family members' },
              { emoji: '📊', title: 'Family Progress', desc: 'See everyone\'s mastery and level up together' },
              { emoji: '🌱', title: 'Family Milestones', desc: 'Unlock family crests as your household learns' },
              { emoji: '👨‍👩‍👧', title: 'Up to 8 Members', desc: 'Invite parents, siblings, cousins — anyone!' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                className="card-glass p-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.35 }}
              >
                <div className="text-2xl mb-2">{f.emoji}</div>
                <div className="text-white/90 text-sm font-semibold mb-1">{f.title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{f.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* How it works */}
          <motion.div
            className="card-glass p-5 mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-display text-white text-base mb-3">How It Works</h2>
            <div className="space-y-3">
              {[
                { step: '1', text: 'One family member creates a Family Hub and gets a unique invite code' },
                { step: '2', text: 'Share the code with family — everyone joins with their own profile' },
                { step: '3', text: 'Challenge each other to quiz duels, track progress, and climb the family leaderboard' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-naira-green/20 border border-naira-green/40 flex items-center justify-center text-naira-green text-xs font-bold flex-shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="p-3 rounded-xl bg-naira-gold/10 border border-naira-gold/25 mb-4">
              <p className="text-naira-gold/80 text-xs">☁️ Family Hub requires a cloud account. Sign up to enable cross-device sync and family features.</p>
            </div>
            <button
              className="btn-primary w-full mb-3"
              onClick={() => { sound.click(); navigate('/auth'); }}
            >
              Sign Up / Sign In →
            </button>
            <button
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
              onClick={() => { sound.click(); navigate('/map'); }}
            >
              ← Back to World Map
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  const totalFamilyXP = (family?.members ?? []).reduce((sum, m) => sum + m.totalMastery, 0);
  const highestMilestone = MILESTONES.filter((m) => totalFamilyXP >= m.requiredXP).pop();
  const nextMilestone = MILESTONES.find((m) => totalFamilyXP < m.requiredXP) ?? null;
  const progressPct = nextMilestone
    ? Math.min(100, ((totalFamilyXP - (highestMilestone?.requiredXP ?? 0)) /
        (nextMilestone.requiredXP - (highestMilestone?.requiredXP ?? 0))) * 100)
    : 100;
  const pendingDuels = duels.filter((d) => d.status === 'pending' && (d.opponentId === user!.id && d.opponentScore === null) || (d.initiatorId === user!.id && d.initiatorScore === null));
  const champion = family ? getWeeklyChampion(duels, family.members) : null;

  const handleCreateFamily = async () => {
    if (!familyName.trim()) return;
    setSubmitting(true); setFormError(null);
    const code = generateInviteCode();
    const { family: f, error } = await createFamily(user!.id, familyName.trim(), code);
    if (error) { setFormError(error); setSubmitting(false); return; }
    setFamily(f); setShowCreateForm(false); setFamilyName(''); setSubmitting(false);
  };

  const handleJoinFamily = async () => {
    if (!inviteCodeInput.trim()) return;
    setSubmitting(true); setFormError(null);
    const { error } = await joinFamilyByCode(user!.id, inviteCodeInput.trim());
    if (error) { setFormError(error); setSubmitting(false); return; }
    const { family: f } = await fetchMyFamily(user!.id);
    setFamily(f);
    if (f) fetchFamilyDuels(f.id).then(setDuels);
    setShowJoinForm(false); setInviteCodeInput(''); setSubmitting(false);
  };

  const handleLeaveFamily = async () => {
    if (!family || !confirm('Leave this family group? You can rejoin with the invite code.')) return;
    await leaveFamilyGroup(user!.id, family.id);
    setFamily(null); setDuels([]);
  };

  const handleSendDuel = async () => {
    if (!family || !duelOpponent) return;
    setSubmitting(true);
    const questionIds = sampleDuelQuestions(duelCategory, duelDifficulty, profile.ageTrack, 5);
    if (questionIds.length === 0) { setFormError('Not enough questions for this combination.'); setSubmitting(false); return; }
    const { duel, error } = await createDuel({
      familyId: family.id,
      categoryId: duelCategory,
      difficulty: duelDifficulty,
      initiatorId: user!.id,
      initiatorName: profile.name,
      opponentId: duelOpponent.userId,
      opponentName: duelOpponent.name,
      questionIds,
    });
    setSubmitting(false);
    if (error || !duel) { setFormError(error ?? 'Failed to create duel'); return; }
    setShowDuelModal(false);
    navigate(`/duel/${duel.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-5xl mb-3">{highestMilestone?.crest ?? '👨‍👩‍👧'}</div>
          <h1 className="font-display text-3xl text-white">
            {family ? family.name : 'Family Challenges'}
          </h1>
          {family && highestMilestone && (
            <p className="text-naira-gold text-sm mt-1">{highestMilestone.emoji} {highestMilestone.label}</p>
          )}
          {!family && <p className="text-white/50 text-sm mt-1">Create or join a family group to compete together</p>}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-6 h-6 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
          </div>
        ) : !family ? (
          /* ── No Family ── */
          <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!showCreateForm && !showJoinForm && (
              <>
                <button
                  className="w-full card-glass p-5 text-left flex items-center gap-4 hover:border-naira-green/40 transition-colors border border-white/10"
                  onClick={() => { sound.click(); setShowCreateForm(true); }}
                >
                  <span className="text-3xl">🏠</span>
                  <div>
                    <div className="font-display text-white">Create Family Group</div>
                    <div className="text-xs text-white/50 mt-0.5">Name your household and invite others</div>
                  </div>
                </button>
                <button
                  className="w-full card-glass p-5 text-left flex items-center gap-4 hover:border-naira-green/40 transition-colors border border-white/10"
                  onClick={() => { sound.click(); setShowJoinForm(true); }}
                >
                  <span className="text-3xl">🔗</span>
                  <div>
                    <div className="font-display text-white">Join with Invite Code</div>
                    <div className="text-xs text-white/50 mt-0.5">Enter the code shared by a family member</div>
                  </div>
                </button>
              </>
            )}

            {showCreateForm && (
              <div className="card-glass p-5">
                <h3 className="font-display text-white mb-4">Name Your Family Group</h3>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green text-sm mb-3"
                  placeholder="e.g. The Adeyemi Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFamily()}
                />
                {formError && <p className="text-red-400 text-xs mb-3">{formError}</p>}
                <div className="flex gap-2">
                  <button className="btn-primary flex-1 py-2 text-sm" onClick={handleCreateFamily} disabled={submitting || !familyName.trim()}>
                    {submitting ? '…' : 'Create Family'}
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm" onClick={() => setShowCreateForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            {showJoinForm && (
              <div className="card-glass p-5">
                <h3 className="font-display text-white mb-4">Enter Invite Code</h3>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-naira-green text-sm mb-3 uppercase tracking-widest"
                  placeholder="NAIRA-XXXX"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinFamily()}
                />
                {formError && <p className="text-red-400 text-xs mb-3">{formError}</p>}
                <div className="flex gap-2">
                  <button className="btn-primary flex-1 py-2 text-sm" onClick={handleJoinFamily} disabled={submitting || !inviteCodeInput.trim()}>
                    {submitting ? '…' : 'Join Family'}
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm" onClick={() => setShowJoinForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Has Family ── */
          <>
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-5">
              {(['hub', 'duels'] as const).map((t) => (
                <button
                  key={t}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? 'bg-naira-green text-white' : 'text-white/40 hover:text-white/70'}`}
                  onClick={() => { setTab(t); sound.click(); }}
                >
                  {t === 'hub' ? '🏠 Family Hub' : `⚔️ Duels${pendingDuels.length ? ` (${pendingDuels.length})` : ''}`}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'hub' ? (
                <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                  {/* Family Progress Bar */}
                  <div className="card-glass p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-white text-sm">Family Progress</h3>
                      <span className="text-naira-gold font-bold text-sm">{totalFamilyXP.toLocaleString()} XP</span>
                    </div>
                    {nextMilestone ? (
                      <>
                        <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-2">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #22c55e, #d4af37)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-xs text-white/50">
                          {nextMilestone.emoji} <span className="text-white/70">{nextMilestone.label}</span> — {nextMilestone.requiredXP - totalFamilyXP} XP to go
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-naira-green text-sm">✓ Maximum milestone reached! 🏆</span>
                      </div>
                    )}
                    {/* Milestone icons */}
                    <div className="flex gap-3 mt-4">
                      {MILESTONES.map((m) => (
                        <div key={m.key} className="flex flex-col items-center gap-1" title={m.label}>
                          <span className={`text-xl ${totalFamilyXP >= m.requiredXP ? 'opacity-100' : 'opacity-20'}`}>{m.crest}</span>
                          <span className="text-[10px] text-white/30">{m.requiredXP >= 1000 ? `${m.requiredXP / 1000}k` : m.requiredXP}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Champion */}
                  {champion && (
                    <motion.div
                      className="card-glass p-4 border border-naira-gold/30"
                      style={{ background: 'linear-gradient(135deg, #d4af3710 0%, #b8960f08 100%)' }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👑</span>
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-wide">Champion of the Week</p>
                          <p className="font-display text-naira-gold">{champion.member.name}</p>
                          <p className="text-xs text-white/50">{champion.wins} duel win{champion.wins !== 1 ? 's' : ''} this week</p>
                        </div>
                        <span className="ml-auto text-3xl">{champion.member.avatarSeed.slice(0, 2)}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Members */}
                  <div className="space-y-3">
                    <h3 className="font-display text-white text-sm">Members ({family.members.length})</h3>
                    {family.members.map((member, i) => {
                      const pct = Math.min(100, Math.round((member.totalMastery / 3000) * 100));
                      const isMe = member.userId === user!.id;
                      return (
                        <motion.div
                          key={member.userId}
                          className="card-glass p-4 flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="w-9 h-9 rounded-full bg-naira-green/20 flex items-center justify-center font-bold text-naira-green text-sm flex-shrink-0">
                            {member.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">{member.name}</span>
                              {isMe && <span className="text-xs text-white/30">(you)</span>}
                              <span className="ml-auto text-xs text-naira-gold flex-shrink-0">Lv {member.level}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-naira-green" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-white/40 flex-shrink-0">{member.totalMastery} XP</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Invite + Leave buttons */}
                  <button
                    className="w-full py-3 rounded-2xl border border-naira-green/30 text-naira-green text-sm hover:bg-naira-green/10 transition-colors"
                    onClick={() => { sound.click(); setShowInviteModal(true); }}
                  >
                    🔗 Invite Family Member
                  </button>
                  <button
                    className="w-full py-2 text-sm text-white/25 hover:text-red-400 transition-colors"
                    onClick={handleLeaveFamily}
                  >
                    Leave Family Group
                  </button>
                </motion.div>
              ) : (
                /* ── Duels Tab ── */
                <motion.div key="duels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                  {/* Pending duels (your turn) */}
                  {pendingDuels.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 mb-3">⏳ Your Turn to Play</h3>
                      {pendingDuels.map((d) => {
                        const cat = CATEGORY_MAP[d.categoryId];
                        const isInitiator = d.initiatorId === user!.id;
                        const myScore = isInitiator ? d.initiatorScore : d.opponentScore;
                        if (myScore !== null) return null; // already played
                        return (
                          <div key={d.id} className="card-glass p-4 mb-3 flex items-center gap-3">
                            <span className="text-2xl">{cat?.emoji ?? '⚔️'}</span>
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">{cat?.name ?? d.categoryId}</p>
                              <p className="text-xs text-white/50">vs {isInitiator ? d.opponentName : d.initiatorName} · {DIFF_INFO[d.difficulty].emoji} {DIFF_INFO[d.difficulty].label}</p>
                            </div>
                            <button className="btn-primary py-1.5 px-4 text-xs" onClick={() => navigate(`/duel/${d.id}`)}>
                              Play →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Send new duel */}
                  <button
                    className="w-full card-glass p-4 flex items-center gap-3 border border-white/10 hover:border-naira-green/40 transition-colors"
                    onClick={() => { sound.click(); setShowDuelModal(true); setFormError(null); setDuelOpponent(null); }}
                  >
                    <span className="text-2xl">⚔️</span>
                    <div className="text-left">
                      <div className="text-sm font-display text-white">Challenge a Family Member</div>
                      <div className="text-xs text-white/50">Same questions, separate answers — who wins?</div>
                    </div>
                  </button>

                  {/* Duel history */}
                  {duels.filter((d) => d.status === 'completed').length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-white/50 mb-3">Recent Completed Duels</h3>
                      {duels.filter((d) => d.status === 'completed').slice(0, 10).map((d) => {
                        const cat = CATEGORY_MAP[d.categoryId];
                        const isInitiator = d.initiatorId === user!.id;
                        const myScore = isInitiator ? d.initiatorScore ?? 0 : d.opponentScore ?? 0;
                        const theirScore = isInitiator ? d.opponentScore ?? 0 : d.initiatorScore ?? 0;
                        const won = myScore > theirScore;
                        const tied = myScore === theirScore;
                        return (
                          <div
                            key={d.id}
                            className="card-glass p-3 mb-2 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => navigate(`/duel/${d.id}/results`)}
                          >
                            <span className="text-xl">{cat?.emoji ?? '⚔️'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white/60 truncate">{cat?.name ?? d.categoryId}</p>
                              <p className="text-xs text-white/40">vs {isInitiator ? d.opponentName : d.initiatorName}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-sm font-bold ${won ? 'text-naira-green' : tied ? 'text-white/50' : 'text-red-400'}`}>
                                {myScore}/{d.questionIds.length}
                              </span>
                              <p className="text-xs text-white/30">{won ? '🏆 Won' : tied ? '🤝 Tied' : 'Lost'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {duels.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                      <div className="text-4xl mb-3">⚔️</div>
                      <p>No duels yet — challenge a family member!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <button className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors" onClick={() => navigate('/map')}>
          ← World Map
        </button>
      </main>

      {/* ── Invite Code Modal ── */}
      <AnimatePresence>
        {showInviteModal && family && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}>
            <motion.div className="card-glass p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="font-display text-xl text-white mb-2">Invite Link</h3>
              <p className="text-sm text-white/50 mb-4">Share this code with the family member you want to add:</p>
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 text-center text-xl font-bold text-naira-green bg-naira-green/10 px-4 py-3 rounded-xl tracking-widest">
                  {family.inviteCode}
                </code>
                <button
                  className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-white/10 transition-colors"
                  onClick={() => { navigator.clipboard.writeText(family.inviteCode); sound.click(); }}
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-white/30 mb-4">They enter this code at NairaQuest → Family → "Join with Invite Code"</p>
              <button className="w-full py-2 rounded-xl bg-white/5 text-white/50 text-sm" onClick={() => setShowInviteModal(false)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Duel Invite Modal ── */}
      <AnimatePresence>
        {showDuelModal && family && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDuelModal(false)}>
            <motion.div className="card-glass p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="font-display text-xl text-white">Challenge a Member</h3>

              {/* Select opponent */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Opponent</label>
                <div className="space-y-2">
                  {family.members.filter((m) => m.userId !== user!.id).map((m) => (
                    <button key={m.userId}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${duelOpponent?.userId === m.userId ? 'border-naira-green bg-naira-green/15 text-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                      onClick={() => setDuelOpponent(m)}>
                      <span className="w-7 h-7 rounded-full bg-naira-green/20 flex items-center justify-center text-xs font-bold text-naira-green">{m.name[0]}</span>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select category */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Zone</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-naira-green"
                  value={duelCategory}
                  onChange={(e) => setDuelCategory(e.target.value as CategoryId)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Select difficulty */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wide mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button key={d}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${duelDifficulty === d ? 'border-current' : 'border-white/10 text-white/40'}`}
                      style={{ color: duelDifficulty === d ? DIFF_INFO[d].color : undefined }}
                      onClick={() => setDuelDifficulty(d)}>
                      {DIFF_INFO[d].emoji} {DIFF_INFO[d].label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-red-400 text-xs">{formError}</p>}

              <div className="flex gap-2 pt-1">
                <button className="btn-primary flex-1 py-2.5 text-sm" onClick={handleSendDuel} disabled={!duelOpponent || submitting}>
                  {submitting ? '…' : '⚔️ Challenge & Play →'}
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm" onClick={() => setShowDuelModal(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
