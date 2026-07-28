import type { AvatarItem } from '../types';

export const AVATAR_ITEMS: AvatarItem[] = [
  // ── Hats ────────────────────────────────────────────────────────────────────
  {
    id: 'hat-crown',
    name: 'Gold Crown',
    emoji: '👑',
    category: 'hat',
    unlockCondition: 'Reach Level 5',
    unlockLevel: 5,
  },
  {
    id: 'hat-graduation',
    name: 'Scholar Cap',
    emoji: '🎓',
    category: 'hat',
    unlockCondition: 'Answer 50 questions correctly',
    unlockLevel: 3,
  },
  {
    id: 'hat-cowboy',
    name: 'Hustle Hat',
    emoji: '🤠',
    category: 'hat',
    unlockCondition: 'Earn the Hustle Hero badge',
    unlockBadgeId: 'hustle-hero',
  },
  {
    id: 'hat-tophat',
    name: 'Investor Top Hat',
    emoji: '🎩',
    category: 'hat',
    unlockCondition: 'Earn the Investment Guru badge',
    unlockBadgeId: 'investment-guru',
  },
  {
    id: 'hat-beret',
    name: 'Budget Beret',
    emoji: '🪖',
    category: 'hat',
    unlockCondition: 'Earn the Budget Boss badge',
    unlockBadgeId: 'budget-boss',
  },

  // ── Accessories ─────────────────────────────────────────────────────────────
  {
    id: 'acc-sunglasses',
    name: 'Scam Shades',
    emoji: '🕶️',
    category: 'accessory',
    unlockCondition: 'Earn the Scam Spotter badge',
    unlockBadgeId: 'scam-spotter',
  },
  {
    id: 'acc-monocle',
    name: 'Analyst Monocle',
    emoji: '🧐',
    category: 'accessory',
    unlockCondition: 'Reach Level 7',
    unlockLevel: 7,
  },
  {
    id: 'acc-briefcase',
    name: 'Power Briefcase',
    emoji: '💼',
    category: 'accessory',
    unlockCondition: 'Complete all Tier 3 zones at 60%+',
    unlockLevel: 8,
  },
  {
    id: 'acc-phone',
    name: 'Mobile Money Pro',
    emoji: '📱',
    category: 'accessory',
    unlockCondition: 'Earn the Mobile Money Master badge',
    unlockBadgeId: 'mobile-money-master',
  },
  {
    id: 'acc-shield',
    name: 'Risk Shield',
    emoji: '🛡️',
    category: 'accessory',
    unlockCondition: 'Earn the Risk Ranger badge',
    unlockBadgeId: 'risk-ranger',
  },

  // ── Frames ──────────────────────────────────────────────────────────────────
  {
    id: 'frame-gold',
    name: 'Gold Frame',
    emoji: '🟡',
    category: 'frame',
    unlockCondition: '7-day streak',
    unlockStreak: 7,
  },
  {
    id: 'frame-naira',
    name: 'Naira Frame',
    emoji: '💚',
    category: 'frame',
    unlockCondition: 'Earn the Naira Navigator badge',
    unlockBadgeId: 'naira-navigator',
  },
  {
    id: 'frame-fire',
    name: 'Fire Frame',
    emoji: '🔥',
    category: 'frame',
    unlockCondition: '14-day streak',
    unlockStreak: 14,
  },
  {
    id: 'frame-diamond',
    name: 'Diamond Frame',
    emoji: '💎',
    category: 'frame',
    unlockCondition: 'Reach Level 10',
    unlockLevel: 10,
  },

  // ── Special badges ──────────────────────────────────────────────────────────
  {
    id: 'badge-cowrie',
    name: 'Cowrie Shell',
    emoji: '🐚',
    category: 'badge',
    unlockCondition: 'Complete your first session',
    unlockLevel: 1,
  },
  {
    id: 'badge-naira',
    name: 'Naira Symbol',
    emoji: '₦',
    category: 'badge',
    unlockCondition: 'Master Money Basics zone',
    unlockBadgeId: 'naira-navigator',
  },
  {
    id: 'badge-ajo',
    name: 'Ajo Circle',
    emoji: '🤝',
    category: 'badge',
    unlockCondition: 'Earn the Ajo Apprentice badge',
    unlockBadgeId: 'ajo-apprentice',
  },
  {
    id: 'badge-star',
    name: 'Gold Star',
    emoji: '⭐',
    category: 'badge',
    unlockCondition: '30-day streak',
    unlockStreak: 30,
  },
];

export function getUnlockedItems(
  earnedBadgeIds: string[],
  level: number,
  streak: number
): string[] {
  return AVATAR_ITEMS
    .filter((item) => {
      if (item.unlockLevel !== undefined && level >= item.unlockLevel) return true;
      if (item.unlockBadgeId && earnedBadgeIds.includes(item.unlockBadgeId)) return true;
      if (item.unlockStreak !== undefined && streak >= item.unlockStreak) return true;
      return false;
    })
    .map((item) => item.id);
}
