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

export async function signUp(email: string, password: string, _name: string, _ageTrack: AgeTrack) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) return { error };
  // Profile is created via upsert after signUp (name and ageTrack passed by caller via upsertProfile)
  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error };
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
