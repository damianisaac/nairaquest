/**
 * Supabase functions for Family Challenges + School/Class Mode.
 *
 * Required Supabase tables (run these migrations before use):
 *
 * -- Family groups
 * CREATE TABLE families (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   invite_code TEXT NOT NULL UNIQUE,
 *   created_by UUID REFERENCES profiles(id),
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE TABLE family_members (
 *   family_id UUID REFERENCES families(id) ON DELETE CASCADE,
 *   user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
 *   joined_at TIMESTAMPTZ DEFAULT NOW(),
 *   PRIMARY KEY (family_id, user_id)
 * );
 * CREATE TABLE family_duels (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   family_id UUID REFERENCES families(id) ON DELETE CASCADE,
 *   category_id TEXT NOT NULL,
 *   difficulty TEXT NOT NULL,
 *   initiator_id UUID REFERENCES profiles(id),
 *   initiator_name TEXT NOT NULL,
 *   opponent_id UUID REFERENCES profiles(id),
 *   opponent_name TEXT NOT NULL,
 *   initiator_score INTEGER,
 *   opponent_score INTEGER,
 *   question_ids TEXT[] NOT NULL,
 *   status TEXT NOT NULL DEFAULT 'pending',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   resolved_at TIMESTAMPTZ
 * );
 *
 * -- Classrooms
 * CREATE TABLE classes (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   age_track TEXT NOT NULL,
 *   class_code TEXT NOT NULL UNIQUE,
 *   teacher_user_id UUID REFERENCES profiles(id),
 *   teacher_name TEXT NOT NULL,
 *   focus_category_id TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE TABLE class_members (
 *   class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
 *   user_id UUID NOT NULL,
 *   display_name TEXT NOT NULL,
 *   joined_at TIMESTAMPTZ DEFAULT NOW(),
 *   PRIMARY KEY (class_id, user_id)
 * );
 */

import { supabase } from './supabase';
import type {
  AgeTrack,
  CategoryId,
  Difficulty,
  FamilyGroup,
  FamilyMember,
  Duel,
  ClassInfo,
  ClassMemberRow,
} from '../types';

// ─── DB row types ────────────────────────────────────────────────────────────

interface DbFamily {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface DbFamilyMember {
  family_id: string;
  user_id: string;
  joined_at: string;
}

interface DbProfile {
  id: string;
  name: string;
  age_track: AgeTrack;
  level: number;
  total_mastery: number;
  badge_ids: string[];
  avatar_seed: string;
}

interface DbDuel {
  id: string;
  family_id: string;
  category_id: string;
  difficulty: string;
  initiator_id: string;
  initiator_name: string;
  opponent_id: string;
  opponent_name: string;
  initiator_score: number | null;
  opponent_score: number | null;
  question_ids: string[];
  status: string;
  created_at: string;
  resolved_at: string | null;
}

interface DbClass {
  id: string;
  name: string;
  age_track: string;
  class_code: string;
  teacher_user_id: string;
  teacher_name: string;
  focus_category_id: string | null;
  created_at: string;
}

interface DbClassMember {
  class_id: string;
  user_id: string;
  display_name: string;
  joined_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dbDuelToDuel(d: DbDuel): Duel {
  return {
    id: d.id,
    familyId: d.family_id,
    categoryId: d.category_id as CategoryId,
    difficulty: d.difficulty as Difficulty,
    initiatorId: d.initiator_id,
    initiatorName: d.initiator_name,
    opponentId: d.opponent_id,
    opponentName: d.opponent_name,
    initiatorScore: d.initiator_score,
    opponentScore: d.opponent_score,
    questionIds: d.question_ids,
    status: d.status as 'pending' | 'completed',
    createdAt: d.created_at,
    resolvedAt: d.resolved_at,
  };
}

function dbClassToClassInfo(c: DbClass): ClassInfo {
  return {
    id: c.id,
    name: c.name,
    ageTrack: c.age_track as AgeTrack,
    classCode: c.class_code,
    teacherUserId: c.teacher_user_id,
    teacherName: c.teacher_name,
    focusCategoryId: c.focus_category_id as CategoryId | null,
  };
}

// ─── Family ──────────────────────────────────────────────────────────────────

/** Create a new family group. Returns the created family or error. */
export async function createFamily(
  userId: string,
  familyName: string,
  inviteCode: string
): Promise<{ family: FamilyGroup | null; error: string | null }> {
  const { data: fam, error: famErr } = await supabase
    .from('families')
    .insert({ name: familyName, invite_code: inviteCode, created_by: userId })
    .select()
    .single<DbFamily>();

  if (famErr || !fam) return { family: null, error: famErr?.message ?? 'Failed to create family' };

  // Add creator as first member
  const { error: memErr } = await supabase
    .from('family_members')
    .insert({ family_id: fam.id, user_id: userId });

  if (memErr) return { family: null, error: memErr.message };

  return {
    family: {
      id: fam.id,
      name: fam.name,
      inviteCode: fam.invite_code,
      createdBy: fam.created_by,
      createdAt: fam.created_at,
      members: [],
    },
    error: null,
  };
}

/** Join a family using an invite code. */
export async function joinFamilyByCode(
  userId: string,
  inviteCode: string
): Promise<{ familyId: string | null; error: string | null }> {
  const { data: fam, error: famErr } = await supabase
    .from('families')
    .select('id')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single<{ id: string }>();

  if (famErr || !fam) return { familyId: null, error: 'Family not found. Check the code and try again.' };

  // Check not already a member
  const { data: existing } = await supabase
    .from('family_members')
    .select('user_id')
    .eq('family_id', fam.id)
    .eq('user_id', userId)
    .single();

  if (existing) return { familyId: fam.id, error: null }; // already joined

  const { error: joinErr } = await supabase
    .from('family_members')
    .insert({ family_id: fam.id, user_id: userId });

  if (joinErr) return { familyId: null, error: joinErr.message };
  return { familyId: fam.id, error: null };
}

/** Fetch the family group a user belongs to, along with all members' profiles. */
export async function fetchMyFamily(
  userId: string
): Promise<{ family: FamilyGroup | null; error: string | null }> {
  // Get family membership
  const { data: membership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .limit(1)
    .single<DbFamilyMember>();

  if (!membership) return { family: null, error: null };

  const familyId = membership.family_id;

  // Fetch family record
  const { data: fam, error: famErr } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single<DbFamily>();

  if (famErr || !fam) return { family: null, error: famErr?.message ?? 'Family not found' };

  // Fetch all member user_ids
  const { data: members } = await supabase
    .from('family_members')
    .select('user_id')
    .eq('family_id', familyId)
    .returns<{ user_id: string }[]>();

  const memberIds = (members ?? []).map((m) => m.user_id);

  // Fetch profiles for all members
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, age_track, level, total_mastery, badge_ids, avatar_seed')
    .in('id', memberIds)
    .returns<DbProfile[]>();

  const familyMembers: FamilyMember[] = (profiles ?? []).map((p) => ({
    userId: p.id,
    name: p.name,
    ageTrack: p.age_track,
    level: p.level,
    totalMastery: p.total_mastery,
    earnedBadgeIds: p.badge_ids ?? [],
    avatarSeed: p.avatar_seed,
  }));

  return {
    family: {
      id: fam.id,
      name: fam.name,
      inviteCode: fam.invite_code,
      createdBy: fam.created_by,
      createdAt: fam.created_at,
      members: familyMembers,
    },
    error: null,
  };
}

/** Leave a family group. */
export async function leaveFamilyGroup(userId: string, familyId: string) {
  return supabase
    .from('family_members')
    .delete()
    .eq('family_id', familyId)
    .eq('user_id', userId);
}

// ─── Duels ───────────────────────────────────────────────────────────────────

/** Create a new duel invite (initiator plays immediately after). */
export async function createDuel(params: {
  familyId: string;
  categoryId: CategoryId;
  difficulty: Difficulty;
  initiatorId: string;
  initiatorName: string;
  opponentId: string;
  opponentName: string;
  questionIds: string[];
}): Promise<{ duel: Duel | null; error: string | null }> {
  const { data, error } = await supabase
    .from('family_duels')
    .insert({
      family_id: params.familyId,
      category_id: params.categoryId,
      difficulty: params.difficulty,
      initiator_id: params.initiatorId,
      initiator_name: params.initiatorName,
      opponent_id: params.opponentId,
      opponent_name: params.opponentName,
      question_ids: params.questionIds,
      status: 'pending',
    })
    .select()
    .single<DbDuel>();

  if (error || !data) return { duel: null, error: error?.message ?? 'Failed to create duel' };
  return { duel: dbDuelToDuel(data), error: null };
}

/** Fetch a single duel by ID. */
export async function fetchDuel(duelId: string): Promise<{ duel: Duel | null; error: string | null }> {
  const { data, error } = await supabase
    .from('family_duels')
    .select('*')
    .eq('id', duelId)
    .single<DbDuel>();

  if (error || !data) return { duel: null, error: error?.message ?? 'Duel not found' };
  return { duel: dbDuelToDuel(data), error: null };
}

/** Fetch all duels for a family (for history / pending list). */
export async function fetchFamilyDuels(familyId: string): Promise<Duel[]> {
  const { data } = await supabase
    .from('family_duels')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<DbDuel[]>();

  return (data ?? []).map(dbDuelToDuel);
}

/** Submit a player's score for a duel. Resolves the duel if both have scored. */
export async function submitDuelScore(
  duelId: string,
  userId: string,
  score: number
): Promise<{ duel: Duel | null; error: string | null }> {
  // Fetch current state
  const { data: current, error: fetchErr } = await supabase
    .from('family_duels')
    .select('*')
    .eq('id', duelId)
    .single<DbDuel>();

  if (fetchErr || !current) return { duel: null, error: 'Duel not found' };

  const isInitiator = current.initiator_id === userId;
  const updatePayload: Record<string, unknown> = isInitiator
    ? { initiator_score: score }
    : { opponent_score: score };

  // Check if the other player has already scored — if so, resolve the duel
  const otherScore = isInitiator ? current.opponent_score : current.initiator_score;
  if (otherScore !== null) {
    updatePayload.status = 'completed';
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { data: updated, error: updateErr } = await supabase
    .from('family_duels')
    .update(updatePayload)
    .eq('id', duelId)
    .select()
    .single<DbDuel>();

  if (updateErr || !updated) return { duel: null, error: updateErr?.message ?? 'Failed to submit score' };
  return { duel: dbDuelToDuel(updated), error: null };
}

// ─── Classes ─────────────────────────────────────────────────────────────────

/** Create a new classroom. */
export async function createClass(params: {
  teacherUserId: string;
  teacherName: string;
  name: string;
  ageTrack: AgeTrack;
  classCode: string;
}): Promise<{ classInfo: ClassInfo | null; error: string | null }> {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      teacher_user_id: params.teacherUserId,
      teacher_name: params.teacherName,
      name: params.name,
      age_track: params.ageTrack,
      class_code: params.classCode,
      focus_category_id: null,
    })
    .select()
    .single<DbClass>();

  if (error || !data) return { classInfo: null, error: error?.message ?? 'Failed to create class' };
  return { classInfo: dbClassToClassInfo(data), error: null };
}

/** Fetch the class managed by a teacher. */
export async function fetchTeacherClass(
  teacherUserId: string
): Promise<{ classInfo: ClassInfo | null; error: string | null }> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_user_id', teacherUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<DbClass>();

  if (error) return { classInfo: null, error: null }; // no class yet
  if (!data) return { classInfo: null, error: null };
  return { classInfo: dbClassToClassInfo(data), error: null };
}

/** Fetch a class by its 6-char code. */
export async function fetchClassByCode(
  code: string
): Promise<{ classInfo: ClassInfo | null; error: string | null }> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('class_code', code.trim().toUpperCase())
    .single<DbClass>();

  if (error || !data) return { classInfo: null, error: 'Class not found. Check the code.' };
  return { classInfo: dbClassToClassInfo(data), error: null };
}

/** Join a class as a student. */
export async function joinClass(
  classId: string,
  userId: string,
  displayName: string
): Promise<{ error: string | null }> {
  // Check not already a member
  const { data: existing } = await supabase
    .from('class_members')
    .select('user_id')
    .eq('class_id', classId)
    .eq('user_id', userId)
    .single();

  if (existing) return { error: null }; // already joined

  const { error } = await supabase
    .from('class_members')
    .insert({ class_id: classId, user_id: userId, display_name: displayName });

  return { error: error?.message ?? null };
}

/** Leave a class. */
export async function leaveClass(classId: string, userId: string) {
  return supabase
    .from('class_members')
    .delete()
    .eq('class_id', classId)
    .eq('user_id', userId);
}

/** Fetch the class a student belongs to. */
export async function fetchStudentClass(
  userId: string
): Promise<{ classInfo: ClassInfo | null; error: string | null }> {
  const { data: membership } = await supabase
    .from('class_members')
    .select('class_id')
    .eq('user_id', userId)
    .limit(1)
    .single<{ class_id: string }>();

  if (!membership) return { classInfo: null, error: null };

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', membership.class_id)
    .single<DbClass>();

  if (error || !data) return { classInfo: null, error: null };
  return { classInfo: dbClassToClassInfo(data), error: null };
}

/** Fetch roster for a class (member list from class_members + profiles). */
export async function fetchClassRoster(
  classId: string
): Promise<ClassMemberRow[]> {
  // Get all member user_ids + display_names
  const { data: members } = await supabase
    .from('class_members')
    .select('user_id, display_name')
    .eq('class_id', classId)
    .returns<DbClassMember[]>();

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m) => m.user_id);
  const displayNames = Object.fromEntries(members.map((m) => [m.user_id, m.display_name]));

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, age_track, level, total_mastery, last_played, badge_ids, avatar_seed')
    .in('id', memberIds)
    .returns<(DbProfile & { last_played: string | null })[]>();

  return (profiles ?? []).map((p) => ({
    userId: p.id,
    displayName: displayNames[p.id] ?? p.name,
    ageTrack: p.age_track,
    level: p.level,
    totalMastery: p.total_mastery,
    lastPlayed: p.last_played,
    earnedBadgeIds: p.badge_ids ?? [],
    avatarSeed: p.avatar_seed,
  }));
}

/** Set (or clear) the focus category for a class. */
export async function setFocusCategory(
  classId: string,
  categoryId: CategoryId | null
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('classes')
    .update({ focus_category_id: categoryId })
    .eq('id', classId);
  return { error: error?.message ?? null };
}

/** Delete a class entirely (teacher only). */
export async function deleteClass(classId: string) {
  return supabase.from('classes').delete().eq('id', classId);
}

/** Fetch per-category progress for a list of user IDs (for teacher analytics). */
export async function fetchClassProgress(
  memberIds: string[]
): Promise<{ user_id: string; category_id: string; mastery_points: number; questions_answered: number }[]> {
  if (memberIds.length === 0) return [];
  const { data } = await supabase
    .from('category_progress')
    .select('user_id, category_id, mastery_points, questions_answered')
    .in('user_id', memberIds)
    .returns<{ user_id: string; category_id: string; mastery_points: number; questions_answered: number }[]>();
  return data ?? [];
}
