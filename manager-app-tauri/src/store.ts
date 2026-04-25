import { create } from 'zustand';
import type {
  Mission, User, MissionParticipant, Team, TeamMember, Task,
  MissionStatus, TeamStatus, TaskStatus, TaskPriority, SearchType,
  ParticipantRole,
} from './types';
import * as db from './db';

let nextId = 100;
function genId(prefix: string) {
  return `${prefix}${++nextId}`;
}

interface PendingAssignment {
  type: 'assignTeamToTask' | 'assignTaskToTeam';
  taskId?: string;
  teamId?: string;
}

interface AppState {
  missions: Mission[];
  users: User[];
  missionParticipants: MissionParticipant[];
  teams: Team[];
  teamMembers: TeamMember[];
  tasks: Task[];
  controllers: Record<string, string>;

  currentManagerUser: User | null;
  selectedMissionId: string | null;
  pendingAssignment: PendingAssignment | null;
  dbReady: boolean;

  setSelectedMission: (missionId: string | null) => void;
  setPendingAssignment: (pa: PendingAssignment | null) => void;
  hydrate: () => Promise<void>;

  createMission: (name: string, description: string) => void;
  deleteMission: (missionId: string) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus, keepTeams?: boolean) => void;
  createTask: (missionId: string, label: string, searchType: SearchType, priority: TaskPriority, notes: string) => void;
  updateTask: (taskId: string, updates: Partial<Pick<Task, 'label' | 'searchType' | 'priority' | 'notes'>>) => void;
  moveTaskToStatus: (taskId: string, newStatus: TaskStatus) => void;
  assignTeamToTask: (taskId: string, teamId: string) => void;
  revokeTaskFromTeam: (taskId: string) => void;
  createTeamAsManager: (missionId: string, name?: string, leaderId?: string) => void;
  assignParticipantToTeam: (userId: string, teamId: string) => void;
  removeParticipantFromTeam: (userId: string, teamId: string) => void;
  removeParticipantFromMission: (missionId: string, userId: string) => void;
  renameTeam: (teamId: string, name: string) => void;
  dissolveTeam: (teamId: string) => void;
  moveTeamToStatus: (teamId: string, newStatus: TeamStatus) => void;
  takeControl: (missionId: string) => void;
  addParticipantToMission: (missionId: string, userId: string, role: ParticipantRole) => void;

  getTeamLeader: (teamId: string) => User | undefined;
  getTeamMembers: (teamId: string) => (User & { role: string })[];
  getTeamTask: (teamId: string) => Task | undefined;
  getMissionParticipants: (missionId: string) => (User & { role: ParticipantRole })[];
  getUnassignedParticipants: (missionId: string) => User[];
  isController: (missionId: string) => boolean;
  getControllerName: (missionId: string) => string | null;
  getTeamDisplayName: (teamId: string) => string;
}

function persist(entitySets: string[]) {
  const state = useStore.getState();
  const saves: Record<string, () => Promise<void>> = {
    missions: () => db.saveMissions(state.missions),
    users: () => db.saveUsers(state.users),
    missionParticipants: () => db.saveMissionParticipants(state.missionParticipants),
    teams: () => db.saveTeams(state.teams),
    teamMembers: () => db.saveTeamMembers(state.teamMembers),
    tasks: () => db.saveTasks(state.tasks),
    controllers: () => db.saveControllers(state.controllers),
  };
  for (const key of entitySets) {
    if (saves[key]) saves[key]().catch(console.error);
  }
}

export const useStore = create<AppState>((set, get) => ({
  missions: [],
  users: [],
  missionParticipants: [],
  teams: [],
  teamMembers: [],
  tasks: [],
  controllers: {},

  currentManagerUser: null,
  selectedMissionId: null,
  pendingAssignment: null,
  dbReady: false,

  setSelectedMission: (missionId) => set({ selectedMissionId: missionId }),
  setPendingAssignment: (pa) => set({ pendingAssignment: pa }),

  hydrate: async () => {
    await db.seedIfEmpty();
    const data = await db.loadAll();
    const maxId = [
      ...data.missions.map((m) => m.id),
      ...data.users.map((u) => u.id),
      ...data.teams.map((t) => t.id),
      ...data.tasks.map((t) => t.id),
    ].reduce((max, id) => {
      const num = parseInt(id.replace(/\D/g, ''), 10);
      return num > max ? num : max;
    }, 100);
    nextId = maxId;
    const managerParticipant = data.missionParticipants.find((mp) => mp.role === 'manager');
    const managerUser = managerParticipant ? data.users.find((u) => u.id === managerParticipant.userId) : data.users[0];
    set({ ...data, currentManagerUser: managerUser || null, dbReady: true });
  },

  createMission: (name, description) => {
    const { currentManagerUser } = get();
    if (!currentManagerUser) return;
    const missionId = genId('m');
    const mission: Mission = {
      id: missionId, name, description, status: 'active', station: currentManagerUser.station || '',
      joinCode: `MSN-${missionId}`, createdAt: new Date().toISOString(), createdBy: currentManagerUser.id,
    };
    set((s) => ({
      missions: [...s.missions, mission],
      missionParticipants: [
        ...s.missionParticipants,
        { userId: currentManagerUser.id, missionId, role: 'manager', joinedAt: new Date().toISOString() },
      ],
    }));
    persist(['missions', 'missionParticipants']);
  },

  deleteMission: (missionId) => {
    set((s) => ({
      missions: s.missions.filter((m) => m.id !== missionId),
      missionParticipants: s.missionParticipants.filter((mp) => mp.missionId !== missionId),
      teams: s.teams.filter((t) => t.missionId !== missionId),
      teamMembers: s.teamMembers.filter((tm) => {
        const team = s.teams.find((t) => t.id === tm.teamId);
        return !team || team.missionId !== missionId;
      }),
      tasks: s.tasks.filter((t) => t.missionId !== missionId),
      controllers: Object.fromEntries(Object.entries(s.controllers).filter(([k]) => k !== missionId)),
      selectedMissionId: s.selectedMissionId === missionId ? null : s.selectedMissionId,
    }));
    persist(['missions', 'missionParticipants', 'teams', 'teamMembers', 'tasks', 'controllers']);
  },

  updateMissionStatus: (missionId, status, keepTeams = true) => {
    set((s) => {
      let teams = s.teams;
      let tasks = s.tasks;
      if (status === 'suspended' && !keepTeams) {
        const missionTeamIds = teams.filter((t) => t.missionId === missionId && t.status !== 'dissolved').map((t) => t.id);
        teams = teams.map((t) => missionTeamIds.includes(t.id) ? { ...t, status: 'dissolved' as const } : t);
        tasks = tasks.map((t) =>
          t.missionId === missionId && t.assignedTeamId && missionTeamIds.includes(t.assignedTeamId)
            ? { ...t, assignedTeamId: null, status: t.status === 'inProgress' ? 'unassigned' as const : t.status } : t,
        );
      }
      return { missions: s.missions.map((m) => (m.id === missionId ? { ...m, status } : m)), teams, tasks };
    });
    persist(['missions', 'teams', 'tasks']);
  },

  createTask: (missionId, label, searchType, priority, notes) => {
    const task: Task = { id: genId('tk'), missionId, label, searchType, priority, notes, status: 'draft', assignedTeamId: null };
    set((s) => ({ tasks: [...s.tasks, task] }));
    persist(['tasks']);
  },

  updateTask: (taskId, updates) => {
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)) }));
    persist(['tasks']);
  },

  moveTaskToStatus: (taskId, newStatus) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (newStatus === 'inProgress' && !task.assignedTeamId) {
      set({ pendingAssignment: { type: 'assignTeamToTask', taskId } });
      return;
    }
    const shouldReleaseTeam = task.assignedTeamId &&
      (newStatus === 'completed' || newStatus === 'unassigned' || newStatus === 'draft');
    set((s) => {
      let teams = s.teams;
      if (shouldReleaseTeam && task.assignedTeamId) {
        teams = teams.map((t) => t.id === task.assignedTeamId ? { ...t, status: 'idle' as const } : t);
      }
      return {
        tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus, assignedTeamId: shouldReleaseTeam ? null : t.assignedTeamId } : t),
        teams,
      };
    });
    persist(['tasks', 'teams']);
  },

  assignTeamToTask: (taskId, teamId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: 'inProgress' as const, assignedTeamId: teamId } : t),
      teams: s.teams.map((t) => t.id === teamId ? { ...t, status: 'inTask' as const } : t),
      pendingAssignment: null,
    }));
    persist(['tasks', 'teams']);
  },

  revokeTaskFromTeam: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || !task.assignedTeamId) return;
    const teamId = task.assignedTeamId;
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: 'unassigned' as const, assignedTeamId: null } : t),
      teams: s.teams.map((t) => t.id === teamId ? { ...t, status: 'idle' as const } : t),
    }));
    persist(['tasks', 'teams']);
  },

  createTeamAsManager: (missionId, name, leaderId) => {
    const teamId = genId('t');
    const { currentManagerUser } = get();
    const team: Team = { id: teamId, missionId, name: name || undefined, status: 'idle', joinCode: `T-${teamId}`, createdBy: currentManagerUser?.id || '' };
    const newMembers = leaderId
      ? [{ teamId, userId: leaderId, role: 'leader' as const, joinedAt: new Date().toISOString() }] : [];
    set((s) => ({
      teams: [...s.teams, team],
      teamMembers: [...s.teamMembers.filter((tm) => !leaderId || tm.userId !== leaderId), ...newMembers],
    }));
    persist(['teams', 'teamMembers']);
  },

  assignParticipantToTeam: (userId, teamId) => {
    const already = get().teamMembers.find((tm) => tm.userId === userId && tm.teamId === teamId);
    if (already) return;
    const filtered = get().teamMembers.filter((tm) => tm.userId !== userId);
    const hasLeader = filtered.some((tm) => tm.teamId === teamId && tm.role === 'leader');
    set({ teamMembers: [...filtered, { teamId, userId, role: hasLeader ? 'member' : 'leader', joinedAt: new Date().toISOString() }] });
    persist(['teamMembers']);
  },

  removeParticipantFromTeam: (userId, teamId) => {
    const membership = get().teamMembers.find((tm) => tm.userId === userId && tm.teamId === teamId);
    if (!membership) return;
    const remaining = get().teamMembers.filter((tm) => !(tm.userId === userId && tm.teamId === teamId));
    const teamStillHasMembers = remaining.some((tm) => tm.teamId === teamId);
    if (!teamStillHasMembers) {
      get().dissolveTeam(teamId);
      set({ teamMembers: remaining });
      return;
    }
    if (membership.role === 'leader') {
      const next = remaining.filter((tm) => tm.teamId === teamId).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
      set({ teamMembers: remaining.map((tm) => tm.teamId === next.teamId && tm.userId === next.userId ? { ...tm, role: 'leader' } : tm) });
    } else {
      set({ teamMembers: remaining });
    }
    persist(['teamMembers']);
  },

  removeParticipantFromMission: (missionId, userId) => {
    const userTeamsInMission = get().teamMembers.filter((tm) => {
      const team = get().teams.find((t) => t.id === tm.teamId);
      return tm.userId === userId && team && team.missionId === missionId;
    });
    let teamMembers = get().teamMembers;
    let teams = get().teams;
    for (const membership of userTeamsInMission) {
      teamMembers = teamMembers.filter((tm) => !(tm.userId === userId && tm.teamId === membership.teamId));
      const remaining = teamMembers.filter((tm) => tm.teamId === membership.teamId);
      if (remaining.length === 0) {
        teams = teams.map((t) => t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t);
      } else if (membership.role === 'leader') {
        const next = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
        teamMembers = teamMembers.map((tm) => tm.teamId === next.teamId && tm.userId === next.userId ? { ...tm, role: 'leader' } : tm);
      }
    }
    set({
      missionParticipants: get().missionParticipants.filter((mp) => !(mp.userId === userId && mp.missionId === missionId)),
      teamMembers, teams,
    });
    persist(['missionParticipants', 'teamMembers', 'teams']);
  },

  renameTeam: (teamId, name) => {
    set((s) => ({ teams: s.teams.map((t) => (t.id === teamId ? { ...t, name: name || undefined } : t)) }));
    persist(['teams']);
  },

  dissolveTeam: (teamId) => {
    const task = get().tasks.find((t) => t.assignedTeamId === teamId);
    set((s) => ({
      teams: s.teams.map((t) => t.id === teamId ? { ...t, status: 'dissolved' as const } : t),
      tasks: task ? s.tasks.map((t) => t.id === task.id ? { ...t, status: 'unassigned' as const, assignedTeamId: null } : t) : s.tasks,
      teamMembers: s.teamMembers.filter((tm) => tm.teamId !== teamId),
    }));
    persist(['teams', 'tasks', 'teamMembers']);
  },

  moveTeamToStatus: (teamId, newStatus) => {
    if (newStatus === 'dissolved') { get().dissolveTeam(teamId); return; }
    set((s) => ({ teams: s.teams.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t)) }));
    persist(['teams']);
  },

  takeControl: (missionId) => {
    const { currentManagerUser } = get();
    if (!currentManagerUser) return;
    set((s) => ({ controllers: { ...s.controllers, [missionId]: currentManagerUser.id } }));
    persist(['controllers']);
  },

  addParticipantToMission: (missionId, userId, role) => {
    const already = get().missionParticipants.find((mp) => mp.userId === userId && mp.missionId === missionId);
    if (already) return;
    set((s) => ({
      missionParticipants: [...s.missionParticipants, { userId, missionId, role, joinedAt: new Date().toISOString() }],
    }));
    persist(['missionParticipants']);
  },

  getTeamLeader: (teamId) => {
    const leader = get().teamMembers.find((tm) => tm.teamId === teamId && tm.role === 'leader');
    return leader ? get().users.find((u) => u.id === leader.userId) : undefined;
  },

  getTeamMembers: (teamId) => {
    return get().teamMembers.filter((tm) => tm.teamId === teamId).map((tm) => {
      const user = get().users.find((u) => u.id === tm.userId)!;
      return { ...user, role: tm.role };
    });
  },

  getTeamTask: (teamId) => get().tasks.find((t) => t.assignedTeamId === teamId && t.status === 'inProgress'),

  getMissionParticipants: (missionId) => {
    return get().missionParticipants.filter((mp) => mp.missionId === missionId).map((mp) => {
      const user = get().users.find((u) => u.id === mp.userId)!;
      return { ...user, role: mp.role };
    });
  },

  getUnassignedParticipants: (missionId) => {
    const mps = get().missionParticipants.filter((mp) => mp.missionId === missionId);
    const assignedUserIds = get().teamMembers
      .filter((tm) => { const team = get().teams.find((t) => t.id === tm.teamId); return team && team.missionId === missionId && team.status !== 'dissolved'; })
      .map((tm) => tm.userId);
    return mps.filter((mp) => !assignedUserIds.includes(mp.userId)).map((mp) => get().users.find((u) => u.id === mp.userId)!);
  },

  isController: (missionId) => {
    const { currentManagerUser, controllers } = get();
    return currentManagerUser ? controllers[missionId] === currentManagerUser.id : false;
  },

  getControllerName: (missionId) => {
    const controllerId = get().controllers[missionId];
    if (!controllerId) return null;
    return get().users.find((u) => u.id === controllerId)?.name || null;
  },

  getTeamDisplayName: (teamId) => {
    const team = get().teams.find((t) => t.id === teamId);
    if (!team) return '';
    if (team.name) return team.name;
    const leader = get().getTeamLeader(teamId);
    return leader ? leader.name : 'Tim';
  },
}));
