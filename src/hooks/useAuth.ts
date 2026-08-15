import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  signUp,
  signIn,
  signOut,
  getSession,
  upsertProfile,
  upsertWalletTransactions,
  fetchProfile,
  fetchAllProgress,
  upsertProgress,
} from '../lib/supabase';
import { useGameStore, selectProgress } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import type { CategoryId, CategoryProgress } from '../types';

export interface AuthState {
  user: User | null;
  loading: boolean;
  syncing: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    syncing: false,
  });

  const store = useGameStore();

  // Pull cloud progress into local store
  const pullFromCloud = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    setAuthState((s) => ({ ...s, syncing: true }));

    const [{ data: dbProfile }, { data: dbProgress }] = await Promise.all([
      fetchProfile(userId),
      fetchAllProgress(userId),
    ]);

    if (dbProfile) {
      // Merge cloud profile into local store — cloud wins for auth-managed fields
      store.createProfile(dbProfile.name, dbProfile.age_track);
      // Manually patch avatarItemIds and badges
      useGameStore.setState((s) => ({
        profile: s.profile
          ? {
              ...s.profile,
              id: userId,
              level: dbProfile.level,
              totalMasteryPoints: dbProfile.total_mastery,
              dailyStreak: dbProfile.daily_streak,
              lastPlayedDate: dbProfile.last_played,
              earnedBadgeIds: dbProfile.badge_ids,
              avatarSeed: dbProfile.avatar_seed,
              avatarItemIds: dbProfile.avatar_item_ids ?? [],
              walletBalance: dbProfile.wallet_balance ?? 0,
              walletDisclaimerSeen: dbProfile.wallet_disclaimer_seen ?? false,
            }
          : s.profile,
      }));
    }

    if (dbProgress && dbProgress.length > 0) {
      const progressMap: Record<CategoryId, CategoryProgress> = {} as Record<CategoryId, CategoryProgress>;
      for (const row of dbProgress) {
        progressMap[row.category_id as CategoryId] = {
          categoryId: row.category_id as CategoryId,
          masteryPoints: row.mastery_points,
          peakMasteryPoints: row.peak_mastery_points,
          questionsAnswered: row.questions_answered,
          lastPracticed: row.last_practiced,
          answeredQuestionIds: row.answered_question_ids ?? [],
        };
      }
      // Fill missing categories with defaults
      for (const cat of CATEGORIES) {
        if (!progressMap[cat.id]) {
          progressMap[cat.id] = {
            categoryId: cat.id,
            masteryPoints: 0,
            peakMasteryPoints: 0,
            questionsAnswered: 0,
            lastPracticed: null,
            answeredQuestionIds: [],
          };
        }
      }
      // Store cloud progress under the user's current age-track partition
      const ageTrack = useGameStore.getState().profile?.ageTrack;
      if (ageTrack) {
        useGameStore.setState((s) => ({
          progressByTrack: {
            ...s.progressByTrack,
            [ageTrack]: progressMap,
          },
        }));
      }
    }

    setAuthState((s) => ({ ...s, syncing: false }));
  }, [store]);

  // Push local state up to cloud
  const pushToCloud = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const storeState = useGameStore.getState();
    const { profile } = storeState;
    const progress = selectProgress(storeState);
    if (!profile) return;

    await upsertProfile({
      id: userId,
      name: profile.name,
      age_track: profile.ageTrack,
      avatar_seed: profile.avatarSeed,
      avatar_item_ids: (profile as typeof profile & { avatarItemIds?: string[] }).avatarItemIds ?? [],
      level: profile.level,
      total_mastery: profile.totalMasteryPoints,
      daily_streak: profile.dailyStreak,
      last_played: profile.lastPlayedDate,
      badge_ids: profile.earnedBadgeIds,
      wallet_balance: profile.walletBalance,
      wallet_disclaimer_seen: profile.walletDisclaimerSeen,
    });

    // Sync wallet transactions (only ones that haven't been synced yet)
    if (profile.walletTransactions.length > 0) {
      await upsertWalletTransactions(
        userId,
        profile.walletTransactions.map((t) => ({
          timestamp_ms: t.timestamp,
          category_id: t.category,
          difficulty: t.difficulty,
          amount: t.amount,
          type: t.type,
          label: t.label,
        }))
      );
    }

    await Promise.all(
      CATEGORIES.map((cat) => {
        const p = progress[cat.id];
        if (!p) return Promise.resolve();
        return upsertProgress(userId, cat.id, {
          mastery_points: p.masteryPoints,
          peak_mastery_points: p.peakMasteryPoints,
          questions_answered: p.questionsAnswered,
          last_practiced: p.lastPracticed,
          answered_question_ids: p.answeredQuestionIds ?? [],
        });
      })
    );
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthState({ user: null, loading: false, syncing: false });
      return;
    }

    getSession().then((session) => {
      const user = session?.user ?? null;
      setAuthState((s) => ({ ...s, user, loading: false }));
      if (user) pullFromCloud(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthState((s) => ({ ...s, user }));
      if (user) pullFromCloud(user.id);
    });

    return () => subscription.unsubscribe();
  }, [pullFromCloud]);

  const handleSignUp = async (email: string, password: string, name: string, ageTrack: 'kids' | 'teens' | 'adults') => {
    const { user, error, needsConfirmation } = await signUp(email, password, name, ageTrack);
    if (error) return { error };
    // Always create a local profile so the user can play immediately
    store.createProfile(name, ageTrack);
    // If email confirmation is required, user doesn't have a session yet —
    // skip the cloud push until they verify and the onAuthStateChange fires
    if (user && !needsConfirmation) {
      await pushToCloud(user.id);
    }
    return { error: null, needsConfirmation };
  };

  const handleSignIn = async (email: string, password: string) => {
    const { session, error } = await signIn(email, password);
    if (error || !session) return { error };
    await pullFromCloud(session.user.id);
    return { error: null };
  };

  const handleSignOut = async () => {
    const { user } = authState;
    if (user) await pushToCloud(user.id);
    await signOut();
    setAuthState((s) => ({ ...s, user: null }));
  };

  const syncNow = async () => {
    const { user } = authState;
    if (!user) return;
    await pushToCloud(user.id);
  };

  return {
    ...authState,
    isConfigured: isSupabaseConfigured,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    syncNow,
  };
}
