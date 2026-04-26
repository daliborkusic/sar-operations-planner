import type { Mission, OperationalPeriod, User, MissionParticipant, PeriodParticipant, Team, TeamMember, Task } from './types';

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
  { id: 'm1', name: 'Potraga Medvednica - 23.04.2026.', description: 'Nestala osoba na području Medvednice, zadnji signal mobitelom u blizini Puntijarke.', status: 'active', station: 'Stanica Zagreb', joinCode: 'MED-2026-001', createdAt: '2026-04-23T06:00:00Z', createdBy: 'u1' },
  { id: 'm2', name: 'Potraga Biokovo - 20.04.2026.', description: 'Nestali planinar na Biokovu, potraga obustavljena noćas.', status: 'suspended', station: 'Stanica Zagreb', joinCode: 'BIO-2026-002', createdAt: '2026-04-20T08:00:00Z', createdBy: 'u6' },
];

export const mockPeriods: OperationalPeriod[] = [
  { id: 'p1', missionId: 'm1', name: 'Dan 1 - Jutro', locked: false },
  { id: 'p2', missionId: 'm1', name: 'Dan 1 - Poslijepodne', locked: false },
  { id: 'p3', missionId: 'm1', name: 'Noćna smjena', locked: true },
  { id: 'p4', missionId: 'm2', name: 'Period 1', locked: false },
];

export const mockMissionParticipants: MissionParticipant[] = [
  { userId: 'u1', missionId: 'm1', role: 'manager', joinedAt: '2026-04-23T06:00:00Z', leftAt: null },
  { userId: 'u6', missionId: 'm1', role: 'manager', joinedAt: '2026-04-23T06:15:00Z', leftAt: null },
  { userId: 'u2', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:30:00Z', leftAt: null },
  { userId: 'u3', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:35:00Z', leftAt: null },
  { userId: 'u4', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:40:00Z', leftAt: null },
  { userId: 'u5', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T06:45:00Z', leftAt: null },
  { userId: 'u7', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:00:00Z', leftAt: null },
  { userId: 'u8', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:10:00Z', leftAt: null },
  { userId: 'u9', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:15:00Z', leftAt: null },
  { userId: 'u10', missionId: 'm1', role: 'searcher', joinedAt: '2026-04-23T07:20:00Z', leftAt: null },
];

export const mockPeriodParticipants: PeriodParticipant[] = [
  { userId: 'u1', periodId: 'p1', checkedInAt: '2026-04-23T06:00:00Z', checkedOutAt: null },
  { userId: 'u6', periodId: 'p1', checkedInAt: '2026-04-23T06:15:00Z', checkedOutAt: null },
  { userId: 'u2', periodId: 'p1', checkedInAt: '2026-04-23T06:30:00Z', checkedOutAt: null },
  { userId: 'u3', periodId: 'p1', checkedInAt: '2026-04-23T06:35:00Z', checkedOutAt: null },
  { userId: 'u4', periodId: 'p1', checkedInAt: '2026-04-23T06:40:00Z', checkedOutAt: null },
  { userId: 'u5', periodId: 'p1', checkedInAt: '2026-04-23T06:45:00Z', checkedOutAt: null },
  { userId: 'u7', periodId: 'p1', checkedInAt: '2026-04-23T07:00:00Z', checkedOutAt: null },
  { userId: 'u8', periodId: 'p1', checkedInAt: '2026-04-23T07:10:00Z', checkedOutAt: null },
  { userId: 'u9', periodId: 'p1', checkedInAt: '2026-04-23T07:15:00Z', checkedOutAt: null },
  { userId: 'u10', periodId: 'p1', checkedInAt: '2026-04-23T07:20:00Z', checkedOutAt: null },
];

export const mockTeams: Team[] = [
  { id: 't1', periodId: 'p1', name: 'Tim Alfa', status: 'inTask', joinCode: 'T-ALFA-001', createdBy: 'u1' },
  { id: 't2', periodId: 'p1', status: 'idle', joinCode: 'T-BETA-002', createdBy: 'u1' },
  { id: 't3', periodId: 'p1', name: 'Tim Gama', status: 'resting', joinCode: 'T-GAMA-003', createdBy: 'u5' },
];

export const mockTeamMembers: TeamMember[] = [
  { teamId: 't1', userId: 'u2', role: 'leader', active: true, joinedAt: '2026-04-23T06:50:00Z' },
  { teamId: 't1', userId: 'u3', role: 'member', active: true, joinedAt: '2026-04-23T06:50:00Z' },
  { teamId: 't1', userId: 'u7', role: 'member', active: true, joinedAt: '2026-04-23T07:05:00Z' },
  { teamId: 't2', userId: 'u5', role: 'leader', active: true, joinedAt: '2026-04-23T07:00:00Z' },
  { teamId: 't2', userId: 'u9', role: 'member', active: true, joinedAt: '2026-04-23T07:20:00Z' },
  { teamId: 't3', userId: 'u4', role: 'leader', active: true, joinedAt: '2026-04-23T07:10:00Z' },
  { teamId: 't3', userId: 'u8', role: 'member', active: true, joinedAt: '2026-04-23T07:15:00Z' },
  { teamId: 't3', userId: 'u10', role: 'member', active: true, joinedAt: '2026-04-23T07:25:00Z' },
];

export const mockTasks: Task[] = [
  { id: 'tk1', periodId: 'p1', label: 'Sektor 1 - Sjeverni greben', searchType: 'grid', taskType: 'ground', priority: 'high', notes: 'Posebna pažnja na strme padine uz greben. Zadnji signal mobitela u ovom području.', status: 'inProgress', assignedTeamId: 't1', startedAt: '2026-04-23T07:30:00Z', completedAt: null },
  { id: 'tk2', periodId: 'p1', label: 'Sektor 2 - Šumski put Puntijarka', searchType: 'hasty', taskType: 'ground', priority: 'medium', notes: 'Pretražiti staze prema planinskom domu.', status: 'unassigned', assignedTeamId: null, startedAt: null, completedAt: null },
  { id: 'tk3', periodId: 'p1', label: 'Sektor 3 - Potok Bliznec', searchType: 'grid', taskType: 'k9', priority: 'medium', notes: 'Nizvodna pretraga od izvora do ceste.', status: 'draft', assignedTeamId: null, startedAt: null, completedAt: null },
  { id: 'tk4', periodId: 'p1', label: 'Ophodnja prilaznih cesta', searchType: 'roadPatrol', taskType: 'police', priority: 'low', notes: 'Obiđi sve makadamske ceste na sjevernoj strani.', status: 'draft', assignedTeamId: null, startedAt: null, completedAt: null },
  { id: 'tk5', periodId: 'p1', label: 'Sektor 4 - Područje oko Kraljičinog zdenca', searchType: 'hasty', taskType: 'ground', priority: 'high', notes: 'Brza pretraga staza i odmorišta.', status: 'completed', assignedTeamId: null, startedAt: '2026-04-23T07:00:00Z', completedAt: '2026-04-23T09:30:00Z' },
  { id: 'tk6', periodId: 'p1', label: 'Dron pretraga grebena', searchType: 'hasty', taskType: 'uav', priority: 'high', notes: 'Termalna kamera, pretraga nepristupačnih dijelova.', status: 'inProgress', assignedTeamId: 't1', startedAt: '2026-04-23T08:00:00Z', completedAt: null },
];

export const mockControllers: Record<string, string> = {
  m1: 'u1',
};
