import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, selectMasteryPercent } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import {
  isSupabaseConfigured,
  fetchGlobalLeaderboard,
  fetchCategoryLeaderboard,
  type LeaderboardRow,
  type CategoryLeaderboardRow,
} from '../lib/supabase';
import { CATEGORIES } from '../data/categories';
import TopNav from '../components/ui/TopNav';
import MasteryBar from '../components/ui/MasteryBar';
import { sound } from '../components/ui/SoundController';
import type { CategoryId } from '../types';

type BoardFilter = 'global' | CategoryId;

// Local leaderboard built from local progress (no backend needed)
function buildLocalBoard(state: ReturnType<typeof useGameStore.getState>) {
  const { profile } = state;
  if (!profile) return [];
  return CATEGORIES.map((cat) => ({
    categoryId: cat.id,
    name: cat.name,
    color: cat.color,
    mastery: selectMasteryPercent(state, cat.id),
  }));
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const state = useGameStore();
  const { user } = useAuth();
  const { profile } = state;

  const [filter, setFilter] = useState<BoardFilter>('global');
  const [globalRows, setGlobalRows] = useState<LeaderboardRow[]>([]);
  const [catRows, setCatRows] = useState<CategoryLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);

  const isCloud = isSupabaseConfigured && !!user;

  useEffect(() => {
    if (!isCloud) return;
    setLoading(true);

    const load = async () => {
      if (filter === 'global') {
        const { data } = await fetchGlobalLeaderboard();
        setGlobalRows(data ?? []);
      } else {
        const { data } = await fetchCategoryLeaderboard(filter as CategoryId);
        setCatRows((data as CategoryLeaderboardRow[]) ?? []);
      }
      setLoading(false);
    };
    load();
  }, [filter, isCloud]);

  if (!profile) { navigate('/'); return null; }

  const localBoard = buildLocalBoard(state);
  const selectedCat = filter !== 'global' ? CATEGORIES.find((c) => c.id === filter) : null;

  return (
    <div className="min-h-screen bg-gray-950 ankara-bg">
      <TopNav />
      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-3xl text-white">Leaderboard</h1>
          <p className="text-white/50 text-sm mt-1">
            {isCloud ? 'Live rankings from all players' : 'Sign in to see global rankings'}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-2 mb-5 snap-x"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FilterChip
            active={filter === 'global'}
            label="🌍 Global"
            onClick={() => { setFilter('global'); sound.click(); }}
          />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              active={filter === cat.id}
              label={`${cat.emoji} ${cat.name}`}
              color={cat.color}
              onClick={() => { setFilter(cat.id as CategoryId); sound.click(); }}
            />
          ))}
        </motion.div>

        {/* Cloud board */}
        {isCloud && (
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                className="flex items-center justify-center py-16 text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="w-6 h-6 border-2 border-white/20 border-t-naira-green rounded-full animate-spin mr-3" />
                Loading rankings…
              </motion.div>
            ) : filter === 'global' ? (
              <motion.div
                key="global"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {globalRows.length === 0 ? (
                  <EmptyState message="No players yet — be the first!" />
                ) : (
                  globalRows.map((row, i) => (
                    <GlobalRow
                      key={row.id}
                      row={row}
                      index={i}
                      isMe={row.id === user?.id}
                    />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {selectedCat && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                    style={{ background: selectedCat.color + '15', border: `1px solid ${selectedCat.color}30` }}
                  >
                    <span className="text-3xl">{selectedCat.emoji}</span>
                    <div>
                      <div className="font-display text-white">{selectedCat.name}</div>
                      <div className="text-xs text-white/50">{selectedCat.description}</div>
                    </div>
                  </div>
                )}
                {catRows.length === 0 ? (
                  <EmptyState message="No one has played this zone yet!" />
                ) : (
                  catRows.map((row, i) => (
                    <CategoryRow
                      key={row.user_id}
                      row={row}
                      index={i}
                      isMe={row.user_id === user?.id}
                      color={selectedCat?.color ?? '#22c55e'}
                      cap={1000}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Local summary (always shown) */}
        <motion.div
          className="mt-8 card-glass p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-base text-white mb-4">
            {isCloud ? 'Your Zone Mastery' : '📊 Your Progress (Local)'}
          </h2>
          <div className="space-y-3">
            {localBoard.map((item, i) => (
              <motion.div
                key={item.categoryId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-white/70 flex-1">{item.name}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    {Math.round(item.mastery * 100)}%
                  </span>
                </div>
                <MasteryBar percent={item.mastery} color={item.color} showPercent={false} height="h-1.5" />
              </motion.div>
            ))}
          </div>

          {!isCloud && (
            <div className="mt-4 p-3 rounded-xl bg-naira-green/10 border border-naira-green/20 text-sm text-naira-green-light">
              <span className="font-bold">Want global rankings?</span>{' '}
              <button
                className="underline hover:no-underline"
                onClick={() => { sound.click(); navigate('/auth'); }}
              >
                Create a free account
              </button>{' '}
              to sync progress and compete with players worldwide.
            </div>
          )}
        </motion.div>

        <button
          className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors"
          onClick={() => { sound.click(); navigate('/map'); }}
        >
          ← World Map
        </button>
      </main>
    </div>
  );
}

function FilterChip({
  active, label, color, onClick,
}: { active: boolean; label: string; color?: string; onClick: () => void }) {
  return (
    <button
      className="flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
      style={
        active
          ? { borderColor: color ?? '#008751', background: (color ?? '#008751') + '25', color: color ?? '#00b86a' }
          : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function GlobalRow({
  row, index, isMe,
}: { row: LeaderboardRow; index: number; isMe: boolean }) {
  const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isMe ? 'bg-naira-green/10 border border-naira-green/30' : 'bg-white/3 border border-white/6 hover:bg-white/6'
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="w-8 text-center">
        {rankEmoji ?? (
          <span className="text-xs text-white/30 font-bold">#{row.rank}</span>
        )}
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2"
        style={{ background: '#008751', borderColor: isMe ? '#00b86a' : 'transparent' }}
      >
        {row.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">
          {row.name} {isMe && <span className="text-naira-green text-xs">(you)</span>}
        </div>
        <div className="text-xs text-white/40">Level {row.level} · {row.badge_ids.length} badges</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-naira-gold">{row.total_mastery.toLocaleString()}</div>
        <div className="text-xs text-white/30">XP</div>
      </div>
    </motion.div>
  );
}

function CategoryRow({
  row, index, isMe, color, cap,
}: { row: CategoryLeaderboardRow; index: number; isMe: boolean; color: string; cap: number }) {
  const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
  const pct = Math.min(100, Math.round((row.mastery_points / cap) * 100));

  return (
    <motion.div
      className={`p-3 rounded-xl transition-colors ${
        isMe ? 'bg-naira-green/10 border border-naira-green/30' : 'bg-white/3 border border-white/6 hover:bg-white/6'
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 text-center">
          {rankEmoji ?? <span className="text-xs text-white/30 font-bold">#{row.rank}</span>}
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: '#008751' }}
        >
          {row.name[0].toUpperCase()}
        </div>
        <div className="flex-1 text-sm text-white font-medium truncate">
          {row.name} {isMe && <span className="text-naira-green text-xs">(you)</span>}
        </div>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="pl-11">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: index * 0.04 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-white/30">
      <div className="text-4xl mb-3">🏜️</div>
      <p>{message}</p>
    </div>
  );
}
