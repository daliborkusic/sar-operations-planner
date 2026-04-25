export type MissionStatus = 'active' | 'suspended' | 'closed';
export type TeamStatus = 'resting' | 'idle' | 'inTask' | 'dissolved';
export type TaskStatus = 'draft' | 'unassigned' | 'inProgress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';
export type SearchType = 'hasty' | 'grid' | 'roadPatrol' | 'baseSupport';
export type ParticipantRole = 'searcher' | 'manager';
export type TeamMemberRole = 'leader' | 'member';
export type UserType = 'registered' | 'anonymous';

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  station: string;
  joinCode: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  type: UserType;
  name: string;
  email: string;
  phone?: string;
  station?: string;
  rank?: string;
  qualifications?: string;
}

export interface MissionParticipant {
  userId: string;
  missionId: string;
  role: ParticipantRole;
  joinedAt: string;
}

export interface Team {
  id: string;
  missionId: string;
  name?: string;
  status: TeamStatus;
  joinCode: string;
  createdBy: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface Task {
  id: string;
  missionId: string;
  label: string;
  searchType: SearchType;
  priority: TaskPriority;
  notes: string;
  status: TaskStatus;
  assignedTeamId: string | null;
}
