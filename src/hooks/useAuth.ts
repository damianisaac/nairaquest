import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { applyReferralCode, consumePendingReferralCode } from '../lib/referral';
import { useGameStore, selectProgress } from '../store/gameStore';
import { CATEGORIES } from '../data/categories';
import type { CategoryId, CategoryProgress, UserRole } from '../types';

export interface AuthState {
  user: User | null;
  loading: boolean;
  syncing: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    syncing: false,
  });

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
      user_role: profile.userRole ?? 'general',
      referral_code: profile.referralCode ?? null,
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

  // Pull cloud progress into local store
  const pullFromCloud = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    setAuthState((s) => ({ ...s, syncing: true }));

    const [{ data: dbProfile }, { data: dbProgress }] = await Promise.all([
      fetchProfile(userId),
      fetchAllProgress(userId),
    ]);

    if (dbProfile) {
      const existingProfile = useGameStore.getState().profile;

      if (!existingProfile) {
        // No local profile (fresh device/browser) — create one from DB data
        useGameStore.getState().createProfile(dbProfile.name, dbProfile.age_track, (dbProfile.user_role ?? 'general') as UserRole);
      }

      // Merge DB fields into the store. For values that can be earned locally
      // (wallet, mastery, level) take the higher value so a stale DB pull
      // never erases credits from a session that hasn't synced yet.
      // Reading s.profile inside setState is always the current value,
      // so concurrent pullFromCloud calls compose safely (no snapshot race).
      useGameStore.setState((s) => ({
        profile: s.profile
          ? {
              ...s.profile,
              id: userId,
              name: dbProfile.name,
              ageTrack: dbProfile.age_track,
              level:               Math.max(s.profile.level,               dbProfile.level          ?? 0),
              totalMasteryPoints:  Math.max(s.profile.totalMasteryPoints,  dbProfile.total_mastery  ?? 0),
              walletBalance:       Math.max(s.profile.walletBalance,       dbProfile.wallet_balance ?? 0),
              earnedBadgeIds:      [...new Set([...s.profile.earnedBadgeIds, ...(dbProfile.badge_ids ?? [])])],
              dailyStreak:         dbProfile.daily_streak,
              lastPlayedDate:      dbProfile.last_played,
              avatarSeed:          dbProfile.avatar_seed ?? s.profile.avatarSeed,
              avatarItemIds:       dbProfile.avatar_item_ids ?? s.profile.avatarItemIds ?? [],
              walletDisclaimerSeen: dbProfile.wallet_disclaimer_seen || s.profile.walletDisclaimerSeen,
              userRole:            (dbProfile.user_role ?? 'general') as UserRole,
              referralCode:        dbProfile.referral_code ?? s.profile.referralCode,
            }
          : s.profile,
      }));

      // Apply any referral code that was stored before the profile was pushed
      const pending = consumePendingReferralCode();
      if (pending) await applyReferralCode(userId, pending);
    }

    if (dbProgress) {
      const ageTrack = useGameStore.getState().profile?.ageTrack;
      if (ageTrack) {
        // Build a lookup from DB rows
        const dbMap = new Map(dbProgress.map((r) => [r.category_id, r]));

        // Merge DB into local — take the MAX of each metric so a stale DB pull
        // (fetched before syncNow has pushed the just-played session) never
        // wipes progress that was earned locally but not yet in the DB.
        useGameStore.setState((s) => {
          const local = (s.progressByTrack[ageTrack] ?? {}) as Partial<Record<CategoryId, CategoryProgress>>;
          const merged: Record<CategoryId, CategoryProgress> = {} as Record<CategoryId, CategoryProgress>;

          for (const cat of CATEGORIES) {
            const l = local[cat.id];
            const d = dbMap.get(cat.id);
            merged[cat.id] = {
              categoryId: cat.id,
              masteryPoints:      Math.max(l?.masteryPoints      ?? 0, d?.mastery_points      ?? 0),
              peakMasteryPoints:  Math.max(l?.peakMasteryPoints  ?? 0, d?.peak_mastery_points ?? 0),
              questionsAnswered:  Math.max(l?.questionsAnswered   ?? 0, d?.questions_answered  ?? 0),
              lastPracticed:      l?.lastPracticed ?? d?.last_practiced ?? null,
              answeredQuestionIds: [...new Set([
                ...(l?.answeredQuestionIds ?? []),
                ...(d?.answered_question_ids ?? []),
              ])],
            };
          }

          return {
            progressByTrack: { ...s.progressByTrack, [ageTrack]: merged },
          };
        });
      }
    }

    // Push the merged local state back so DB always reflects the true high-water mark.
    // This catches users whose scores accumulated locally while the sync was broken.
    await pushToCloud(userId);

    setAuthState((s) => ({ ...s, syncing: false }));
  }, [pushToCloud]);

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

  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    ageTrack: 'kids' | 'teens' | 'adults',
    userRole: UserRole = 'general',
    referralCode?: string,
  ) => {
    const { user, error, needsConfirmation } = await signUp(email, password, name, ageTrack);
    if (error) return { error };
    // Always create a local profile so the user can play immediately
    useGameStore.getState().createProfile(name, ageTrack, userRole);
    if (user && !needsConfirmation) {
      await pushToCloud(user.id);
      // Apply referral code now that the profile row exists in the DB
      if (referralCode) await applyReferralCode(user.id, referralCode);
    } else if (referralCode) {
      // Email confirmation is pending — store the code to apply after verification
      const { storePendingReferralCode } = await import('../lib/referral');
      storePendingReferralCode(referralCode);
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
    navigate('/');
  };

  const syncNow = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await pushToCloud(session.user.id);
  }, [pushToCloud]);

  return {
    ...authState,
    isConfigured: isSupabaseConfigured,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    syncNow,
  };
}
