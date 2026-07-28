import { ALL_QUESTIONS } from '../data/questions';
import type { CategoryId, Difficulty, AgeTrack, Question } from '../types';

// Flat map of all question IDs → Question objects for O(1) reconstruction in duels
export const QUESTION_MAP: Map<string, Question> = new Map();
for (const qs of Object.values(ALL_QUESTIONS)) {
  for (const q of qs) QUESTION_MAP.set(q.id, q);
}

/** Sample N random question IDs for a duel from a given category/difficulty/track */
export function sampleDuelQuestions(
  categoryId: CategoryId,
  difficulty: Difficulty,
  ageTrack: AgeTrack,
  count = 5
): string[] {
  const pool = ALL_QUESTIONS[categoryId].filter(
    (q) => q.difficulty === difficulty && q.ageTrack.includes(ageTrack)
  );
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((q) => q.id);
}

/** Reconstruct ordered Question[] from stored IDs */
export function buildDuelQuestions(questionIds: string[]): Question[] {
  return questionIds.map((id) => QUESTION_MAP.get(id)).filter((q): q is Question => !!q);
}

/** Generate a random 6-char uppercase class code like "ABC123" */
export function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Generate a random 8-char family invite code like "NAIRA-WXYZ" */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NAIRA-${part}`;
}

/** Get this week's ISO week string (e.g. "2025-W03") for weekly champion logic */
export function getThisWeekKey(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  const oneJan = new Date(start.getFullYear(), 0, 1);
  const week = Math.ceil(((start.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${start.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
