import type { AgeTrack, Difficulty, CategoryId, WalletTransaction, WalletTransactionType } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { BADGES } from '../data/badges';

// ─── Credit conversion constants ─────────────────────────────────────────────

const BASE_CREDIT: Record<Difficulty, number> = {
  easy: 50,
  medium: 150,
  hard: 300,
};

const AGE_MODIFIER: Record<AgeTrack, number> = {
  kids: 0.5,
  teens: 1.0,
  adults: 1.5,
};

const STREAK_BONUS_PER_DAY = 0.05; // +5% per day
const STREAK_BONUS_CAP = 0.50;     // max +50%

const MASTERY_BADGE_BONUS = 2000;  // ₦2,000 one-time bonus per badge unlock

// ─── Per-answer credit ────────────────────────────────────────────────────────

export function calcAnswerCredit(
  difficulty: Difficulty,
  ageTrack: AgeTrack,
  streakDays: number
): number {
  const base = BASE_CREDIT[difficulty];
  const ageMod = AGE_MODIFIER[ageTrack];
  const streakMod = 1 + Math.min(streakDays * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP);
  return Math.round(base * ageMod * streakMod);
}

// ─── Mastery badge bonus (one-time, per badge) ────────────────────────────────

export function calcMasteryBonuses(params: {
  categoryId: CategoryId;
  ageTrack: AgeTrack;
  previousMastery: number;
  newMastery: number;
  previousBadgeIds: string[];
  newBadgeIds: string[];
}): { bonusAmount: number; bonusBadgeNames: string[] } {
  const { newBadgeIds, previousBadgeIds } = params;
  const trulyNew = newBadgeIds.filter((id) => !previousBadgeIds.includes(id));
  const relevantBadges = BADGES.filter((b) => trulyNew.includes(b.id));

  const bonusAmount = relevantBadges.length * MASTERY_BADGE_BONUS;
  const bonusBadgeNames = relevantBadges.map((b) => b.name);
  return { bonusAmount, bonusBadgeNames };
}

// ─── Full session credit calculation ─────────────────────────────────────────

export interface SessionCreditResult {
  transactions: WalletTransaction[];
  totalCredits: number;
  masteryBonusCredits: number;
}

export function calcSessionCredits(params: {
  categoryId: CategoryId;
  ageTrack: AgeTrack;
  streakDays: number;
  correctAnswerDifficulties: Difficulty[]; // only correct answers
  newBadgeIds: string[];
  previousBadgeIds: string[];
  previousMastery: number;
  newMastery: number;
}): SessionCreditResult {
  const {
    categoryId, ageTrack, streakDays,
    correctAnswerDifficulties, newBadgeIds, previousBadgeIds,
  } = params;
  const cat = CATEGORY_MAP[categoryId];
  const transactions: WalletTransaction[] = [];
  const now = Date.now();

  // Per-correct-answer credits
  for (let i = 0; i < correctAnswerDifficulties.length; i++) {
    const diff = correctAnswerDifficulties[i];
    const amount = calcAnswerCredit(diff, ageTrack, streakDays);
    transactions.push({
      id: `${now}-ans-${i}`,
      timestamp: now + i,
      category: categoryId,
      difficulty: diff,
      amount,
      type: 'answer' as WalletTransactionType,
      label: `${cat.name} (${diff})`,
    });
  }

  // Streak bonus (one lump sum per session if streak > 0)
  const streakMod = Math.min(streakDays * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP);
  if (streakDays >= 2 && correctAnswerDifficulties.length > 0) {
    const baseTotal = transactions.reduce((s, t) => s + t.amount, 0);
    // The streak bonus is already baked into each answer; add a separate display-only tx
    const bonusDisplay = Math.round(baseTotal * streakMod / (1 + streakMod));
    if (bonusDisplay > 0) {
      transactions.push({
        id: `${now}-streak`,
        timestamp: now + 1000,
        category: categoryId,
        difficulty: null,
        amount: bonusDisplay,
        type: 'streak_bonus',
        label: `${streakDays}-day streak bonus`,
      });
    }
  }

  // Mastery badge bonuses
  const { bonusAmount, bonusBadgeNames } = calcMasteryBonuses({
    categoryId,
    ageTrack,
    previousMastery: params.previousMastery,
    newMastery: params.newMastery,
    previousBadgeIds,
    newBadgeIds,
  });

  if (bonusAmount > 0) {
    bonusBadgeNames.forEach((name, i) => {
      transactions.push({
        id: `${now}-badge-${i}`,
        timestamp: now + 2000 + i,
        category: categoryId,
        difficulty: null,
        amount: MASTERY_BADGE_BONUS,
        type: 'mastery_bonus',
        label: `Mastery bonus: ${name}`,
      });
    });
  }

  const totalCredits = transactions.reduce((s, t) => s + t.amount, 0);
  return { transactions, totalCredits, masteryBonusCredits: bonusAmount };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatPlayNaira(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatFullNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

// ─── Streak multiplier display ────────────────────────────────────────────────

export function getStreakMultiplierDisplay(streakDays: number): string {
  const bonus = Math.min(streakDays * STREAK_BONUS_PER_DAY * 100, STREAK_BONUS_CAP * 100);
  if (bonus <= 0) return '×1.0';
  return `×${(1 + bonus / 100).toFixed(2)}`;
}

// ─── Wallet name by age track ─────────────────────────────────────────────────

export const WALLET_NAMES: Record<AgeTrack, { title: string; icon: string; shortLabel: string }> = {
  kids: { title: 'Piggy Bank', icon: '🐷', shortLabel: 'Piggy Bank' },
  teens: { title: 'Wallet', icon: '👛', shortLabel: 'Wallet' },
  adults: { title: 'Learning Wallet', icon: '💼', shortLabel: 'Wallet' },
};

export const WALLET_DISCLAIMER =
  'These are Learning Credits (₦ style) — game points shown in Naira for fun. They cannot be withdrawn, transferred, exchanged, or redeemed for real money or goods of any kind. This is not a financial product.';
