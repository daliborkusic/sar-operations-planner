import type { Mission, User, MissionParticipant, Team, TeamMember, Task } from './types';

export const mockUsers: User[] = [
  { id: 'u1', type: 'registered', name: 'Ivan Horvat', email: 'ivan.horvat@hgss.hr', phone: '+385 91 123 4567', station: 'Stanica Zagreb', rank: 'Voditelj', qualifications: 'Alpinizam, Speleologija' },
  { id: 'u2', type: 'registered', name: 'Ana Kovačić', email: 'ana.kovacic@hgss.hr', phone: '+385 92 234 5678', station: 'Stanica Zagreb', rank: 'Spašavatelj' },
  { id: 'u3', type: 'registered', name: 'Marko Babić', email: 'marko.babic@hgss.hr', phone: '+385 91 345 6789', station: 'Stanica Samobor', rank: 'Spašavatelj', qualifications: 'Potražni pas' },
  { id: 'u4', type: 'registered', name: 'Petra Novak', email: 'petra.novak@hgss.hr', phone: '+385 98 456 7890', station: 'Stanica Zagreb', rank: 'Pripravnik' },
  { id: 'u5', type: 'registered', name: 'Luka Jurić', email: 'luka.juric@hgss.hr', phone: '+385 95 567 8901', station: 'Stanica Karlovac', rank: 'Spašavatelj' },
  { id: 'u6', type: 'registered', name: 'Maja Tomić', email: 'maja.tomic@hgss.hr', phone: '+385 91 678 9012', station: 'Stanica Zagreb', rank: 'Voditelj' },
  { id: 'u7', type: 'anonymous', name: 'Josip Perić', email: 'josip.peric@gmail.com' },
  { id: 'u8', type: 'anonymous', name: 'Ivana Šimunović', email: 'ivana.s@gmail.com' },
  { id: 'u9', type: 'registered', name: 'Tomislav Matić', email: 'tomislav.matic@hgss.hr', phone: '+385 92 789 0123', station: 'Stanica Split', rank: 'Spašavatelj' },
  { id: 'u10', type: 'registered', name: 'Katarina Vuković', email: 'katarina.vukovic@hgss.hr', phone: '+385 98 890 1234', station: 'Stanica Zagreb', rank: 'Spašavatelj' },
];

export const mockMissions: Mission[] = [
  { id: 'm1', name: 'Potraga Medvednica - 23.04.2026.', description: 'Nestala osoba na području Medvednice, zadnji signal mobitelom u blizini Puntijarke.', status: 'active', joinCode: 'MED-2026-001', createdAt: '2026-04-23T06:00:00Z', createdBy: 'u1' },
  { id: 'm2', name: 'Potraga Biokovo - 20.04.2026.', description: 'Nestali planinar na Biokovu, potraga obustavljena noćas.', status: 'suspended', joinCode: 'BIO-2026-002', createdAt: '2026-04-20T08:00:00Z', createdBy: 'u6' },
];

export const mockMissionParticipants: MissionParticipant[] = [
  { userId: 'u1', missionId: 'm1', role: 'manager', joinedAt: '2026-04-23T06:00:00Z' },
  { userId: 'u6', missionId: 'm1', role: 'manager', joinedAt: '2026-04-23T06:15:00Z' },
  { userId: 'u2', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:30:00Z' },
  { userId: 'u3', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:35:00Z' },
  { userId: 'u4', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:40:00Z' },
  { userId: 'u5', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:45:00Z' },
  { userId: 'u7', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:00:00Z' },
  { userId: 'u8', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:10:00Z' },
  { userId: 'u9', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:15:00Z' },
  { userId: 'u10', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:20:00Z' },
];

export const mockTeams: Team[] = [
  { id: 't1', missionId: 'm1', name: 'Tim Alfa', status: 'inTask', joinCode: 'T-ALFA-001', createdBy: 'u1' },
  { id: 't2', missionId: 'm1', status: 'idle', joinCode: 'T-BETA-002', createdBy: 'u1' },
  { id: 't3', missionId: 'm1', name: 'Tim Gama', status: 'resting', joinCode: 'T-GAMA-003', createdBy: 'u5' },
];

export const mockTeamMembers: TeamMember[] = [
  { teamId: 't1', userId: 'u2', role: 'leader', joinedAt: '2026-04-23T06:50:00Z' },
  { teamId: 't1', userId: 'u3', role: 'member', joinedAt: '2026-04-23T06:50:00Z' },
  { teamId: 't1', userId: 'u7', role: 'member', joinedAt: '2026-04-23T07:05:00Z' },
  { teamId: 't2', userId: 'u5', role: 'leader', joinedAt: '2026-04-23T07:00:00Z' },
  { teamId: 't2', userId: 'u9', role: 'member', joinedAt: '2026-04-23T07:20:00Z' },
  { teamId: 't3', userId: 'u4', role: 'leader', joinedAt: '2026-04-23T07:10:00Z' },
  { teamId: 't3', userId: 'u8', role: 'member', joinedAt: '2026-04-23T07:15:00Z' },
  { teamId: 't3', userId: 'u10', role: 'member', joinedAt: '2026-04-23T07:25:00Z' },
];

export const mockTasks: Task[] = [
  { id: 'tk1', missionId: 'm1', label: 'Sektor 1 - Sjeverni greben', searchType: 'grid', priority: 'high', notes: 'Posebna pažnja na strme padine uz greben. Zadnji signal mobitela u ovom području.', status: 'inProgress', assignedTeamId: 't1' },
  { id: 'tk2', missionId: 'm1', label: 'Sektor 2 - Šumski put Puntijarka', searchType: 'hasty', priority: 'medium', notes: 'Pretražiti staze prema planinskom domu.', status: 'unassigned', assignedTeamId: null },
  { id: 'tk3', missionId: 'm1', label: 'Sektor 3 - Potok Bliznec', searchType: 'grid', priority: 'medium', notes: 'Nizvodna pretraga od izvora do ceste.', status: 'draft', assignedTeamId: null },
  { id: 'tk4', missionId: 'm1', label: 'Ophodnja prilaznih cesta', searchType: 'roadPatrol', priority: 'low', notes: 'Obiđi sve makadamske ceste na sjevernoj strani.', status: 'draft', assignedTeamId: null },
  { id: 'tk5', missionId: 'm1', label: 'Sektor 4 - Područje oko Kraljičinog zdenca', searchType: 'hasty', priority: 'high', notes: 'Brza pretraga staza i odmorišta.', status: 'completed', assignedTeamId: null },
];

export const mockControllers: Record<string, string> = {
  m1: 'u1',
};
