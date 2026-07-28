export type AgeTrack = 'kids' | 'teens' | 'adults';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type CategoryId =
  | 'money-basics'
  | 'banking'
  | 'budgeting'
  | 'savings'
  | 'scams'
  | 'taxes'
  | 'loans'
  | 'economy'
  | 'entrepreneur'
  | 'insurance'
  | 'crypto'
  | 'pension'
  | 'real-estate'
  | 'forex'
  | 'earning'
  | 'credit-debit'
  | 'financial-planning'
  | 'consumer-skills'
  | 'risk-management'
  | 'government-finance'
  | 'philanthropy'
  | 'buying-selling'
  | 'profit-loss'
  | 'warranties'
  | 'marketing'
  | 'jobs'
  | 'time-money'
  | 'abbreviations'
  | 'online-safety'
  | 'mindset';

export type Tier = 0 | 1 | 2 | 3 | 4;

export type WalletTransactionType = 'answer' | 'streak_bonus' | 'mastery_bonus';

export interface WalletTransaction {
  id: string;
  timestamp: number;
  category: CategoryId;
  difficulty: Difficulty | null;
  amount: number;
  type: WalletTransactionType;
  label: string;
}

export interface ConsequenceReplay {
  scenario: string;
  outcome: string;
  lesson: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: Difficulty;
  ageTrack: AgeTrack[];
  category: CategoryId;
  explanation: string;
  consequenceReplay?: ConsequenceReplay;
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  emoji: string;
  color: string;
  colorDark: string;
  tier: Tier;
  description: string;
  theme: string;
  prerequisite?: CategoryId;
  masteryCapAdult: number;
  masteryCapKids: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: CategoryId;
  requiredMasteryPercent: number;
  ageTrack: AgeTrack[];
}

export interface CategoryProgress {
  categoryId: CategoryId;
  masteryPoints: number;
  peakMasteryPoints: number;
  questionsAnswered: number;
  lastPracticed: number | null;
  answeredQuestionIds: string[];
}

export type UserRole = 'general' | 'teacher';

export interface UserProfile {
  id: string;
  name: string;
  ageTrack: AgeTrack;
  avatarSeed: string;
  avatarItemIds: string[];
  level: number;
  totalMasteryPoints: number;
  createdAt: number;
  dailyStreak: number;
  lastPlayedDate: string | null;
  earnedBadgeIds: string[];
  // Wallet
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  walletDisclaimerSeen: boolean;
  // Social
  userRole?: UserRole;
}

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  category: 'hat' | 'accessory' | 'frame' | 'badge';
  unlockCondition: string;
  unlockBadgeId?: string;
  unlockLevel?: number;
  unlockStreak?: number;
}

// ─── Social: Family ──────────────────────────────────────────────────────────

export interface FamilyMember {
  userId: string;
  name: string;
  ageTrack: AgeTrack;
  level: number;
  totalMastery: number;
  earnedBadgeIds: string[];
  avatarSeed: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  members: FamilyMember[];
}

export type DuelStatus = 'pending' | 'completed';

export interface Duel {
  id: string;
  familyId: string;
  categoryId: CategoryId;
  difficulty: Difficulty;
  initiatorId: string;
  initiatorName: string;
  opponentId: string;
  opponentName: string;
  initiatorScore: number | null;
  opponentScore: number | null;
  questionIds: string[];
  status: DuelStatus;
  createdAt: string;
  resolvedAt: string | null;
}

// ─── Social: Class ───────────────────────────────────────────────────────────

export interface ClassInfo {
  id: string;
  name: string;
  ageTrack: AgeTrack;
  classCode: string;
  teacherUserId: string;
  teacherName: string;
  focusCategoryId: CategoryId | null;
}

export interface ClassMemberRow {
  userId: string;
  displayName: string;
  ageTrack: AgeTrack;
  level: number;
  totalMastery: number;
  lastPlayed: string | null;
  earnedBadgeIds: string[];
  avatarSeed: string;
}

export interface ClassContext {
  classId: string;
  className: string;
  teacherName: string;
  classCode: string;
  focusCategoryId: CategoryId | null;
}

export interface GameSession {
  categoryId: CategoryId;
  difficulty: Difficulty;
  ageTrack: AgeTrack;
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  startedAt: number;
  completed: boolean;
}

export interface SessionResult {
  categoryId: CategoryId;
  correctCount: number;
  totalCount: number;
  masteryPointsEarned: number;
  masteryPointsLost: number;
  newBadgeIds: string[];
  previousMastery: number;
  newMastery: number;
  levelBefore: number;
  levelAfter: number;
  streakDay: number;
  xpEarned: number;
  difficultyCompleted?: Difficulty;
  // Wallet
  creditsEarned: number;
  creditTransactions: WalletTransaction[];
  masteryBonusCredits: number;
  isPracticeMode: boolean; // true when replaying already-mastered content — no credits awarded
}
