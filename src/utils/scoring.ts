import type { AgeTrack, Difficulty, CategoryId, CategoryProgress, UserProfile, SessionResult } from '../types';

type SessionResultBase = Omit<SessionResult, 'creditsEarned' | 'creditTransactions' | 'masteryBonusCredits'>;
import { CATEGORY_MAP } from '../data/categories';
import { BADGES } from '../data/badges';

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const DECAY_DAYS = 14;
const DECAY_PERCENT_PER_WEEK = 0.05;
const DECAY_FLOOR_RATIO = 0.5;

export function getMasteryPoints(difficulty: Difficulty, correct: boolean, ageTrack: AgeTrack): number {
  const w = DIFFICULTY_WEIGHT[difficulty];
  if (correct) return w * 10;
  if (ageTrack === 'kids') return 0;
  return -(w * 4);
}

export function getMasteryCap(categoryId: CategoryId, ageTrack: AgeTrack): number {
  const cat = CATEGORY_MAP[categoryId];
  return ageTrack === 'kids' ? cat.masteryCapKids : cat.masteryCapAdult;
}

export function getMasteryPercent(points: number, cap: number): number {
  return Math.min(1, Math.max(0, points / cap));
}

export function calcLevel(totalPoints: number): number {
  return Math.floor(Math.sqrt(totalPoints / 50));
}

export function applyDecay(progress: CategoryProgress, ageTrack: AgeTrack): CategoryProgress {
  if (ageTrack === 'kids') return progress;
  if (!progress.lastPracticed) return progress;

  const daysSince = (Date.now() - progress.lastPracticed) / (1000 * 60 * 60 * 24);
  if (daysSince < DECAY_DAYS) return progress;

  const weeksInactive = Math.floor(daysSince / 7);
  const decayFactor = Math.pow(1 - DECAY_PERCENT_PER_WEEK, weeksInactive);
  const floor = progress.peakMasteryPoints * DECAY_FLOOR_RATIO;
  const decayed = Math.max(floor, progress.masteryPoints * decayFactor);

  return { ...progress, masteryPoints: decayed };
}

export function computeSessionResult(params: {
  categoryId: CategoryId;
  ageTrack: AgeTrack;
  questions: { difficulty: Difficulty; correctIndex: number }[];
  answers: (number | null)[];
  prevProgress: CategoryProgress;
  prevProfile: UserProfile;
}): SessionResultBase {
  const { categoryId, ageTrack, questions, answers, prevProgress, prevProfile } = params;
  const cap = getMasteryCap(categoryId, ageTrack);

  let pointsEarned = 0;
  let pointsLost = 0;
  let correctCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const isCorrect = answers[i] === questions[i].correctIndex;
    if (isCorrect) correctCount++;
    const pts = getMasteryPoints(questions[i].difficulty, isCorrect, ageTrack);
    if (pts > 0) pointsEarned += pts;
    else pointsLost += Math.abs(pts);
  }

  const prevPoints = prevProgress.masteryPoints;
  const newPoints = Math.min(cap, Math.max(0, prevPoints + pointsEarned - pointsLost));

  const prevMastery = getMasteryPercent(prevPoints, cap);
  const newMastery = getMasteryPercent(newPoints, cap);

  const prevTotalPoints = prevProfile.totalMasteryPoints;
  const newTotalPoints = prevTotalPoints + pointsEarned - pointsLost;

  const levelBefore = calcLevel(prevTotalPoints);
  const levelAfter = calcLevel(Math.max(0, newTotalPoints));

  const newBadgeIds = BADGES
    .filter((b) => {
      if (prevProfile.earnedBadgeIds.includes(b.id)) return false;
      if (b.category !== categoryId) return false;
      if (!b.ageTrack.includes(ageTrack)) return false;
      return newMastery >= b.requiredMasteryPercent;
    })
    .map((b) => b.id);

  return {
    categoryId,
    correctCount,
    totalCount: questions.length,
    masteryPointsEarned: pointsEarned,
    masteryPointsLost: pointsLost,
    newBadgeIds,
    previousMastery: prevMastery,
    newMastery,
    levelBefore,
    levelAfter,
    streakDay: prevProfile.dailyStreak,
    xpEarned: pointsEarned,
    isPracticeMode: false,
  };
}

export function isTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calcNewStreak(lastPlayedDate: string | null, currentStreak: number): number {
  const today = isTodayStr();
  if (lastPlayedDate === today) return currentStreak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastPlayedDate === yesterday) return currentStreak + 1;

  return 1;
}

// Adults unlock at 25%, kids/teens at 35%
export function getUnlockThreshold(ageTrack: AgeTrack): number {
  return ageTrack === 'adults' ? 0.25 : 0.35;
}

export function isCategoryUnlocked(
  categoryId: CategoryId,
  allProgress: Record<CategoryId, CategoryProgress>,
  ageTrack: AgeTrack
): boolean {
  const cat = CATEGORY_MAP[categoryId];
  if (cat.tier === 0) return true;
  if (!cat.prerequisite) return true;

  const prereqProgress = allProgress[cat.prerequisite];
  if (!prereqProgress) return false;

  const prereqCap = getMasteryCap(cat.prerequisite, ageTrack);
  const prereqMastery = getMasteryPercent(prereqProgress.masteryPoints, prereqCap);
  return prereqMastery >= getUnlockThreshold(ageTrack);
}
