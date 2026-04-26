import Database from '@tauri-apps/plugin-sql';
import type { Mission, OperationalPeriod, User, MissionParticipant, Team, TeamMember, Task } from './types';
import {
  mockMissions, mockPeriods, mockUsers, mockMissionParticipants,
  mockTeams, mockTeamMembers, mockTasks, mockControllers,
} from './mock-data';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:sar_planner.db');
  }
  return db;
}

export async function seedIfEmpty() {
  const d = await getDb();
  const result = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM missions');
  if (result[0].count > 0) return;

  for (const m of mockMissions) {
    await d.execute(
      'INSERT INTO missions (id, name, description, status, station, join_code, created_at, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [m.id, m.name, m.description, m.status, m.station, m.joinCode, m.createdAt, m.createdBy],
    );
  }
  for (const p of mockPeriods) {
    await d.execute(
      'INSERT INTO operational_periods (id, mission_id, name, locked) VALUES ($1,$2,$3,$4)',
      [p.id, p.missionId, p.name, p.locked ? 1 : 0],
    );
  }
  for (const u of mockUsers) {
    await d.execute(
      'INSERT INTO users (id, type, name, email, phone, station, rank, qualifications) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [u.id, u.type, u.name, u.email, u.phone || null, u.station || null, u.rank || null, u.qualifications || null],
    );
  }
  for (const mp of mockMissionParticipants) {
    await d.execute(
      'INSERT INTO mission_participants (user_id, mission_id, role, joined_at, left_at) VALUES ($1,$2,$3,$4,$5)',
      [mp.userId, mp.missionId, mp.role, mp.joinedAt, mp.leftAt],
    );
  }
  for (const t of mockTeams) {
    await d.execute(
      'INSERT INTO teams (id, period_id, name, status, join_code, created_by) VALUES ($1,$2,$3,$4,$5,$6)',
      [t.id, t.periodId, t.name || null, t.status, t.joinCode, t.createdBy],
    );
  }
  for (const tm of mockTeamMembers) {
    await d.execute(
      'INSERT INTO team_members (team_id, user_id, role, active, joined_at) VALUES ($1,$2,$3,$4,$5)',
      [tm.teamId, tm.userId, tm.role, tm.active ? 1 : 0, tm.joinedAt],
    );
  }
  for (const tk of mockTasks) {
    await d.execute(
      'INSERT INTO tasks (id, period_id, label, search_type, task_type, priority, notes, status, assigned_team_id, started_at, completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [tk.id, tk.periodId, tk.label, tk.searchType, tk.taskType, tk.priority, tk.notes, tk.status, tk.assignedTeamId, tk.startedAt, tk.completedAt],
    );
  }
  for (const [missionId, userId] of Object.entries(mockControllers)) {
    await d.execute(
      'INSERT INTO controllers (mission_id, user_id) VALUES ($1,$2)',
      [missionId, userId],
    );
  }
}

interface DbMission {
  id: string; name: string; description: string; status: string;
  station: string; join_code: string; created_at: string; created_by: string;
}
interface DbPeriod {
  id: string; mission_id: string; name: string; locked: number;
}
interface DbUser {
  id: string; type: string; name: string; email: string;
  phone: string | null; station: string | null; rank: string | null; qualifications: string | null;
}
interface DbMissionParticipant {
  user_id: string; mission_id: string; role: string; joined_at: string; left_at: string | null;
}
interface DbTeam {
  id: string; period_id: string; name: string | null; status: string; join_code: string; created_by: string;
}
interface DbTeamMember {
  team_id: string; user_id: string; role: string; active: number; joined_at: string;
}
interface DbTask {
  id: string; period_id: string; label: string; search_type: string; task_type: string;
  priority: string; notes: string; status: string; assigned_team_id: string | null;
  started_at: string | null; completed_at: string | null;
}
interface DbController { mission_id: string; user_id: string; }

export async function loadAll() {
  const d = await getDb();
  const missions = (await d.select<DbMission[]>('SELECT * FROM missions')).map((r) => ({
    id: r.id, name: r.name, description: r.description, status: r.status as Mission['status'],
    station: r.station, joinCode: r.join_code, createdAt: r.created_at, createdBy: r.created_by,
  }));
  const periods = (await d.select<DbPeriod[]>('SELECT * FROM operational_periods')).map((r) => ({
    id: r.id, missionId: r.mission_id, name: r.name, locked: r.locked !== 0,
  }));
  const users = (await d.select<DbUser[]>('SELECT * FROM users')).map((r) => ({
    id: r.id, type: r.type as User['type'], name: r.name, email: r.email,
    ...(r.phone ? { phone: r.phone } : {}),
    ...(r.station ? { station: r.station } : {}),
    ...(r.rank ? { rank: r.rank } : {}),
    ...(r.qualifications ? { qualifications: r.qualifications } : {}),
  }));
  const missionParticipants = (await d.select<DbMissionParticipant[]>('SELECT * FROM mission_participants')).map((r) => ({
    userId: r.user_id, missionId: r.mission_id,
    role: r.role as MissionParticipant['role'],
    joinedAt: r.joined_at, leftAt: r.left_at,
  }));
  const teams = (await d.select<DbTeam[]>('SELECT * FROM teams')).map((r) => ({
    id: r.id, periodId: r.period_id,
    ...(r.name ? { name: r.name } : {}),
    status: r.status as Team['status'], joinCode: r.join_code, createdBy: r.created_by,
  }));
  const teamMembers = (await d.select<DbTeamMember[]>('SELECT * FROM team_members')).map((r) => ({
    teamId: r.team_id, userId: r.user_id,
    role: r.role as TeamMember['role'],
    active: r.active !== 0,
    joinedAt: r.joined_at,
  }));
  const tasks = (await d.select<DbTask[]>('SELECT * FROM tasks')).map((r) => ({
    id: r.id, periodId: r.period_id, label: r.label,
    searchType: r.search_type as Task['searchType'],
    taskType: r.task_type as Task['taskType'],
    priority: r.priority as Task['priority'],
    notes: r.notes, status: r.status as Task['status'],
    assignedTeamId: r.assigned_team_id,
    startedAt: r.started_at, completedAt: r.completed_at,
  }));
  const controllerRows = await d.select<DbController[]>('SELECT * FROM controllers');
  const controllers: Record<string, string> = {};
  for (const r of controllerRows) controllers[r.mission_id] = r.user_id;

  return { missions, periods, users, missionParticipants, teams, teamMembers, tasks, controllers };
}

export async function saveMissions(missions: Mission[]) {
  const d = await getDb();
  await d.execute('DELETE FROM missions');
  for (const m of missions) {
    await d.execute(
      'INSERT INTO missions (id, name, description, status, station, join_code, created_at, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [m.id, m.name, m.description, m.status, m.station, m.joinCode, m.createdAt, m.createdBy],
    );
  }
}

export async function savePeriods(periods: OperationalPeriod[]) {
  const d = await getDb();
  await d.execute('DELETE FROM operational_periods');
  for (const p of periods) {
    await d.execute(
      'INSERT INTO operational_periods (id, mission_id, name, locked) VALUES ($1,$2,$3,$4)',
      [p.id, p.missionId, p.name, p.locked ? 1 : 0],
    );
  }
}

export async function saveUsers(users: User[]) {
  const d = await getDb();
  await d.execute('DELETE FROM users');
  for (const u of users) {
    await d.execute(
      'INSERT INTO users (id, type, name, email, phone, station, rank, qualifications) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [u.id, u.type, u.name, u.email, u.phone || null, u.station || null, u.rank || null, u.qualifications || null],
    );
  }
}

export async function saveMissionParticipants(mps: MissionParticipant[]) {
  const d = await getDb();
  await d.execute('DELETE FROM mission_participants');
  for (const mp of mps) {
    await d.execute(
      'INSERT INTO mission_participants (user_id, mission_id, role, joined_at, left_at) VALUES ($1,$2,$3,$4,$5)',
      [mp.userId, mp.missionId, mp.role, mp.joinedAt, mp.leftAt],
    );
  }
}

export async function saveTeams(teams: Team[]) {
  const d = await getDb();
  await d.execute('DELETE FROM teams');
  for (const t of teams) {
    await d.execute(
      'INSERT INTO teams (id, period_id, name, status, join_code, created_by) VALUES ($1,$2,$3,$4,$5,$6)',
      [t.id, t.periodId, t.name || null, t.status, t.joinCode, t.createdBy],
    );
  }
}

export async function saveTeamMembers(tms: TeamMember[]) {
  const d = await getDb();
  await d.execute('DELETE FROM team_members');
  for (const tm of tms) {
    await d.execute(
      'INSERT INTO team_members (team_id, user_id, role, active, joined_at) VALUES ($1,$2,$3,$4,$5)',
      [tm.teamId, tm.userId, tm.role, tm.active ? 1 : 0, tm.joinedAt],
    );
  }
}

export async function saveTasks(tasks: Task[]) {
  const d = await getDb();
  await d.execute('DELETE FROM tasks');
  for (const tk of tasks) {
    await d.execute(
      'INSERT INTO tasks (id, period_id, label, search_type, task_type, priority, notes, status, assigned_team_id, started_at, completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [tk.id, tk.periodId, tk.label, tk.searchType, tk.taskType, tk.priority, tk.notes, tk.status, tk.assignedTeamId, tk.startedAt, tk.completedAt],
    );
  }
}

export async function saveControllers(controllers: Record<string, string>) {
  const d = await getDb();
  await d.execute('DELETE FROM controllers');
  for (const [missionId, userId] of Object.entries(controllers)) {
    await d.execute(
      'INSERT INTO controllers (mission_id, user_id) VALUES ($1,$2)',
      [missionId, userId],
    );
  }
}
