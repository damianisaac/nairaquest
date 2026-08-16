import { createClient } from '@supabase/supabase-js';
import type { CategoryId, AgeTrack } from '../types';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

// ─── DB types ────────────────────────────────────────────────────────────────

export interface DbProfile {
  id: string;
  name: string;
  age_track: AgeTrack;
  avatar_seed: string;
  avatar_item_ids: string[];
  level: number;
  total_mastery: number;
  daily_streak: number;
  last_played: string | null;
  badge_ids: string[];
  wallet_balance: number;
  wallet_disclaimer_seen: boolean;
  user_role: 'general' | 'teacher';
  created_at: string;
  updated_at: string;
}

export interface DbCategoryProgress {
  id: string;
  user_id: string;
  category_id: CategoryId;
  mastery_points: number;
  peak_mastery_points: number;
  questions_answered: number;
  last_practiced: number | null;
  answered_question_ids: string[] | null;
  updated_at: string;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  age_track: AgeTrack;
  level: number;
  total_mastery: number;
  avatar_seed: string;
  badge_ids: string[];
  rank: number;
}

export interface CategoryLeaderboardRow {
  user_id: string;
  name: string;
  mastery_points: number;
  level: number;
  avatar_seed: string;
  rank: number;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Maps raw Supabase / network error messages to user-readable strings.
 * Call this before displaying any auth error in the UI.
 */
export function friendlyAuthError(rawMessage: string): string {
  const msg = rawMessage.toLowerCase();

  // Network / connectivity ───────────────────────────────────────────────────
  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed')          // Safari's equivalent of "Failed to fetch"
  ) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Duplicate account ────────────────────────────────────────────────────────
  if (
    msg.includes('user already registered') ||
    msg.includes('email already in use') ||
    msg.includes('already been registered')
  ) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  // Wrong credentials ────────────────────────────────────────────────────────
  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('email not found') ||
    msg.includes('wrong password')
  ) {
    return 'Incorrect email or password. Please double-check and try again.';
  }

  // Email not confirmed ──────────────────────────────────────────────────────
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for a confirmation link.';
  }

  // Weak / short password ────────────────────────────────────────────────────
  if (
    msg.includes('password should be at least') ||
    msg.includes('password is too short') ||
    msg.includes('weak password')
  ) {
    return 'Password is too short. Please use at least 8 characters.';
  }

  // Rate limiting ────────────────────────────────────────────────────────────
  if (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('email rate limit')
  ) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  // Invalid email format ─────────────────────────────────────────────────────
  if (
    msg.includes('invalid email') ||
    msg.includes('email is invalid') ||
    msg.includes('provide your email')
  ) {
    return 'Please enter a valid email address.';
  }

  // Signups disabled ─────────────────────────────────────────────────────────
  if (
    msg.includes('signup is disabled') ||
    msg.includes('signups not allowed')
  ) {
    return 'Account creation is temporarily unavailable. Please try again later.';
  }

  // Timeout ──────────────────────────────────────────────────────────────────
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'The server took too long to respond. Please try again.';
  }

  // Fallback: capitalise the raw message so it at least looks intentional
  return rawMessage.charAt(0).toUpperCase() + rawMessage.slice(1);
}

export async function signUp(email: string, password: string, _name: string, _ageTrack: AgeTrack) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error, user: null, needsConfirmation: false };
    // If email confirmation is on, data.session is null even though data.user exists
    const needsConfirmation = !!data.user && !data.session;
    return { user: data.user ?? null, error: null, needsConfirmation };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    return { error: { message } as unknown as Error, user: null, needsConfirmation: false };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data.session, error };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    return { session: null, error: { message } as unknown as Error };
  }
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Profile sync ─────────────────────────────────────────────────────────────

export async function upsertProfile(profile: Omit<DbProfile, 'created_at' | 'updated_at'>) {
  return supabase.from('profiles').upsert(profile, { onConflict: 'id' });
}

export async function upsertWalletTransactions(
  userId: string,
  transactions: { timestamp_ms: number; category_id: string; difficulty: string | null; amount: number; type: string; label: string }[]
) {
  if (transactions.length === 0) return;
  return supabase.from('wallet_transactions').insert(
    transactions.map((t) => ({ user_id: userId, ...t }))
  );
}

export async function fetchProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single<DbProfile>();
}

// ─── Progress sync ─────────────────────────────────────────────────────────────

export async function upsertProgress(userId: string, categoryId: CategoryId, progress: {
  mastery_points: number;
  peak_mastery_points: number;
  questions_answered: number;
  last_practiced: number | null;
  answered_question_ids?: string[];
}) {
  return supabase.from('category_progress').upsert(
    { user_id: userId, category_id: categoryId, ...progress },
    { onConflict: 'user_id,category_id' }
  );
}

export async function fetchAllProgress(userId: string) {
  return supabase
    .from('category_progress')
    .select('*')
    .eq('user_id', userId)
    .returns<DbCategoryProgress[]>();
}

// ─── Session recording ─────────────────────────────────────────────────────────

export async function recordSession(userId: string, params: {
  category_id: CategoryId;
  difficulty: string;
  correct_count: number;
  total_count: number;
  mastery_points_earned: number;
}) {
  return supabase.from('sessions').insert({ user_id: userId, ...params });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function fetchGlobalLeaderboard() {
  return supabase
    .from('leaderboard')
    .select('*')
    .limit(50)
    .returns<LeaderboardRow[]>();
}

export async function fetchCategoryLeaderboard(categoryId: CategoryId) {
  return supabase
    .rpc('category_leaderboard', { cat_id: categoryId, lim: 50 })
    .returns<CategoryLeaderboardRow[]>();
}

// ─── Parent dashboard ─────────────────────────────────────────────────────────

export async function linkChildAccount(parentId: string, childId: string) {
  return supabase.from('parent_links').upsert(
    { parent_id: parentId, child_id: childId },
    { onConflict: 'parent_id,child_id' }
  );
}

export async function fetchLinkedChildren(parentId: string) {
  return supabase
    .from('parent_links')
    .select('child_id, profiles!parent_links_child_id_fkey(*)')
    .eq('parent_id', parentId)
    .returns<{ child_id: string; profiles: DbProfile }[]>();
}

export async function fetchChildProgress(childId: string) {
  return supabase
    .from('category_progress')
    .select('*')
    .eq('user_id', childId)
    .returns<DbCategoryProgress[]>();
}
