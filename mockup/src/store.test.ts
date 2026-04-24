import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';

function resetStore() {
  useStore.setState(useStore.getInitialState());
}

describe('store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('assignTeamToTask', () => {
    it('sets task to inProgress and team to inTask', () => {
      const { assignTeamToTask } = useStore.getState();
      assignTeamToTask('tk2', 't2');
      const state = useStore.getState();
      const task = state.tasks.find((t) => t.id === 'tk2')!;
      const team = state.teams.find((t) => t.id === 't2')!;
      expect(task.status).toBe('inProgress');
      expect(task.assignedTeamId).toBe('t2');
      expect(team.status).toBe('inTask');
    });
  });

  describe('markTaskComplete', () => {
    it('completes task and sets team to idle', () => {
      const { markTaskComplete } = useStore.getState();
      markTaskComplete('tk1');
      const state = useStore.getState();
      const task = state.tasks.find((t) => t.id === 'tk1')!;
      const team = state.teams.find((t) => t.id === 't1')!;
      expect(task.status).toBe('completed');
      expect(task.assignedTeamId).toBeNull();
      expect(team.status).toBe('idle');
    });

    it('does nothing for non-inProgress tasks', () => {
      const { markTaskComplete } = useStore.getState();
      markTaskComplete('tk2');
      const task = useStore.getState().tasks.find((t) => t.id === 'tk2')!;
      expect(task.status).toBe('unassigned');
    });
  });

  describe('revokeTaskFromTeam', () => {
    it('returns task to unassigned and team to idle', () => {
      const { revokeTaskFromTeam } = useStore.getState();
      revokeTaskFromTeam('tk1');
      const state = useStore.getState();
      const task = state.tasks.find((t) => t.id === 'tk1')!;
      const team = state.teams.find((t) => t.id === 't1')!;
      expect(task.status).toBe('unassigned');
      expect(task.assignedTeamId).toBeNull();
      expect(team.status).toBe('idle');
    });
  });

  describe('toggleTeamResting', () => {
    it('idle team goes to resting', () => {
      const { toggleTeamResting } = useStore.getState();
      toggleTeamResting('t2');
      const team = useStore.getState().teams.find((t) => t.id === 't2')!;
      expect(team.status).toBe('resting');
    });

    it('resting team with no task goes to idle', () => {
      const { toggleTeamResting } = useStore.getState();
      toggleTeamResting('t2');
      toggleTeamResting('t2');
      const team = useStore.getState().teams.find((t) => t.id === 't2')!;
      expect(team.status).toBe('idle');
    });

    it('inTask team goes to resting, preserving task assignment', () => {
      const { toggleTeamResting } = useStore.getState();
      toggleTeamResting('t1');
      const state = useStore.getState();
      const team = state.teams.find((t) => t.id === 't1')!;
      const task = state.tasks.find((t) => t.id === 'tk1')!;
      expect(team.status).toBe('resting');
      expect(task.status).toBe('inProgress');
      expect(task.assignedTeamId).toBe('t1');
    });

    it('resting team with active task resumes to inTask', () => {
      const { toggleTeamResting } = useStore.getState();
      toggleTeamResting('t1');
      toggleTeamResting('t1');
      const team = useStore.getState().teams.find((t) => t.id === 't1')!;
      expect(team.status).toBe('inTask');
    });
  });

  describe('dissolveTeam', () => {
    it('dissolves team and unassigns its task', () => {
      const { dissolveTeam } = useStore.getState();
      dissolveTeam('t1');
      const state = useStore.getState();
      const team = state.teams.find((t) => t.id === 't1')!;
      const task = state.tasks.find((t) => t.id === 'tk1')!;
      expect(team.status).toBe('dissolved');
      expect(task.status).toBe('unassigned');
      expect(task.assignedTeamId).toBeNull();
    });

    it('removes team members on dissolve', () => {
      const { dissolveTeam } = useStore.getState();
      dissolveTeam('t1');
      const members = useStore.getState().teamMembers.filter((tm) => tm.teamId === 't1');
      expect(members).toHaveLength(0);
    });
  });

  describe('moveTaskToStatus', () => {
    it('moving to inProgress without team triggers pending assignment', () => {
      const { moveTaskToStatus } = useStore.getState();
      moveTaskToStatus('tk2', 'inProgress');
      const state = useStore.getState();
      expect(state.pendingAssignment).toEqual({ type: 'assignTeamToTask', taskId: 'tk2' });
      const task = state.tasks.find((t) => t.id === 'tk2')!;
      expect(task.status).toBe('unassigned');
    });

    it('completing inProgress task sets team to idle', () => {
      const { moveTaskToStatus } = useStore.getState();
      moveTaskToStatus('tk1', 'completed');
      const state = useStore.getState();
      const team = state.teams.find((t) => t.id === 't1')!;
      expect(team.status).toBe('idle');
    });
  });

  describe('takeControl', () => {
    it('sets controller for mission', () => {
      useStore.setState({ currentManagerUser: useStore.getState().users.find((u) => u.id === 'u6')! });
      const { takeControl } = useStore.getState();
      takeControl('m1');
      expect(useStore.getState().controllers['m1']).toBe('u6');
    });
  });

  describe('multiple missions', () => {
    it('joining a new mission keeps previous membership', () => {
      useStore.getState().loginAsRegistered('u2');
      useStore.getState().joinMission('m2');
      const state = useStore.getState();
      const m1 = state.missionParticipants.filter((mp) => mp.userId === 'u2' && mp.missionId === 'm1');
      const m2 = state.missionParticipants.filter((mp) => mp.userId === 'u2' && mp.missionId === 'm2');
      expect(m1).toHaveLength(1);
      expect(m2).toHaveLength(1);
    });

    it('leaving a mission removes participant and team membership', () => {
      useStore.getState().loginAsRegistered('u2');
      useStore.getState().leaveMission('m1');
      const state = useStore.getState();
      const mp = state.missionParticipants.filter((p) => p.userId === 'u2' && p.missionId === 'm1');
      expect(mp).toHaveLength(0);
      const tm = state.teamMembers.filter((m) => m.userId === 'u2');
      expect(tm).toHaveLength(0);
    });
  });

  describe('leaveTeam', () => {
    it('transfers leadership to longest-serving member when leader leaves', () => {
      useStore.getState().loginAsRegistered('u2');
      useStore.getState().leaveTeam();
      const state = useStore.getState();
      const newLeader = state.teamMembers.find((tm) => tm.teamId === 't1' && tm.role === 'leader');
      expect(newLeader).toBeDefined();
      expect(newLeader!.userId).toBe('u3');
    });

    it('dissolves team when last member leaves', () => {
      useStore.setState({
        teamMembers: useStore.getState().teamMembers.filter(
          (tm) => !(tm.teamId === 't2' && tm.userId === 'u9'),
        ),
      });
      useStore.getState().loginAsRegistered('u5');
      useStore.getState().leaveTeam();
      const team = useStore.getState().teams.find((t) => t.id === 't2')!;
      expect(team.status).toBe('dissolved');
    });
  });

  describe('updateMissionStatus', () => {
    it('suspending with dissolve dissolves all teams and unassigns tasks', () => {
      const { updateMissionStatus } = useStore.getState();
      updateMissionStatus('m1', 'suspended', false);
      const state = useStore.getState();
      const activeTeams = state.teams.filter((t) => t.missionId === 'm1' && t.status !== 'dissolved');
      expect(activeTeams).toHaveLength(0);
      const inProgressTasks = state.tasks.filter((t) => t.missionId === 'm1' && t.status === 'inProgress');
      expect(inProgressTasks).toHaveLength(0);
    });

    it('suspending with keep teams preserves team status', () => {
      const { updateMissionStatus } = useStore.getState();
      updateMissionStatus('m1', 'suspended', true);
      const state = useStore.getState();
      const mission = state.missions.find((m) => m.id === 'm1')!;
      expect(mission.status).toBe('suspended');
      const activeTeams = state.teams.filter((t) => t.missionId === 'm1' && t.status !== 'dissolved');
      expect(activeTeams.length).toBeGreaterThan(0);
    });
  });
});
