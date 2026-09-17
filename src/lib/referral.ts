import { supabase, isSupabaseConfigured } from './supabase';

const PENDING_REF_KEY = 'nq_pending_ref_code';

// 8-char uppercase alphanumeric code
export function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// Store a referral code to apply once the user's profile is pushed to the DB.
// Used when email confirmation delays the profile push.
export function storePendingReferralCode(code: string) {
  try { localStorage.setItem(PENDING_REF_KEY, code.trim().toUpperCase()); } catch {}
}

export function consumePendingReferralCode(): string | null {
  try {
    const code = localStorage.getItem(PENDING_REF_KEY);
    if (code) localStorage.removeItem(PENDING_REF_KEY);
    return code;
  } catch {
    return null;
  }
}

// Look up the referrer by code and create the referral record.
// Safe to call multiple times — the unique constraint on referred_id silently ignores duplicates.
export async function applyReferralCode(referredUserId: string, code: string): Promise<void> {
  if (!isSupabaseConfigured || !code.trim()) return;

  const normalized = code.trim().toUpperCase();

  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', normalized)
    .maybeSingle();

  if (!referrer) return;
  if (referrer.id === referredUserId) return; // can't refer yourself

  // Insert — duplicate is silently ignored via unique constraint
  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referred_id: referredUserId,
    sessions_completed: 0,
  });
}

export interface SessionRewardResult {
  rewarded: boolean;
  referredReward: number;
  referrerReward: number;
}

// Called after every session completion. Returns the reward amounts if the
// 3-session threshold was just met, otherwise { rewarded: false }.
export async function onSessionComplete(userId: string): Promise<SessionRewardResult> {
  if (!isSupabaseConfigured) return { rewarded: false, referredReward: 0, referrerReward: 0 };

  const { data, error } = await supabase.rpc('increment_referral_session', {
    p_referred_id: userId,
  });

  if (error || !data) return { rewarded: false, referredReward: 0, referrerReward: 0 };

  const result = typeof data === 'string' ? JSON.parse(data) : data as Record<string, unknown>;

  if (result.rewarded) {
    return {
      rewarded: true,
      referredReward: (result.referred_reward as number) ?? 200,
      referrerReward: (result.referrer_reward as number) ?? 500,
    };
  }
  return { rewarded: false, referredReward: 0, referrerReward: 0 };
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  rewardedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
}

export async function fetchReferralStats(userId: string): Promise<ReferralStats | null> {
  if (!isSupabaseConfigured) return null;

  const [{ data: prof }, { data: refs }] = await Promise.all([
    supabase.from('profiles').select('referral_code').eq('id', userId).single(),
    supabase.from('referrals').select('rewarded_at').eq('referrer_id', userId),
  ]);

  if (!prof) return null;

  const all = refs ?? [];
  const rewarded = all.filter((r) => r.rewarded_at !== null).length;

  return {
    referralCode: (prof as { referral_code?: string }).referral_code ?? '',
    totalReferrals: all.length,
    rewardedReferrals: rewarded,
    pendingReferrals: all.length - rewarded,
    totalEarned: rewarded * 500,
  };
}
