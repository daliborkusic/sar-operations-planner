import { create } from 'zustand';
import type {
  Mission, User, MissionParticipant, Team, TeamMember, Task,
  MissionStatus, TeamStatus, TaskStatus, TaskPriority, SearchType,
  ParticipantRole,
} from './types';
import {
  mockMissions, mockUsers, mockMissionParticipants,
  mockTeams, mockTeamMembers, mockTasks, mockControllers,
} from './mock-data';

let nextId = 100;
function genId(prefix: string) {
  return `${prefix}${++nextId}`;
}

export type ViewMode = 'searcher' | 'manager' | 'split';

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

  currentUser: User | null;
  currentManagerUser: User | null;
  viewMode: ViewMode;
  selectedMissionId: string | null;
  selectedSearcherMissionId: string | null;
  pendingAssignment: PendingAssignment | null;

  setViewMode: (mode: ViewMode) => void;
  setSelectedMission: (missionId: string | null) => void;
  setSelectedSearcherMission: (missionId: string | null) => void;
  setPendingAssignment: (pa: PendingAssignment | null) => void;

  loginAsRegistered: (userId: string) => void;
  loginAsAnonymous: (name: string, email: string) => void;
  loginManagerAs: (userId: string) => void;
  logout: () => void;

  joinMission: (missionId: string) => void;
  leaveMission: (missionId: string) => void;
  removeParticipantFromMission: (missionId: string, userId: string) => void;
  joinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  createTeam: (missionId: string, name?: string) => void;
  toggleTeamResting: (teamId: string) => void;
  markTaskComplete: (taskId: string) => void;

  createMission: (name: string, description: string) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus, keepTeams?: boolean) => void;
  createTask: (missionId: string, label: string, searchType: SearchType, priority: TaskPriority, notes: string) => void;
  updateTask: (taskId: string, updates: Partial<Pick<Task, 'label' | 'searchType' | 'priority' | 'notes'>>) => void;
  moveTaskToStatus: (taskId: string, newStatus: TaskStatus) => void;
  assignTeamToTask: (taskId: string, teamId: string) => void;
  revokeTaskFromTeam: (taskId: string) => void;
  createTeamAsManager: (missionId: string, name?: string, leaderId?: string) => void;
  assignParticipantToTeam: (userId: string, teamId: string) => void;
  removeParticipantFromTeam: (userId: string, teamId: string) => void;
  renameTeam: (teamId: string, name: string) => void;
  dissolveTeam: (teamId: string) => void;
  moveTeamToStatus: (teamId: string, newStatus: TeamStatus) => void;
  takeControl: (missionId: string) => void;
  addParticipantToMission: (missionId: string, userId: string, role: ParticipantRole) => void;

  getUserMission: (userId: string) => Mission | undefined;
  getUserTeam: (userId: string) => Team | undefined;
  getTeamLeader: (teamId: string) => User | undefined;
  getTeamMembers: (teamId: string) => (User & { role: string })[];
  getTeamTask: (teamId: string) => Task | undefined;
  getMissionParticipants: (missionId: string) => (User & { role: ParticipantRole })[];
  getUnassignedParticipants: (missionId: string) => User[];
  isController: (missionId: string) => boolean;
  getControllerName: (missionId: string) => string | null;
  getTeamDisplayName: (teamId: string) => string;
}

export const useStore = create<AppState>((set, get) => ({
  missions: [...mockMissions],
  users: [...mockUsers],
  missionParticipants: [...mockMissionParticipants],
  teams: [...mockTeams],
  teamMembers: [...mockTeamMembers],
  tasks: [...mockTasks],
  controllers: { ...mockControllers },

  currentUser: null,
  currentManagerUser: mockUsers[0],
  viewMode: 'split',
  selectedMissionId: 'm1',
  selectedSearcherMissionId: null,
  pendingAssignment: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedMission: (missionId) => set({ selectedMissionId: missionId }),
  setSelectedSearcherMission: (missionId) => set({ selectedSearcherMissionId: missionId }),
  setPendingAssignment: (pa) => set({ pendingAssignment: pa }),

  loginAsRegistered: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) set({ currentUser: user });
  },

  loginAsAnonymous: (name, email) => {
    const user: User = { id: genId('u'), type: 'anonymous', name, email };
    set((s) => ({ users: [...s.users, user], currentUser: user }));
  },

  loginManagerAs: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) set({ currentManagerUser: user });
  },

  logout: () => set({ currentUser: null }),

  joinMission: (missionId) => {
    const { currentUser, missionParticipants } = get();
    if (!currentUser) return;
    const already = missionParticipants.find(
      (mp) => mp.userId === currentUser.id && mp.missionId === missionId,
    );
    if (already) return;
    set({
      missionParticipants: [
        ...missionParticipants,
        { userId: currentUser.id, missionId, role: 'searcher', joinedAt: new Date().toISOString() },
      ],
      selectedSearcherMissionId: missionId,
    });
  },

  leaveMission: (missionId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const userTeamsInMission = get().teamMembers.filter((tm) => {
      const team = get().teams.find((t) => t.id === tm.teamId);
      return tm.userId === currentUser.id && team && team.missionId === missionId;
    });
    let teamMembers = get().teamMembers;
    let teams = get().teams;
    for (const membership of userTeamsInMission) {
      teamMembers = teamMembers.filter(
        (tm) => !(tm.userId === currentUser.id && tm.teamId === membership.teamId),
      );
      const remaining = teamMembers.filter((tm) => tm.teamId === membership.teamId);
      if (remaining.length === 0) {
        teams = teams.map((t) => t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t);
      } else if (membership.role === 'leader') {
        const next = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
        teamMembers = teamMembers.map((tm) =>
          tm.teamId === next.teamId && tm.userId === next.userId ? { ...tm, role: 'leader' } : tm,
        );
      }
    }
    set({
      missionParticipants: get().missionParticipants.filter(
        (mp) => !(mp.userId === currentUser.id && mp.missionId === missionId),
      ),
      teamMembers,
      teams,
      selectedSearcherMissionId: get().selectedSearcherMissionId === missionId ? null : get().selectedSearcherMissionId,
    });
  },

  removeParticipantFromMission: (missionId, userId) => {
    const userTeamsInMission = get().teamMembers.filter((tm) => {
      const team = get().teams.find((t) => t.id === tm.teamId);
      return tm.userId === userId && team && team.missionId === missionId;
    });
    let teamMembers = get().teamMembers;
    let teams = get().teams;
    for (const membership of userTeamsInMission) {
      teamMembers = teamMembers.filter(
        (tm) => !(tm.userId === userId && tm.teamId === membership.teamId),
      );
      const remaining = teamMembers.filter((tm) => tm.teamId === membership.teamId);
      if (remaining.length === 0) {
        teams = teams.map((t) => t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t);
      } else if (membership.role === 'leader') {
        const next = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
        teamMembers = teamMembers.map((tm) =>
          tm.teamId === next.teamId && tm.userId === next.userId ? { ...tm, role: 'leader' } : tm,
        );
      }
    }
    set({
      missionParticipants: get().missionParticipants.filter(
        (mp) => !(mp.userId === userId && mp.missionId === missionId),
      ),
      teamMembers,
      teams,
    });
  },

  joinTeam: (teamId) => {
    const { currentUser, teamMembers } = get();
    if (!currentUser) return;
    const already = teamMembers.find((tm) => tm.userId === currentUser.id && tm.teamId === teamId);
    if (already) return;
    const filtered = teamMembers.filter((tm) => tm.userId !== currentUser.id);
    const team = get().teams.find((t) => t.id === teamId);
    if (team) {
      const alreadyInMission = get().missionParticipants.find(
        (mp) => mp.userId === currentUser.id && mp.missionId === team.missionId,
      );
      if (!alreadyInMission) {
        get().joinMission(team.missionId);
      }
    }
    set({
      teamMembers: [
        ...filtered,
        { teamId, userId: currentUser.id, role: 'member', joinedAt: new Date().toISOString() },
      ],
    });
  },

  leaveTeam: () => {
    const { currentUser, teamMembers, teams } = get();
    if (!currentUser) return;
    const membership = teamMembers.find((tm) => tm.userId === currentUser.id);
    if (!membership) return;
    const remaining = teamMembers.filter(
      (tm) => !(tm.userId === currentUser.id && tm.teamId === membership.teamId),
    );
    const teamStillHasMembers = remaining.some((tm) => tm.teamId === membership.teamId);
    if (!teamStillHasMembers) {
      const task = get().tasks.find((t) => t.assignedTeamId === membership.teamId);
      set({
        teamMembers: remaining,
        teams: teams.map((t) =>
          t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t,
        ),
        tasks: task
          ? get().tasks.map((t) =>
              t.id === task.id ? { ...t, status: 'unassigned' as const, assignedTeamId: null } : t,
            )
          : get().tasks,
      });
      return;
    }
    if (membership.role === 'leader') {
      const nextLeader = remaining
        .filter((tm) => tm.teamId === membership.teamId)
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
      if (nextLeader) {
        set({
          teamMembers: remaining.map((tm) =>
            tm.teamId === nextLeader.teamId && tm.userId === nextLeader.userId
              ? { ...tm, role: 'leader' }
              : tm,
          ),
        });
        return;
      }
    }
    set({ teamMembers: remaining });
  },

  createTeam: (missionId, name) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const teamId = genId('t');
    const team: Team = {
      id: teamId,
      missionId,
      name: name || undefined,
      status: 'idle',
      joinCode: `T-${teamId}`,
      createdBy: currentUser.id,
    };
    const filtered = get().teamMembers.filter((tm) => tm.userId !== currentUser.id);
    set((s) => ({
      teams: [...s.teams, team],
      teamMembers: [
        ...filtered,
        { teamId, userId: currentUser.id, role: 'leader', joinedAt: new Date().toISOString() },
      ],
    }));
  },

  toggleTeamResting: (teamId) => {
    set((s) => ({
      teams: s.teams.map((t) => {
        if (t.id !== teamId) return t;
        if (t.status === 'resting') {
          const hasTask = s.tasks.some((tk) => tk.assignedTeamId === teamId && tk.status === 'inProgress');
          return { ...t, status: hasTask ? 'inTask' : 'idle' };
        }
        if (t.status === 'idle' || t.status === 'inTask') {
          return { ...t, status: 'resting' };
        }
        return t;
      }),
    }));
  },

  markTaskComplete: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'inProgress') return;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed' as const, assignedTeamId: null } : t,
      ),
      teams: task.assignedTeamId
        ? s.teams.map((t) =>
            t.id === task.assignedTeamId ? { ...t, status: 'idle' as const } : t,
          )
        : s.teams,
    }));
  },

  createMission: (name, description) => {
    const { currentManagerUser } = get();
    if (!currentManagerUser) return;
    const missionId = genId('m');
    const mission: Mission = {
      id: missionId,
      name,
      description,
      status: 'active',
      joinCode: `MSN-${missionId}`,
      createdAt: new Date().toISOString(),
      createdBy: currentManagerUser.id,
    };
    set((s) => ({
      missions: [...s.missions, mission],
      missionParticipants: [
        ...s.missionParticipants,
        { userId: currentManagerUser.id, missionId, role: 'manager', joinedAt: new Date().toISOString() },
      ],
    }));
  },

  updateMissionStatus: (missionId, status, keepTeams = true) => {
    set((s) => {
      let teams = s.teams;
      let tasks = s.tasks;
      if (status === 'suspended' && !keepTeams) {
        const missionTeamIds = teams.filter((t) => t.missionId === missionId && t.status !== 'dissolved').map((t) => t.id);
        teams = teams.map((t) =>
          missionTeamIds.includes(t.id) ? { ...t, status: 'dissolved' as const } : t,
        );
        tasks = tasks.map((t) =>
          t.missionId === missionId && t.assignedTeamId && missionTeamIds.includes(t.assignedTeamId)
            ? { ...t, assignedTeamId: null, status: t.status === 'inProgress' ? 'unassigned' as const : t.status }
            : t,
        );
      }
      return {
        missions: s.missions.map((m) => (m.id === missionId ? { ...m, status } : m)),
        teams,
        tasks,
      };
    });
  },

  createTask: (missionId, label, searchType, priority, notes) => {
    const taskId = genId('tk');
    const task: Task = {
      id: taskId,
      missionId,
      label,
      searchType,
      priority,
      notes,
      status: 'draft',
      assignedTeamId: null,
    };
    set((s) => ({ tasks: [...s.tasks, task] }));
  },

  updateTask: (taskId, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
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
        teams = teams.map((t) =>
          t.id === task.assignedTeamId ? { ...t, status: 'idle' as const } : t,
        );
      }
      return {
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, assignedTeamId: shouldReleaseTeam ? null : t.assignedTeamId }
            : t,
        ),
        teams,
      };
    });
  },

  assignTeamToTask: (taskId, teamId) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'inProgress' as const, assignedTeamId: teamId } : t,
      ),
      teams: s.teams.map((t) =>
        t.id === teamId ? { ...t, status: 'inTask' as const } : t,
      ),
      pendingAssignment: null,
    }));
  },

  revokeTaskFromTeam: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || !task.assignedTeamId) return;
    const teamId = task.assignedTeamId;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'unassigned' as const, assignedTeamId: null } : t,
      ),
      teams: s.teams.map((t) =>
        t.id === teamId ? { ...t, status: 'idle' as const } : t,
      ),
    }));
  },

  createTeamAsManager: (missionId, name, leaderId) => {
    const teamId = genId('t');
    const { currentManagerUser } = get();
    const team: Team = {
      id: teamId,
      missionId,
      name: name || undefined,
      status: 'idle',
      joinCode: `T-${teamId}`,
      createdBy: currentManagerUser?.id || '',
    };
    const newMembers = leaderId
      ? [{ teamId, userId: leaderId, role: 'leader' as const, joinedAt: new Date().toISOString() }]
      : [];
    set((s) => ({
      teams: [...s.teams, team],
      teamMembers: [...s.teamMembers.filter((tm) => !leaderId || tm.userId !== leaderId), ...newMembers],
    }));
  },

  assignParticipantToTeam: (userId, teamId) => {
    const already = get().teamMembers.find((tm) => tm.userId === userId && tm.teamId === teamId);
    if (already) return;
    const filtered = get().teamMembers.filter((tm) => tm.userId !== userId);
    const hasLeader = filtered.some((tm) => tm.teamId === teamId && tm.role === 'leader');
    set({
      teamMembers: [
        ...filtered,
        { teamId, userId, role: hasLeader ? 'member' : 'leader', joinedAt: new Date().toISOString() },
      ],
    });
  },

  removeParticipantFromTeam: (userId, teamId) => {
    const membership = get().teamMembers.find((tm) => tm.userId === userId && tm.teamId === teamId);
    if (!membership) return;
    const remaining = get().teamMembers.filter(
      (tm) => !(tm.userId === userId && tm.teamId === teamId),
    );
    const teamStillHasMembers = remaining.some((tm) => tm.teamId === teamId);
    if (!teamStillHasMembers) {
      get().dissolveTeam(teamId);
      set({ teamMembers: remaining });
      return;
    }
    if (membership.role === 'leader') {
      const nextLeader = remaining
        .filter((tm) => tm.teamId === teamId)
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
      set({
        teamMembers: remaining.map((tm) =>
          tm.teamId === nextLeader.teamId && tm.userId === nextLeader.userId
            ? { ...tm, role: 'leader' }
            : tm,
        ),
      });
      return;
    }
    set({ teamMembers: remaining });
  },

  renameTeam: (teamId, name) => {
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, name: name || undefined } : t)),
    }));
  },

  dissolveTeam: (teamId) => {
    const task = get().tasks.find((t) => t.assignedTeamId === teamId);
    set((s) => ({
      teams: s.teams.map((t) =>
        t.id === teamId ? { ...t, status: 'dissolved' as const } : t,
      ),
      tasks: task
        ? s.tasks.map((t) =>
            t.id === task.id ? { ...t, status: 'unassigned' as const, assignedTeamId: null } : t,
          )
        : s.tasks,
      teamMembers: s.teamMembers.filter((tm) => tm.teamId !== teamId),
    }));
  },

  moveTeamToStatus: (teamId, newStatus) => {
    if (newStatus === 'dissolved') {
      get().dissolveTeam(teamId);
      return;
    }
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t)),
    }));
  },

  takeControl: (missionId) => {
    const { currentManagerUser } = get();
    if (!currentManagerUser) return;
    set((s) => ({
      controllers: { ...s.controllers, [missionId]: currentManagerUser.id },
    }));
  },

  addParticipantToMission: (missionId, userId, role) => {
    const already = get().missionParticipants.find(
      (mp) => mp.userId === userId && mp.missionId === missionId,
    );
    if (already) return;
    set((s) => ({
      missionParticipants: [
        ...s.missionParticipants,
        { userId, missionId, role, joinedAt: new Date().toISOString() },
      ],
    }));
  },

  getUserMission: (userId) => {
    const mp = get().missionParticipants.find((p) => p.userId === userId);
    return mp ? get().missions.find((m) => m.id === mp.missionId) : undefined;
  },

  getUserTeam: (userId) => {
    const tm = get().teamMembers.find((m) => m.userId === userId);
    return tm ? get().teams.find((t) => t.id === tm.teamId) : undefined;
  },

  getTeamLeader: (teamId) => {
    const leader = get().teamMembers.find((tm) => tm.teamId === teamId && tm.role === 'leader');
    return leader ? get().users.find((u) => u.id === leader.userId) : undefined;
  },

  getTeamMembers: (teamId) => {
    const members = get().teamMembers.filter((tm) => tm.teamId === teamId);
    return members.map((tm) => {
      const user = get().users.find((u) => u.id === tm.userId)!;
      return { ...user, role: tm.role };
    });
  },

  getTeamTask: (teamId) => {
    return get().tasks.find((t) => t.assignedTeamId === teamId && t.status === 'inProgress');
  },

  getMissionParticipants: (missionId) => {
    const mps = get().missionParticipants.filter((mp) => mp.missionId === missionId);
    return mps.map((mp) => {
      const user = get().users.find((u) => u.id === mp.userId)!;
      return { ...user, role: mp.role };
    });
  },

  getUnassignedParticipants: (missionId) => {
    const mps = get().missionParticipants.filter((mp) => mp.missionId === missionId);
    const assignedUserIds = get().teamMembers
      .filter((tm) => {
        const team = get().teams.find((t) => t.id === tm.teamId);
        return team && team.missionId === missionId && team.status !== 'dissolved';
      })
      .map((tm) => tm.userId);
    return mps
      .filter((mp) => !assignedUserIds.includes(mp.userId))
      .map((mp) => get().users.find((u) => u.id === mp.userId)!);
  },

  isController: (missionId) => {
    const { currentManagerUser, controllers } = get();
    return currentManagerUser ? controllers[missionId] === currentManagerUser.id : false;
  },

  getControllerName: (missionId) => {
    const controllerId = get().controllers[missionId];
    if (!controllerId) return null;
    const user = get().users.find((u) => u.id === controllerId);
    return user?.name || null;
  },

  getTeamDisplayName: (teamId) => {
    const team = get().teams.find((t) => t.id === teamId);
    if (!team) return '';
    if (team.name) return team.name;
    const leader = get().getTeamLeader(teamId);
    return leader ? leader.name : 'Tim';
  },
}));
