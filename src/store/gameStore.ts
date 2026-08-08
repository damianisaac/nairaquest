import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgeTrack, CategoryId, CategoryProgress, UserProfile, GameSession, SessionResult, Difficulty, UserRole, ClassContext } from '../types';
import { CATEGORIES } from '../data/categories';
import { BADGES } from '../data/badges';
import { computeSessionResult, calcNewStreak, isTodayStr, getMasteryCap, getMasteryPercent, isCategoryUnlocked } from '../utils/scoring';
import { calcSessionCredits } from '../utils/wallet';
import { getQuestionsForSession, ALL_QUESTIONS } from '../data/questions';

const MAX_WALLET_TRANSACTIONS = 200;

function makeDefaultProgress(): Record<CategoryId, CategoryProgress> {
  return Object.fromEntries(
    CATEGORIES.map((c) => [
      c.id,
      {
        categoryId: c.id,
        masteryPoints: 0,
        peakMasteryPoints: 0,
        questionsAnswered: 0,
        lastPracticed: null,
        answeredQuestionIds: [],
      } as CategoryProgress,
    ])
  ) as Record<CategoryId, CategoryProgress>;
}

export const TRACK_DEFAULT_TIMER: Record<AgeTrack, number> = {
  kids: 30,
  teens: 20,
  adults: 15,
};

interface GameState {
  profile: UserProfile | null;
  progress: Record<CategoryId, CategoryProgress>;
  session: GameSession | null;
  lastResult: SessionResult | null;
  soundEnabled: boolean;        // sound effects
  musicEnabled: boolean;        // background music
  notificationsEnabled: boolean;
  liteMode: boolean;
  accessibilityMode: boolean;   // TTS + voice answer
  classContext: ClassContext | null;
  questionTimerSeconds: number;
  timerManuallySet: boolean;
  excludedCategoryIds: CategoryId[];

  createProfile: (name: string, ageTrack: AgeTrack, userRole?: UserRole) => void;
  updateAgeTrack: (ageTrack: AgeTrack) => void;
  equipAvatarItems: (itemIds: string[]) => void;
  markWalletDisclaimerSeen: () => void;
  setClassContext: (ctx: ClassContext | null) => void;
  startSession: (categoryId: CategoryId, difficulty: Difficulty) => void;
  submitAnswer: (answerIndex: number) => void;
  endSession: () => SessionResult | null;
  resetSession: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleNotifications: () => void;
  setLiteMode: (value: boolean) => void;
  toggleAccessibilityMode: () => void;
  setQuestionTimer: (seconds: number, manual?: boolean) => void;
  toggleCategoryExclusion: (categoryId: CategoryId) => void;
  resetCategoryProgress: (categoryId: CategoryId) => void;
  resetAllProgress: () => void;
  clearProfile: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profile: null,
      progress: makeDefaultProgress(),
      session: null,
      lastResult: null,
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: false,
      liteMode: false,
      accessibilityMode: false,
      classContext: null,
      questionTimerSeconds: 20,
      timerManuallySet: false,
      excludedCategoryIds: [],

      createProfile: (name, ageTrack, userRole = 'general') => {
        const profile: UserProfile = {
          id: crypto.randomUUID(),
          name,
          ageTrack,
          avatarSeed: Math.random().toString(36).slice(2, 8),
          avatarItemIds: [],
          level: 0,
          totalMasteryPoints: 0,
          createdAt: Date.now(),
          dailyStreak: 0,
          lastPlayedDate: null,
          earnedBadgeIds: [],
          walletBalance: 0,
          walletTransactions: [],
          walletDisclaimerSeen: false,
          userRole,
        };
        set({ profile, progress: makeDefaultProgress(), questionTimerSeconds: TRACK_DEFAULT_TIMER[ageTrack], timerManuallySet: false });
      },

      updateAgeTrack: (ageTrack) => {
        const { profile, timerManuallySet } = get();
        if (!profile) return;
        set({
          profile: { ...profile, ageTrack },
          ...(!timerManuallySet && { questionTimerSeconds: TRACK_DEFAULT_TIMER[ageTrack] }),
        });
      },

      equipAvatarItems: (itemIds) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, avatarItemIds: itemIds } });
      },

      markWalletDisclaimerSeen: () => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, walletDisclaimerSeen: true } });
      },

      startSession: (categoryId, difficulty) => {
        const { profile } = get();
        if (!profile) return;
        const questions = getQuestionsForSession(categoryId, profile.ageTrack, difficulty, 10);
        const session: GameSession = {
          categoryId,
          difficulty,
          ageTrack: profile.ageTrack,
          questions,
          currentIndex: 0,
          answers: new Array(questions.length).fill(null),
          startedAt: Date.now(),
          completed: false,
        };
        set({ session, lastResult: null });
      },

      submitAnswer: (answerIndex) => {
        const { session } = get();
        if (!session || session.completed) return;
        const answers = [...session.answers];
        answers[session.currentIndex] = answerIndex;
        const nextIndex = session.currentIndex + 1;
        const completed = nextIndex >= session.questions.length;
        set({ session: { ...session, answers, currentIndex: nextIndex, completed } });
      },

      endSession: () => {
        const { session, profile, progress } = get();
        if (!session || !profile || !session.completed) return null;

        // Fallback for categories added after the user's state was first persisted
        const prevProgress: CategoryProgress = progress[session.categoryId] ?? {
          categoryId: session.categoryId,
          masteryPoints: 0,
          peakMasteryPoints: 0,
          questionsAnswered: 0,
          lastPracticed: null,
          answeredQuestionIds: [],
        };

        const result = computeSessionResult({
          categoryId: session.categoryId,
          ageTrack: profile.ageTrack,
          questions: session.questions,
          answers: session.answers,
          prevProgress,
          prevProfile: profile,
        });

        const cap = getMasteryCap(session.categoryId, profile.ageTrack);
        const newMasteryPoints = Math.min(
          cap,
          Math.max(0, prevProgress.masteryPoints + result.masteryPointsEarned - result.masteryPointsLost)
        );

        // Track which question IDs have been answered at this difficulty
        const sessionQuestionIds = session.questions.map((q) => q.id);
        const prevAnsweredIds = prevProgress.answeredQuestionIds ?? [];
        const newAnsweredIds = [...new Set([...prevAnsweredIds, ...sessionQuestionIds])];

        // Detect if this session completed all questions at this difficulty
        const fullDiffPool = ALL_QUESTIONS[session.categoryId].filter(
          (q) => q.ageTrack.includes(profile.ageTrack) && q.difficulty === session.difficulty
        );
        const difficultyCompleted =
          fullDiffPool.length > 0 &&
          fullDiffPool.every((q) => newAnsweredIds.includes(q.id)) &&
          !fullDiffPool.every((q) => prevAnsweredIds.includes(q.id))
            ? session.difficulty
            : undefined;

        const newProgress: Record<CategoryId, CategoryProgress> = {
          ...progress,
          [session.categoryId]: {
            ...prevProgress,
            masteryPoints: newMasteryPoints,
            peakMasteryPoints: Math.max(prevProgress.peakMasteryPoints, newMasteryPoints),
            questionsAnswered: prevProgress.questionsAnswered + session.questions.length,
            lastPracticed: Date.now(),
            answeredQuestionIds: newAnsweredIds,
          },
        };

        const newStreak = calcNewStreak(profile.lastPlayedDate, profile.dailyStreak);

        // ── Wallet credits ──────────────────────────────────────────────────
        // No credits for replays of already-mastered content (previousMastery was 100%)
        const isPracticeMode = result.previousMastery >= 1.0;

        const correctDiffs = session.answers
          .map((a, i) => (a === session.questions[i].correctIndex ? session.questions[i].difficulty : null))
          .filter((d): d is typeof d & string => d !== null);

        const walletResult = isPracticeMode
          ? { totalCredits: 0, transactions: [] as typeof profile.walletTransactions, masteryBonusCredits: 0 }
          : calcSessionCredits({
              categoryId: session.categoryId,
              ageTrack: profile.ageTrack,
              streakDays: newStreak,
              correctAnswerDifficulties: correctDiffs,
              newBadgeIds: result.newBadgeIds,
              previousBadgeIds: profile.earnedBadgeIds,
              previousMastery: result.previousMastery,
              newMastery: result.newMastery,
            });

        const newBalance = profile.walletBalance + walletResult.totalCredits;
        // Keep only the most recent MAX_WALLET_TRANSACTIONS
        const newTransactions = [
          ...walletResult.transactions,
          ...profile.walletTransactions,
        ].slice(0, MAX_WALLET_TRANSACTIONS);

        const fullResult: SessionResult = {
          ...result,
          difficultyCompleted,
          creditsEarned: walletResult.totalCredits,
          creditTransactions: walletResult.transactions,
          masteryBonusCredits: walletResult.masteryBonusCredits,
          isPracticeMode,
        };

        const updatedProfile: UserProfile = {
          ...profile,
          totalMasteryPoints: Math.max(
            0,
            profile.totalMasteryPoints + result.masteryPointsEarned - result.masteryPointsLost
          ),
          level: result.levelAfter,
          earnedBadgeIds: [...new Set([...profile.earnedBadgeIds, ...result.newBadgeIds])],
          dailyStreak: newStreak,
          lastPlayedDate: isTodayStr(),
          walletBalance: newBalance,
          walletTransactions: newTransactions,
        };

        set({ progress: newProgress, profile: updatedProfile, lastResult: fullResult });
        return fullResult;
      },

      setClassContext: (ctx) => set({ classContext: ctx }),
      resetSession: () => set({ session: null }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setLiteMode: (value) => set({ liteMode: value }),
      toggleAccessibilityMode: () => set((s) => ({ accessibilityMode: !s.accessibilityMode })),
      setQuestionTimer: (seconds, manual = true) => set({ questionTimerSeconds: seconds, timerManuallySet: manual }),
      toggleCategoryExclusion: (categoryId) => set((s) => {
        const excluded = s.excludedCategoryIds;
        return {
          excludedCategoryIds: excluded.includes(categoryId)
            ? excluded.filter((id) => id !== categoryId)
            : [...excluded, categoryId],
        };
      }),
      resetCategoryProgress: (categoryId) => set((s) => ({
        progress: {
          ...s.progress,
          [categoryId]: {
            categoryId,
            masteryPoints: 0,
            peakMasteryPoints: 0,
            questionsAnswered: 0,
            lastPracticed: null,
            answeredQuestionIds: [],
          },
        },
      })),
      resetAllProgress: () => set({ progress: makeDefaultProgress(), lastResult: null, session: null, excludedCategoryIds: [] }),
      clearProfile: () => set({ profile: null, progress: makeDefaultProgress(), session: null, lastResult: null, excludedCategoryIds: [] }),
    }),
    { name: 'nairaquest-v2' } // bumped from v1 → clean state with new wallet fields
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectMasteryPercent = (
  state: GameState,
  categoryId: CategoryId
): number => {
  const { progress, profile } = state;
  if (!profile) return 0;
  const cap = getMasteryCap(categoryId, profile.ageTrack);
  return getMasteryPercent(progress[categoryId]?.masteryPoints ?? 0, cap);
};

export const selectIsUnlocked = (state: GameState, categoryId: CategoryId): boolean => {
  const { progress, profile } = state;
  if (!profile) return CATEGORIES.find((c) => c.id === categoryId)?.tier === 0;
  return isCategoryUnlocked(categoryId, progress, profile.ageTrack);
};

export const selectEarnedBadges = (state: GameState) => {
  const { profile } = state;
  if (!profile) return [];
  return BADGES.filter((b) => profile.earnedBadgeIds.includes(b.id));
};
