import { create } from 'zustand';
import type {
  Mission, OperationalPeriod, User, MissionParticipant, Team, TeamMember, Task,
  MissionStatus, TeamStatus, TaskStatus, TaskPriority, TaskType, SearchType,
  ParticipantRole,
} from './types';
import {
  mockMissions, mockPeriods, mockUsers, mockMissionParticipants,
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

interface TaskFilter {
  search: string;
  taskType: TaskType | null;
}

interface TeamFilter {
  search: string;
}

interface AppState {
  missions: Mission[];
  periods: OperationalPeriod[];
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
  selectedPeriodId: string | null;
  selectedSearcherMissionId: string | null;
  selectedSearcherPeriodId: string | null;
  pendingAssignment: PendingAssignment | null;
  taskFilter: TaskFilter;
  teamFilter: TeamFilter;

  setViewMode: (mode: ViewMode) => void;
  setSelectedMission: (missionId: string | null) => void;
  setSelectedPeriod: (periodId: string | null) => void;
  setSelectedSearcherMission: (missionId: string | null) => void;
  setSelectedSearcherPeriod: (periodId: string | null) => void;
  setPendingAssignment: (pa: PendingAssignment | null) => void;
  setTaskFilter: (filter: Partial<TaskFilter>) => void;
  setTeamFilter: (filter: Partial<TeamFilter>) => void;

  loginAsRegistered: (userId: string) => void;
  loginAsAnonymous: (name: string, email: string) => void;
  loginManagerAs: (userId: string) => void;
  logout: () => void;

  joinMission: (missionId: string) => void;
  leaveMission: (missionId: string) => void;
  removeParticipantFromMission: (missionId: string, userId: string) => void;
  joinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  createTeam: (periodId: string, name?: string) => void;
  toggleTeamResting: (teamId: string) => void;
  markTaskComplete: (taskId: string) => void;

  createMission: (name: string, description: string) => void;
  deleteMission: (missionId: string) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus, keepTeams?: boolean) => void;
  createTask: (periodId: string, label: string, searchType: SearchType, taskType: TaskType, priority: TaskPriority, notes: string) => void;
  updateTask: (taskId: string, updates: Partial<Pick<Task, 'label' | 'searchType' | 'taskType' | 'priority' | 'notes'>>) => void;
  moveTaskToStatus: (taskId: string, newStatus: TaskStatus) => void;
  assignTeamToTask: (taskId: string, teamId: string) => void;
  revokeTaskFromTeam: (taskId: string) => void;
  createTeamAsManager: (periodId: string, name?: string, leaderId?: string) => void;
  assignParticipantToTeam: (userId: string, teamId: string) => void;
  removeParticipantFromTeam: (userId: string, teamId: string) => void;
  renameTeam: (teamId: string, name: string) => void;
  dissolveTeam: (teamId: string) => void;
  moveTeamToStatus: (teamId: string, newStatus: TeamStatus) => void;
  takeControl: (missionId: string) => void;
  addParticipantToMission: (missionId: string, userId: string, role: ParticipantRole) => void;

  createPeriod: (missionId: string, name: string) => void;
  lockPeriod: (periodId: string) => void;
  unlockPeriod: (periodId: string) => void;
  renamePeriod: (periodId: string, name: string) => void;

  joinByLink: (link: string) => 'mission' | 'team' | null;

  getUserMission: (userId: string) => Mission | undefined;
  getUserTeam: (userId: string) => Team | undefined;
  getTeamLeader: (teamId: string) => User | undefined;
  getTeamMembers: (teamId: string) => (User & { role: string })[];
  getTeamHistory: (teamId: string) => (User & { role: string; active: boolean })[];
  getTeamTasks: (teamId: string) => Task[];
  getTeamTask: (teamId: string) => Task | undefined;
  getMissionParticipants: (missionId: string) => (User & { role: ParticipantRole })[];
  getUnassignedParticipants: (missionId: string) => User[];
  isController: (missionId: string) => boolean;
  getControllerName: (missionId: string) => string | null;
  getTeamDisplayName: (teamId: string) => string;
  getPeriodMission: (periodId: string) => Mission | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  missions: [...mockMissions],
  periods: [...mockPeriods],
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
  selectedPeriodId: 'p1',
  selectedSearcherMissionId: null,
  selectedSearcherPeriodId: null,
  pendingAssignment: null,
  taskFilter: { search: '', taskType: null },
  teamFilter: { search: '' },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedMission: (missionId) => set({ selectedMissionId: missionId }),
  setSelectedPeriod: (periodId) => set({ selectedPeriodId: periodId }),
  setSelectedSearcherMission: (missionId) => set({ selectedSearcherMissionId: missionId }),
  setSelectedSearcherPeriod: (periodId) => set({ selectedSearcherPeriodId: periodId }),
  setPendingAssignment: (pa) => set({ pendingAssignment: pa }),
  setTaskFilter: (filter) => set((s) => ({ taskFilter: { ...s.taskFilter, ...filter } })),
  setTeamFilter: (filter) => set((s) => ({ teamFilter: { ...s.teamFilter, ...filter } })),

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
      (mp) => mp.userId === currentUser.id && mp.missionId === missionId && mp.leftAt === null,
    );
    if (already) return;
    // If previously left, rejoin by clearing leftAt
    const previous = missionParticipants.find(
      (mp) => mp.userId === currentUser.id && mp.missionId === missionId,
    );
    if (previous) {
      set({
        missionParticipants: missionParticipants.map((mp) =>
          mp.userId === currentUser.id && mp.missionId === missionId
            ? { ...mp, leftAt: null }
            : mp,
        ),
        selectedSearcherMissionId: missionId,
      });
      return;
    }
    set({
      missionParticipants: [
        ...missionParticipants,
        { userId: currentUser.id, missionId, role: 'searcher', joinedAt: new Date().toISOString(), leftAt: null },
      ],
      selectedSearcherMissionId: missionId,
    });
  },

  leaveMission: (missionId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    // Find teams via periods — leave all active teams in this mission
    const missionPeriodIds = get().periods
      .filter((p) => p.missionId === missionId)
      .map((p) => p.id);
    const userTeamsInMission = get().teamMembers.filter((tm) => {
      const team = get().teams.find((t) => t.id === tm.teamId);
      return (
        tm.userId === currentUser.id &&
        tm.active &&
        team &&
        missionPeriodIds.includes(team.periodId) &&
        team.status !== 'dissolved'
      );
    });
    let teamMembers = get().teamMembers;
    let teams = get().teams;
    for (const membership of userTeamsInMission) {
      // Mark member inactive instead of deleting
      teamMembers = teamMembers.map((tm) =>
        tm.userId === currentUser.id && tm.teamId === membership.teamId
          ? { ...tm, active: false }
          : tm,
      );
      const remaining = teamMembers.filter((tm) => tm.teamId === membership.teamId && tm.active);
      if (remaining.length === 0) {
        teams = teams.map((t) =>
          t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t,
        );
      } else if (membership.role === 'leader') {
        const next = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
        teamMembers = teamMembers.map((tm) =>
          tm.teamId === next.teamId && tm.userId === next.userId ? { ...tm, role: 'leader' } : tm,
        );
      }
    }
    set({
      missionParticipants: get().missionParticipants.map((mp) =>
        mp.userId === currentUser.id && mp.missionId === missionId
          ? { ...mp, leftAt: new Date().toISOString() }
          : mp,
      ),
      teamMembers,
      teams,
      selectedSearcherMissionId:
        get().selectedSearcherMissionId === missionId ? null : get().selectedSearcherMissionId,
    });
  },

  removeParticipantFromMission: (missionId, userId) => {
    const missionPeriodIds = get().periods
      .filter((p) => p.missionId === missionId)
      .map((p) => p.id);
    const userTeamsInMission = get().teamMembers.filter((tm) => {
      const team = get().teams.find((t) => t.id === tm.teamId);
      return (
        tm.userId === userId &&
        tm.active &&
        team &&
        missionPeriodIds.includes(team.periodId) &&
        team.status !== 'dissolved'
      );
    });
    let teamMembers = get().teamMembers;
    let teams = get().teams;
    for (const membership of userTeamsInMission) {
      teamMembers = teamMembers.map((tm) =>
        tm.userId === userId && tm.teamId === membership.teamId
          ? { ...tm, active: false }
          : tm,
      );
      const remaining = teamMembers.filter((tm) => tm.teamId === membership.teamId && tm.active);
      if (remaining.length === 0) {
        teams = teams.map((t) =>
          t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t,
        );
      } else if (membership.role === 'leader') {
        const next = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
        teamMembers = teamMembers.map((tm) =>
          tm.teamId === next.teamId && tm.userId === next.userId ? { ...tm, role: 'leader' } : tm,
        );
      }
    }
    set({
      missionParticipants: get().missionParticipants.map((mp) =>
        mp.userId === userId && mp.missionId === missionId
          ? { ...mp, leftAt: new Date().toISOString() }
          : mp,
      ),
      teamMembers,
      teams,
    });
  },

  joinTeam: (teamId) => {
    const { currentUser, teamMembers } = get();
    if (!currentUser) return;
    const already = teamMembers.find(
      (tm) => tm.userId === currentUser.id && tm.teamId === teamId && tm.active,
    );
    if (already) return;
    // Remove from any other active team memberships
    const filtered = teamMembers.map((tm) =>
      tm.userId === currentUser.id && tm.active ? { ...tm, active: false } : tm,
    );
    const team = get().teams.find((t) => t.id === teamId);
    if (team) {
      const period = get().periods.find((p) => p.id === team.periodId);
      if (period) {
        const alreadyInMission = get().missionParticipants.find(
          (mp) => mp.userId === currentUser.id && mp.missionId === period.missionId && mp.leftAt === null,
        );
        if (!alreadyInMission) {
          get().joinMission(period.missionId);
        }
      }
    }
    // Check if previously a member of this team (inactive)
    const prevMembership = filtered.find(
      (tm) => tm.userId === currentUser.id && tm.teamId === teamId,
    );
    if (prevMembership) {
      const hasLeader = filtered.some((tm) => tm.teamId === teamId && tm.role === 'leader' && tm.active);
      set({
        teamMembers: filtered.map((tm) =>
          tm.userId === currentUser.id && tm.teamId === teamId
            ? { ...tm, active: true, role: hasLeader ? 'member' : 'leader' }
            : tm,
        ),
      });
      return;
    }
    const hasLeader = filtered.some((tm) => tm.teamId === teamId && tm.role === 'leader' && tm.active);
    set({
      teamMembers: [
        ...filtered,
        { teamId, userId: currentUser.id, role: hasLeader ? 'member' : 'leader', active: true, joinedAt: new Date().toISOString() },
      ],
    });
  },

  leaveTeam: () => {
    const { currentUser, teamMembers, teams } = get();
    if (!currentUser) return;
    const membership = teamMembers.find((tm) => tm.userId === currentUser.id && tm.active);
    if (!membership) return;
    const updatedMembers = teamMembers.map((tm) =>
      tm.userId === currentUser.id && tm.teamId === membership.teamId
        ? { ...tm, active: false }
        : tm,
    );
    const remaining = updatedMembers.filter((tm) => tm.teamId === membership.teamId && tm.active);
    if (remaining.length === 0) {
      // Dissolve team and revoke all inProgress tasks
      const teamInProgressTasks = get().tasks.filter(
        (t) => t.assignedTeamId === membership.teamId && t.status === 'inProgress',
      );
      set({
        teamMembers: updatedMembers,
        teams: teams.map((t) =>
          t.id === membership.teamId ? { ...t, status: 'dissolved' as const } : t,
        ),
        tasks: get().tasks.map((t) => {
          if (teamInProgressTasks.some((tp) => tp.id === t.id)) {
            return { ...t, status: 'unassigned' as const, assignedTeamId: null };
          }
          return t;
        }),
      });
      return;
    }
    if (membership.role === 'leader') {
      const nextLeader = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
      if (nextLeader) {
        set({
          teamMembers: updatedMembers.map((tm) =>
            tm.teamId === nextLeader.teamId && tm.userId === nextLeader.userId
              ? { ...tm, role: 'leader' }
              : tm,
          ),
        });
        return;
      }
    }
    set({ teamMembers: updatedMembers });
  },

  createTeam: (periodId, name) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const teamId = genId('t');
    const team: Team = {
      id: teamId,
      periodId,
      name: name || undefined,
      status: 'idle',
      joinCode: `T-${teamId}`,
      createdBy: currentUser.id,
    };
    // Mark current user inactive in any existing team
    const filtered = get().teamMembers.map((tm) =>
      tm.userId === currentUser.id && tm.active ? { ...tm, active: false } : tm,
    );
    set((s) => ({
      teams: [...s.teams, team],
      teamMembers: [
        ...filtered,
        { teamId, userId: currentUser.id, role: 'leader', active: true, joinedAt: new Date().toISOString() },
      ],
    }));
  },

  toggleTeamResting: (teamId) => {
    set((s) => ({
      teams: s.teams.map((t) => {
        if (t.id !== teamId) return t;
        if (t.status === 'resting') {
          const hasTask = s.tasks.some(
            (tk) => tk.assignedTeamId === teamId && tk.status === 'inProgress',
          );
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
    const teamId = task.assignedTeamId;
    const now = new Date().toISOString();
    // Check if team has any OTHER inProgress tasks
    const otherInProgressTasks = teamId
      ? get().tasks.filter(
          (t) => t.id !== taskId && t.assignedTeamId === teamId && t.status === 'inProgress',
        )
      : [];
    const teamGoesIdle = teamId && otherInProgressTasks.length === 0;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'completed' as const, assignedTeamId: null, completedAt: now }
          : t,
      ),
      teams: teamGoesIdle
        ? s.teams.map((t) => (t.id === teamId ? { ...t, status: 'idle' as const } : t))
        : s.teams,
    }));
  },

  createMission: (name, description) => {
    const { currentManagerUser } = get();
    if (!currentManagerUser) return;
    const missionId = genId('m');
    const periodId = genId('p');
    const mission: Mission = {
      id: missionId,
      name,
      description,
      status: 'active',
      station: currentManagerUser.station || '',
      joinCode: `MSN-${missionId}`,
      createdAt: new Date().toISOString(),
      createdBy: currentManagerUser.id,
    };
    const defaultPeriod: OperationalPeriod = {
      id: periodId,
      missionId,
      name: 'Period 1',
      locked: false,
    };
    set((s) => ({
      missions: [...s.missions, mission],
      periods: [...s.periods, defaultPeriod],
      missionParticipants: [
        ...s.missionParticipants,
        {
          userId: currentManagerUser.id,
          missionId,
          role: 'manager',
          joinedAt: new Date().toISOString(),
          leftAt: null,
        },
      ],
    }));
  },

  deleteMission: (missionId) => {
    const missionPeriodIds = get().periods
      .filter((p) => p.missionId === missionId)
      .map((p) => p.id);
    set((s) => ({
      missions: s.missions.filter((m) => m.id !== missionId),
      periods: s.periods.filter((p) => p.missionId !== missionId),
      missionParticipants: s.missionParticipants.filter((mp) => mp.missionId !== missionId),
      teams: s.teams.filter((t) => !missionPeriodIds.includes(t.periodId)),
      teamMembers: s.teamMembers.filter((tm) => {
        const team = s.teams.find((t) => t.id === tm.teamId);
        return !team || !missionPeriodIds.includes(team.periodId);
      }),
      tasks: s.tasks.filter((t) => !missionPeriodIds.includes(t.periodId)),
      controllers: Object.fromEntries(
        Object.entries(s.controllers).filter(([k]) => k !== missionId),
      ),
      selectedMissionId: s.selectedMissionId === missionId ? null : s.selectedMissionId,
      selectedPeriodId: s.selectedPeriodId && missionPeriodIds.includes(s.selectedPeriodId)
        ? null
        : s.selectedPeriodId,
    }));
  },

  updateMissionStatus: (missionId, status, keepTeams = true) => {
    set((s) => {
      const missionPeriodIds = s.periods
        .filter((p) => p.missionId === missionId)
        .map((p) => p.id);
      let teams = s.teams;
      let tasks = s.tasks;
      let teamMembers = s.teamMembers;
      if (status === 'suspended' && !keepTeams) {
        const missionTeamIds = teams
          .filter((t) => missionPeriodIds.includes(t.periodId) && t.status !== 'dissolved')
          .map((t) => t.id);
        teams = teams.map((t) =>
          missionTeamIds.includes(t.id) ? { ...t, status: 'dissolved' as const } : t,
        );
        teamMembers = teamMembers.map((tm) =>
          missionTeamIds.includes(tm.teamId) ? { ...tm, active: false } : tm,
        );
        tasks = tasks.map((t) =>
          missionPeriodIds.includes(t.periodId) &&
          t.assignedTeamId &&
          missionTeamIds.includes(t.assignedTeamId)
            ? { ...t, assignedTeamId: null, status: t.status === 'inProgress' ? ('unassigned' as const) : t.status }
            : t,
        );
      }
      return {
        missions: s.missions.map((m) => (m.id === missionId ? { ...m, status } : m)),
        teams,
        tasks,
        teamMembers,
      };
    });
  },

  createTask: (periodId, label, searchType, taskType, priority, notes) => {
    const taskId = genId('tk');
    const task: Task = {
      id: taskId,
      periodId,
      label,
      searchType,
      taskType,
      priority,
      notes,
      status: 'draft',
      assignedTeamId: null,
      startedAt: null,
      completedAt: null,
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
    const now = new Date().toISOString();
    const movingBackward =
      task.assignedTeamId &&
      (newStatus === 'unassigned' || newStatus === 'draft');
    const movingToCompleted = newStatus === 'completed';

    set((s) => {
      let teams = s.teams;
      let tasks = s.tasks;

      if (movingBackward && task.assignedTeamId) {
        // Release task from team, only set team idle if no remaining inProgress tasks
        const otherInProgress = s.tasks.filter(
          (t) => t.id !== taskId && t.assignedTeamId === task.assignedTeamId && t.status === 'inProgress',
        );
        if (otherInProgress.length === 0) {
          teams = teams.map((t) =>
            t.id === task.assignedTeamId ? { ...t, status: 'idle' as const } : t,
          );
        }
        tasks = tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, assignedTeamId: null }
            : t,
        );
      } else if (movingToCompleted && task.assignedTeamId) {
        const otherInProgress = s.tasks.filter(
          (t) => t.id !== taskId && t.assignedTeamId === task.assignedTeamId && t.status === 'inProgress',
        );
        if (otherInProgress.length === 0) {
          teams = teams.map((t) =>
            t.id === task.assignedTeamId ? { ...t, status: 'idle' as const } : t,
          );
        }
        tasks = tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, assignedTeamId: null, completedAt: now }
            : t,
        );
      } else {
        const startedAt = newStatus === 'inProgress' ? now : task.startedAt;
        tasks = tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, startedAt }
            : t,
        );
      }

      return { tasks, teams };
    });
  },

  assignTeamToTask: (taskId, teamId) => {
    const now = new Date().toISOString();
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'inProgress' as const, assignedTeamId: teamId, startedAt: now }
          : t,
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
    // Only set team idle if no other inProgress tasks remain
    const otherInProgress = get().tasks.filter(
      (t) => t.id !== taskId && t.assignedTeamId === teamId && t.status === 'inProgress',
    );
    const teamGoesIdle = otherInProgress.length === 0;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'unassigned' as const, assignedTeamId: null } : t,
      ),
      teams: teamGoesIdle
        ? s.teams.map((t) => (t.id === teamId ? { ...t, status: 'idle' as const } : t))
        : s.teams,
    }));
  },

  createTeamAsManager: (periodId, name, leaderId) => {
    const teamId = genId('t');
    const { currentManagerUser } = get();
    const team: Team = {
      id: teamId,
      periodId,
      name: name || undefined,
      status: 'idle',
      joinCode: `T-${teamId}`,
      createdBy: currentManagerUser?.id || '',
    };
    const newMembers = leaderId
      ? [{ teamId, userId: leaderId, role: 'leader' as const, active: true, joinedAt: new Date().toISOString() }]
      : [];
    set((s) => ({
      teams: [...s.teams, team],
      teamMembers: [
        // Mark the leader inactive in any previous team
        ...s.teamMembers.map((tm) =>
          leaderId && tm.userId === leaderId && tm.active ? { ...tm, active: false } : tm,
        ),
        ...newMembers,
      ],
    }));
  },

  assignParticipantToTeam: (userId, teamId) => {
    const already = get().teamMembers.find(
      (tm) => tm.userId === userId && tm.teamId === teamId && tm.active,
    );
    if (already) return;
    // Mark user inactive in any other active team membership
    const updatedMembers = get().teamMembers.map((tm) =>
      tm.userId === userId && tm.active ? { ...tm, active: false } : tm,
    );
    const hasLeader = updatedMembers.some(
      (tm) => tm.teamId === teamId && tm.role === 'leader' && tm.active,
    );
    // Check if user was previously in this team (inactive)
    const prevMembership = updatedMembers.find(
      (tm) => tm.userId === userId && tm.teamId === teamId,
    );
    if (prevMembership) {
      set({
        teamMembers: updatedMembers.map((tm) =>
          tm.userId === userId && tm.teamId === teamId
            ? { ...tm, active: true, role: hasLeader ? 'member' : 'leader' }
            : tm,
        ),
      });
      return;
    }
    set({
      teamMembers: [
        ...updatedMembers,
        { teamId, userId, role: hasLeader ? 'member' : 'leader', active: true, joinedAt: new Date().toISOString() },
      ],
    });
  },

  removeParticipantFromTeam: (userId, teamId) => {
    const membership = get().teamMembers.find(
      (tm) => tm.userId === userId && tm.teamId === teamId && tm.active,
    );
    if (!membership) return;
    const updatedMembers = get().teamMembers.map((tm) =>
      tm.userId === userId && tm.teamId === teamId ? { ...tm, active: false } : tm,
    );
    const remaining = updatedMembers.filter((tm) => tm.teamId === teamId && tm.active);
    if (remaining.length === 0) {
      // Dissolve team — revoke all inProgress tasks, mark all members inactive
      const teamInProgressTasks = get().tasks.filter(
        (t) => t.assignedTeamId === teamId && t.status === 'inProgress',
      );
      set({
        teams: get().teams.map((t) =>
          t.id === teamId ? { ...t, status: 'dissolved' as const } : t,
        ),
        teamMembers: updatedMembers,
        tasks: get().tasks.map((t) => {
          if (teamInProgressTasks.some((tp) => tp.id === t.id)) {
            return { ...t, status: 'unassigned' as const, assignedTeamId: null };
          }
          return t;
        }),
      });
      return;
    }
    if (membership.role === 'leader') {
      const nextLeader = remaining.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0];
      set({
        teamMembers: updatedMembers.map((tm) =>
          tm.teamId === nextLeader.teamId && tm.userId === nextLeader.userId
            ? { ...tm, role: 'leader' }
            : tm,
        ),
      });
      return;
    }
    set({ teamMembers: updatedMembers });
  },

  renameTeam: (teamId, name) => {
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, name: name || undefined } : t)),
    }));
  },

  dissolveTeam: (teamId) => {
    // Revoke all inProgress tasks assigned to this team
    const teamInProgressTasks = get().tasks.filter(
      (t) => t.assignedTeamId === teamId && t.status === 'inProgress',
    );
    set((s) => ({
      teams: s.teams.map((t) =>
        t.id === teamId ? { ...t, status: 'dissolved' as const } : t,
      ),
      tasks: s.tasks.map((t) => {
        if (teamInProgressTasks.some((tp) => tp.id === t.id)) {
          return { ...t, status: 'unassigned' as const, assignedTeamId: null };
        }
        return t;
      }),
      teamMembers: s.teamMembers.map((tm) =>
        tm.teamId === teamId ? { ...tm, active: false } : tm,
      ),
    }));
  },

  moveTeamToStatus: (teamId, newStatus) => {
    const team = get().teams.find((t) => t.id === teamId);
    if (team?.status === 'dissolved') return;
    if (newStatus === 'dissolved') {
      get().dissolveTeam(teamId);
      return;
    }
    if (newStatus === 'idle') {
      // Forcibly revoke all assigned inProgress tasks
      const teamInProgressTasks = get().tasks.filter(
        (t) => t.assignedTeamId === teamId && t.status === 'inProgress',
      );
      if (teamInProgressTasks.length > 0) {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (teamInProgressTasks.some((tp) => tp.id === t.id)) {
              return { ...t, status: 'unassigned' as const, assignedTeamId: null };
            }
            return t;
          }),
          teams: s.teams.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t)),
        }));
        return;
      }
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
      (mp) => mp.userId === userId && mp.missionId === missionId && mp.leftAt === null,
    );
    if (already) return;
    const previous = get().missionParticipants.find(
      (mp) => mp.userId === userId && mp.missionId === missionId,
    );
    if (previous) {
      set((s) => ({
        missionParticipants: s.missionParticipants.map((mp) =>
          mp.userId === userId && mp.missionId === missionId
            ? { ...mp, leftAt: null, role }
            : mp,
        ),
      }));
      return;
    }
    set((s) => ({
      missionParticipants: [
        ...s.missionParticipants,
        { userId, missionId, role, joinedAt: new Date().toISOString(), leftAt: null },
      ],
    }));
  },

  createPeriod: (missionId, name) => {
    const periodId = genId('p');
    const period: OperationalPeriod = {
      id: periodId,
      missionId,
      name,
      locked: false,
    };
    set((s) => ({ periods: [...s.periods, period] }));
  },

  lockPeriod: (periodId) => {
    set((s) => ({
      periods: s.periods.map((p) => (p.id === periodId ? { ...p, locked: true } : p)),
    }));
  },

  unlockPeriod: (periodId) => {
    set((s) => ({
      periods: s.periods.map((p) => (p.id === periodId ? { ...p, locked: false } : p)),
    }));
  },

  renamePeriod: (periodId, name) => {
    set((s) => ({
      periods: s.periods.map((p) => (p.id === periodId ? { ...p, name } : p)),
    }));
  },

  joinByLink: (link) => {
    const missionMatch = link.match(/^cmrs:\/\/mission\/(.+)$/);
    if (missionMatch) {
      const joinCode = missionMatch[1];
      const mission = get().missions.find((m) => m.joinCode === joinCode);
      if (!mission) return null;
      get().joinMission(mission.id);
      return 'mission';
    }
    const teamMatch = link.match(/^cmrs:\/\/team\/(.+)$/);
    if (teamMatch) {
      const joinCode = teamMatch[1];
      const team = get().teams.find((t) => t.joinCode === joinCode);
      if (!team) return null;
      get().joinTeam(team.id);
      return 'team';
    }
    return null;
  },

  getUserMission: (userId) => {
    const mp = get().missionParticipants.find(
      (p) => p.userId === userId && p.leftAt === null,
    );
    return mp ? get().missions.find((m) => m.id === mp.missionId) : undefined;
  },

  getUserTeam: (userId) => {
    const tm = get().teamMembers.find((m) => m.userId === userId && m.active);
    return tm ? get().teams.find((t) => t.id === tm.teamId) : undefined;
  },

  getTeamLeader: (teamId) => {
    const leader = get().teamMembers.find(
      (tm) => tm.teamId === teamId && tm.role === 'leader' && tm.active,
    );
    return leader ? get().users.find((u) => u.id === leader.userId) : undefined;
  },

  getTeamMembers: (teamId) => {
    const members = get().teamMembers.filter((tm) => tm.teamId === teamId && tm.active);
    return members.map((tm) => {
      const user = get().users.find((u) => u.id === tm.userId)!;
      return { ...user, role: tm.role };
    });
  },

  getTeamHistory: (teamId) => {
    const members = get().teamMembers.filter((tm) => tm.teamId === teamId);
    return members.map((tm) => {
      const user = get().users.find((u) => u.id === tm.userId)!;
      return { ...user, role: tm.role, active: tm.active };
    });
  },

  getTeamTasks: (teamId) => {
    return get().tasks.filter((t) => t.assignedTeamId === teamId && t.status === 'inProgress');
  },

  getTeamTask: (teamId) => {
    return get().tasks.find((t) => t.assignedTeamId === teamId && t.status === 'inProgress');
  },

  getMissionParticipants: (missionId) => {
    const mps = get().missionParticipants.filter(
      (mp) => mp.missionId === missionId && mp.leftAt === null,
    );
    return mps.map((mp) => {
      const user = get().users.find((u) => u.id === mp.userId)!;
      return { ...user, role: mp.role };
    });
  },

  getUnassignedParticipants: (missionId) => {
    const mps = get().missionParticipants.filter(
      (mp) => mp.missionId === missionId && mp.leftAt === null,
    );
    const missionPeriodIds = get().periods
      .filter((p) => p.missionId === missionId)
      .map((p) => p.id);
    const assignedUserIds = get().teamMembers
      .filter((tm) => {
        const team = get().teams.find((t) => t.id === tm.teamId);
        return team && missionPeriodIds.includes(team.periodId) && team.status !== 'dissolved' && tm.active;
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

  getPeriodMission: (periodId) => {
    const period = get().periods.find((p) => p.id === periodId);
    return period ? get().missions.find((m) => m.id === period.missionId) : undefined;
  },
}));
