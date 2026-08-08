/**
 * Celebration system — tier detection and config builder
 *
 * Tier 2  → every card/session completion
 * Tier 3  → first time a category crosses 80 % mastery (zone mastered)
 * Tier 4  → all categories in a game-tier reach 80 % mastery for the first time
 */

import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { BADGES } from '../data/badges';
import { getMasteryCap, getMasteryPercent } from './scoring';
import { ALL_QUESTIONS } from '../data/questions';
import type { AgeTrack, CategoryId, CategoryProgress, SessionResult } from '../types';
import type { Badge } from '../types';

// ─── Public types ─────────────────────────────────────────────────────────────

export type CelebrationTier = 2 | 3 | 4;

export interface CelebrationConfig {
  tier: CelebrationTier;
  // timing
  durationMs: number;     // auto-dismiss after this many ms
  minDismissMs: number;   // tap-to-skip only unlocks after this
  // copy
  headline: string;
  subline: string;
  mascotMessage: string;
  // derived data (passed so the overlay is purely presentational)
  isPerfect: boolean;
  isPracticeMode: boolean;
  accuracy: number;        // 0–1
  creditsEarned: number;
  streak: number;
  masteryBefore: number;   // 0–1
  masteryAfter: number;    // 0–1
  newBadges: Badge[];
  categoryColor: string;
  categoryName: string;
  categoryEmoji: string;
  // Tier 3 / 4 extras
  milestoneLabel?: string; // e.g. "Money Basics & Banking"
  tierLabel?: string;      // e.g. "Starter", "Foundations"
  shareCopy?: string;
  // rendering hints
  ageTrack: AgeTrack;
  confettiCount: number;
}

// ─── Public factory ────────────────────────────────────────────────────────────

export function buildCelebrationConfig(
  result: SessionResult,
  progress: Record<CategoryId, CategoryProgress>,
  ageTrack: AgeTrack,
): CelebrationConfig {
  const cat = CATEGORY_MAP[result.categoryId];
  const accuracy = result.correctCount / result.totalCount;
  const isPerfect = result.correctCount === result.totalCount;
  const newBadges = BADGES.filter((b) => result.newBadgeIds.includes(b.id));

  const isTier4 = detectTier4(result, progress, ageTrack);
  const isTier3 = !isTier4 && detectTier3(result);
  const tier: CelebrationTier = isTier4 ? 4 : isTier3 ? 3 : 2;

  const durationMs = tier === 4 ? 6000 : tier === 3 ? 5000 : 2500;
  const minDismissMs = tier === 4 ? 2500 : tier === 3 ? 2000 : 1200;
  const confettiCount = tier === 4 ? 120 : tier === 3 ? 70 : 36;

  const milestoneLabel = isTier4 ? buildMilestoneLabel(result, ageTrack) : undefined;
  const tierLabel = isTier4 ? buildTierLabel(cat.tier) : undefined;
  const shareCopy = tier === 4
    ? `I just mastered ${tierLabel ?? cat.name} on NairaQuest! 🇳🇬 Join me to build real financial skills: nairaquest.app`
    : undefined;

  const copy = buildCopy(tier, isPerfect, ageTrack, cat.name, newBadges, result.isPracticeMode);

  return {
    tier,
    durationMs,
    minDismissMs,
    ...copy,
    isPerfect,
    isPracticeMode: result.isPracticeMode,
    accuracy,
    creditsEarned: result.creditsEarned,
    streak: result.streakDay,
    masteryBefore: result.previousMastery,
    masteryAfter: result.newMastery,
    newBadges,
    categoryColor: cat.color,
    categoryName: cat.name,
    categoryEmoji: cat.emoji,
    milestoneLabel,
    tierLabel,
    shareCopy,
    ageTrack,
    confettiCount,
  };
}

// ─── Tier detection ───────────────────────────────────────────────────────────

function detectTier3(result: SessionResult): boolean {
  return result.previousMastery < 0.8 && result.newMastery >= 0.8;
}

function detectTier4(
  result: SessionResult,
  progress: Record<CategoryId, CategoryProgress>,
  ageTrack: AgeTrack,
): boolean {
  // Must have just crossed 80 % on THIS category
  if (!detectTier3(result)) return false;

  const gameTier = CATEGORY_MAP[result.categoryId].tier;

  // All categories in the same game-tier that have content for this ageTrack
  const tierCats = CATEGORIES.filter(
    (c) =>
      CATEGORY_MAP[c.id].tier === gameTier &&
      (ALL_QUESTIONS[c.id] ?? []).some((q) => q.ageTrack.includes(ageTrack)),
  );

  if (tierCats.length <= 1) return false; // solo category — not a meaningful milestone

  return tierCats.every((c) => {
    const cap = getMasteryCap(c.id, ageTrack);
    return getMasteryPercent(progress[c.id]?.masteryPoints ?? 0, cap) >= 0.8;
  });
}

// ─── Label helpers ────────────────────────────────────────────────────────────

function buildMilestoneLabel(result: SessionResult, ageTrack: AgeTrack): string {
  const gameTier = CATEGORY_MAP[result.categoryId].tier;
  const tierCats = CATEGORIES.filter(
    (c) =>
      CATEGORY_MAP[c.id].tier === gameTier &&
      (ALL_QUESTIONS[c.id] ?? []).some((q) => q.ageTrack.includes(ageTrack)),
  );
  const names = tierCats.map((c) => CATEGORY_MAP[c.id].name);
  if (names.length <= 3) return names.join(' · ');
  return `${names.slice(0, 2).join(' · ')} + ${names.length - 2} more`;
}

function buildTierLabel(gameTier: number): string {
  return (['Starter', 'Foundations', 'Growth', 'Advanced', 'Expert'] as const)[gameTier]
    ?? `Level ${gameTier}`;
}

// ─── Copy builder ─────────────────────────────────────────────────────────────

interface CopySections {
  headline: string;
  subline: string;
  mascotMessage: string;
}

function buildCopy(
  tier: CelebrationTier,
  isPerfect: boolean,
  ageTrack: AgeTrack,
  catName: string,
  newBadges: Badge[],
  isPracticeMode: boolean,
): CopySections {
  if (isPracticeMode) {
    return {
      headline: ageTrack === 'kids' ? '🎯 Practice Complete!' : 'Practice Session',
      subline: ageTrack === 'kids' ? 'Great job practising!' : 'No credits in practice — but great revision!',
      mascotMessage: ageTrack === 'kids'
        ? "Great practice! Every session makes you smarter! 💡"
        : ageTrack === 'teens'
        ? 'Practice mode — no XP earned, but you\'re staying sharp! 🔁'
        : 'Practice session complete. Mastery reviewed.',
    };
  }

  if (tier === 4) {
    return {
      headline:
        ageTrack === 'kids' ? '🏆 LEVEL COMPLETE! 🏆'
        : ageTrack === 'teens' ? '🔥 TIER CLEARED!'
        : 'Tier Mastered',
      subline:
        ageTrack === 'kids' ? 'You mastered the whole level — you are incredible!'
        : ageTrack === 'teens' ? 'All zones in this level conquered. You\'re financially elite!'
        : 'All zones in this tier fully mastered. Exceptional discipline.',
      mascotMessage:
        ageTrack === 'kids' ? 'WOW! You cleared the whole level! I am so proud of you! 🥳🎊'
        : ageTrack === 'teens' ? 'Tier complete! You are a certified financial achiever! 🏆'
        : 'Outstanding. This tier is fully mastered.',
    };
  }

  if (tier === 3) {
    const badgeLine = newBadges.length > 0 ? ` ${newBadges[0].emoji} ${newBadges[0].name} unlocked!` : '';
    return {
      headline:
        ageTrack === 'kids' ? `⭐ ${catName} Mastered!`
        : ageTrack === 'teens' ? `✅ Zone Mastered${badgeLine ? ' + Badge!' : ''}`
        : `${catName} — Zone Complete`,
      subline:
        ageTrack === 'kids' ? `You are officially a money expert in ${catName}! 🏅`
        : ageTrack === 'teens' ? `80%+ mastery in ${catName}. This zone is yours.${badgeLine}`
        : `80 % mastery threshold crossed for ${catName}.`,
      mascotMessage:
        ageTrack === 'kids' ? `You mastered ${catName}! I am SO proud of you! 🥳`
        : ageTrack === 'teens' ? 'Zone mastered! You are building real financial knowledge! 🚀'
        : 'Zone mastered. A significant achievement.',
    };
  }

  // Tier 2 — standard completion
  if (isPerfect) {
    return {
      headline:
        ageTrack === 'kids' ? '⭐⭐⭐ PERFECT ROUND! ⭐⭐⭐'
        : ageTrack === 'teens' ? '🔥 Perfect Score! Achievement Unlocked!'
        : 'Perfect Round',
      subline:
        ageTrack === 'kids' ? 'Every single answer was correct! You are a STAR!'
        : ageTrack === 'teens' ? '100 % accuracy. Maximum XP earned! 🏆'
        : 'Full marks — exceptional performance this session.',
      mascotMessage:
        ageTrack === 'kids' ? 'PERFECT! You got every question right! You are incredible! ⭐🎊'
        : ageTrack === 'teens' ? 'Perfect score! Elite financial knowledge on display! 🔥'
        : 'Flawless round. Outstanding.',
    };
  }

  return {
    headline:
      ageTrack === 'kids' ? '🎉 Round Complete!'
      : ageTrack === 'teens' ? '⚡ Session Complete!'
      : 'Session Complete',
    subline:
      ageTrack === 'kids' ? 'Great job finishing the round! You are learning so much!'
      : ageTrack === 'teens' ? 'XP earned. Keep that streak going!'
      : 'Progress recorded. Well done.',
    mascotMessage:
      ageTrack === 'kids' ? 'You finished the round! I am proud of you! 🎊'
      : ageTrack === 'teens' ? 'Session done! Every round makes you sharper! ⚡'
      : 'Session complete. Good progress.',
  };
}
