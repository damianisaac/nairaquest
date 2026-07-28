import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchDuel } from '../lib/supabase-social';
import { CATEGORY_MAP } from '../data/categories';
import { sound } from '../components/ui/SoundController';
import type { Duel } from '../types';

export default function DuelResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [duel, setDuel] = useState<Duel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCloud = isSupabaseConfigured && !!user;

  useEffect(() => {
    if (!isCloud || !id) { setLoading(false); return; }
    fetchDuel(id).then(({ duel: d, error: e }) => {
      if (e || !d) { setError(e ?? 'Duel not found'); }
      else { setDuel(d); if (d.status === 'completed') sound.levelUp(); }
      setLoading(false);
    });
  }, [isCloud, id, user]);

  if (!isCloud) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-center">
      <div>
        <p className="text-white/50 mb-4">Sign in to view duel results.</p>
        <button className="btn-primary" onClick={() => navigate('/auth')}>Sign In</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-white/20 border-t-naira-green rounded-full animate-spin" />
    </div>
  );

  if (error || !duel) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-center">
      <div>
        <p className="text-white/50 mb-4">{error ?? 'Duel not found.'}</p>
        <button className="btn-primary" onClick={() => navigate('/family')}>Back to Family</button>
      </div>
    </div>
  );

  const cat = CATEGORY_MAP[duel.categoryId];
  const total = duel.questionIds.length;
  const isInitiator = duel.initiatorId === user!.id;
  const myName = isInitiator ? duel.initiatorName : duel.opponentName;
  const theirName = isInitiator ? duel.opponentName : duel.initiatorName;
  const myScore = (isInitiator ? duel.initiatorScore : duel.opponentScore) ?? null;
  const theirScore = (isInitiator ? duel.opponentScore : duel.initiatorScore) ?? null;
  const pending = duel.status !== 'completed';
  const iWon = myScore !== null && theirScore !== null && myScore > theirScore;
  const tied = myScore !== null && theirScore !== null && myScore === theirScore;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${cat?.colorDark ?? '#0a1628'}20 0%, #030712 60%)` }}
    >
      <main className="flex-1 pt-12 pb-10 px-4 max-w-lg mx-auto w-full">

        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-5xl mb-2">⚔️</div>
          <h1 className="font-display text-2xl text-white">{cat?.name ?? 'Duel'} — Results</h1>
          <p className="text-white/40 text-sm mt-1">
            {pending ? 'Waiting for both players to complete…' : 'Final scores'}
          </p>
        </motion.div>

        {/* Head-to-head comparison */}
        <motion.div
          className="card-glass p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Me */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-naira-green/20 flex items-center justify-center font-bold text-naira-green text-lg mx-auto mb-2">
                {myName[0].toUpperCase()}
              </div>
              <p className="text-sm text-white font-medium">{myName}</p>
              <p className="text-xs text-white/40">(you)</p>
              {myScore !== null ? (
                <motion.p
                  className="font-display text-4xl mt-2"
                  style={{ color: iWon ? '#22c55e' : tied ? '#f59e0b' : '#ef4444' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                >
                  {myScore}
                </motion.p>
              ) : (
                <p className="text-white/30 text-2xl mt-2">—</p>
              )}
              <p className="text-xs text-white/30">/ {total}</p>
            </div>

            {/* VS */}
            <div className="text-center">
              <span className="text-2xl text-white/20 font-display">VS</span>
              {!pending && (
                <div className="mt-2">
                  {iWon && <div className="text-xs text-naira-green">You won!</div>}
                  {tied && <div className="text-xs text-amber-400">Tied!</div>}
                  {!iWon && !tied && myScore !== null && theirScore !== null && (
                    <div className="text-xs text-red-400">They won</div>
                  )}
                </div>
              )}
            </div>

            {/* Opponent */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-300 text-lg mx-auto mb-2">
                {theirName[0].toUpperCase()}
              </div>
              <p className="text-sm text-white font-medium">{theirName}</p>
              <p className="text-xs text-white/40">opponent</p>
              {theirScore !== null ? (
                <motion.p
                  className="font-display text-4xl mt-2"
                  style={{ color: !iWon && !tied ? '#22c55e' : tied ? '#f59e0b' : '#ef4444' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                >
                  {theirScore}
                </motion.p>
              ) : (
                <div className="mt-2">
                  <p className="text-white/30 text-2xl">—</p>
                  <p className="text-xs text-amber-400 mt-1">Hasn't played yet</p>
                </div>
              )}
              <p className="text-xs text-white/30">/ {total}</p>
            </div>
          </div>

          {/* Accuracy bars */}
          {!pending && myScore !== null && theirScore !== null && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-8 text-right">{Math.round((myScore / total) * 100)}%</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-naira-green" initial={{ width: 0 }}
                    animate={{ width: `${(myScore / total) * 100}%` }} transition={{ duration: 1, delay: 0.6 }} />
                </div>
                <span className="text-xs text-white/40 w-8">{myName.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-8 text-right">{Math.round((theirScore / total) * 100)}%</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-purple-500" initial={{ width: 0 }}
                    animate={{ width: `${(theirScore / total) * 100}%` }} transition={{ duration: 1, delay: 0.7 }} />
                </div>
                <span className="text-xs text-white/40 w-8">{theirName.split(' ')[0]}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Champion banner */}
        {!pending && iWon && (
          <motion.div
            className="mb-6 p-5 rounded-2xl text-center"
            style={{ background: 'linear-gradient(135deg, #d4af3720 0%, #22c55e15 100%)', border: '1px solid #d4af3740' }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
          >
            <div className="text-4xl mb-2">👑</div>
            <h3 className="font-display text-naira-gold text-xl">Family Champion!</h3>
            <p className="text-white/60 text-sm mt-1">You won this round — nicely done!</p>
          </motion.div>
        )}

        {!pending && tied && (
          <motion.div
            className="mb-6 p-4 rounded-2xl text-center border border-amber-500/30 bg-amber-500/10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          >
            <div className="text-3xl mb-1">🤝</div>
            <p className="font-display text-amber-300">Great match — it's a tie!</p>
          </motion.div>
        )}

        {/* Pending state */}
        {pending && myScore !== null && (
          <motion.div
            className="mb-6 p-4 rounded-2xl text-center border border-white/10 bg-white/5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-white/60 text-sm">Waiting for <strong className="text-white">{theirName}</strong> to play…</p>
            <p className="text-white/30 text-xs mt-1">Check back later for the final result.</p>
          </motion.div>
        )}

        {/* Zone info */}
        <div className="card-glass p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat?.emoji}</span>
            <div>
              <p className="text-sm text-white">{cat?.name}</p>
              <p className="text-xs text-white/40 capitalize">{duel.difficulty} difficulty · {total} questions</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            className="btn-primary w-full"
            onClick={() => { sound.click(); navigate('/family'); }}
          >
            Back to Family Hub
          </button>
          <button
            className="w-full py-3 rounded-2xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
            onClick={() => { sound.click(); navigate('/map'); }}
          >
            World Map
          </button>
        </div>
      </main>
    </div>
  );
}
