# CMRS Team Planner — Interactive Web Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive React web mockup of both the Searcher and Manager apps with linked state, Croatian UI, for stakeholder validation before building the real Flutter + ASP.NET system.

**Architecture:** Single-page React app with Zustand store holding all mock state. Two views (Searcher in a phone frame, Manager as desktop layout) toggle via header buttons or display side-by-side. All business rules (team-task linkage, status transitions, operations control) implemented in the store so interactions feel realistic. No backend — all data is in-memory mock.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind CSS 3, Zustand 4, @dnd-kit/core 6, qrcode.react 4, react-i18next 14, Vitest

---

## File Structure

```
mockup/
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── App.tsx
│   ├── i18n.ts
│   ├── locales/
│   │   └── hr.json
│   ├── types.ts
│   ├── store.ts
│   ├── store.test.ts
│   ├── mock-data.ts
│   └── components/
│       ├── ViewSwitcher.tsx
│       ├── PhoneFrame.tsx
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx
│       ├── searcher/
│       │   ├── SearcherApp.tsx
│       │   ├── WelcomeScreen.tsx
│       │   ├── AnonymousEntry.tsx
│       │   ├── MissionList.tsx
│       │   ├── MissionLobby.tsx
│       │   └── TeamView.tsx
│       └── manager/
│           ├── ManagerApp.tsx
│           ├── MissionListManager.tsx
│           ├── CreateMissionDialog.tsx
│           ├── MissionDashboard.tsx
│           ├── KanbanColumn.tsx
│           ├── KanbanCard.tsx
│           ├── TasksKanban.tsx
│           ├── TeamsKanban.tsx
│           ├── TeamAssignDialog.tsx
│           ├── TaskAssignDialog.tsx
│           ├── CreateTaskDialog.tsx
│           ├── ParticipantsPanel.tsx
│           └── MissionControls.tsx
```

**File responsibilities:**
- `types.ts` — All entity types matching the design spec data model
- `mock-data.ts` — Realistic Croatian seed data with missions, teams, tasks, users in various states
- `store.ts` — Zustand store with all state + actions implementing business rules (team-task linkage, status transitions, operations control)
- `store.test.ts` — Vitest tests for store business logic
- `i18n.ts` + `hr.json` — i18next config with full Croatian translations
- `App.tsx` — Root component with view switching (searcher / manager / split)
- `ViewSwitcher.tsx` — Header bar with view toggle buttons
- `PhoneFrame.tsx` — iPhone-like frame wrapper for the searcher view
- `StatusBadge.tsx` — Colored badge for team/task/mission statuses
- `ConfirmDialog.tsx` — Reusable confirmation modal
- `SearcherApp.tsx` — State machine routing through the searcher flow screens
- `ManagerApp.tsx` — State machine routing through the manager flow screens
- `KanbanColumn.tsx` + `KanbanCard.tsx` — Reusable drag-and-drop kanban primitives using @dnd-kit
- `TasksKanban.tsx` / `TeamsKanban.tsx` — The two kanban boards with spec-defined interactions
- `TeamAssignDialog.tsx` / `TaskAssignDialog.tsx` — Popups for assignment during drag transitions
- `ParticipantsPanel.tsx` — Sidebar listing mission participants with drag-to-team
- `MissionControls.tsx` — Mission lifecycle controls + operations control indicator

---

### Task 1: Project Setup

**Files:**
- Create: `mockup/package.json`
- Create: `mockup/index.html`
- Create: `mockup/vite.config.ts`
- Create: `mockup/tsconfig.json`
- Create: `mockup/tailwind.config.js`
- Create: `mockup/postcss.config.js`
- Create: `mockup/.gitignore`
- Create: `mockup/src/main.tsx`
- Create: `mockup/src/index.css`
- Create: `mockup/src/i18n.ts`
- Create: `mockup/src/locales/hr.json`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /home/daliborku/repos/cmrs_team_planner
npm create vite@latest mockup -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/daliborku/repos/cmrs_team_planner/mockup
npm install zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities qrcode.react react-i18next i18next
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Write `mockup/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hgss: {
          red: '#C41E3A',
          blue: '#1E3A5F',
          gold: '#D4A843',
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Configure Tailwind CSS entry**

Replace `mockup/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-100 text-gray-900 font-sans;
  }
}
```

- [ ] **Step 5: Configure Vitest**

Add to `mockup/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
```

Add to `mockup/tsconfig.json` under `compilerOptions`:

```json
"types": ["vitest/globals"]
```

Add test script to `mockup/package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 6: Set up i18next**

Write `mockup/src/i18n.ts`:

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hr from './locales/hr.json';

i18n.use(initReactI18next).init({
  resources: { hr: { translation: hr } },
  lng: 'hr',
  fallbackLng: 'hr',
  interpolation: { escapeValue: false },
});

export default i18n;
```

Write `mockup/src/locales/hr.json`:

```json
{
  "common": {
    "back": "Natrag",
    "cancel": "Odustani",
    "confirm": "Potvrdi",
    "save": "Spremi",
    "close": "Zatvori",
    "create": "Stvori",
    "name": "Naziv",
    "description": "Opis",
    "phone": "Telefon",
    "email": "Email"
  },
  "views": {
    "searcher": "Spašavatelj",
    "manager": "Voditelj",
    "split": "Podijeljeni prikaz"
  },
  "auth": {
    "signInHgss": "Prijava s HGSS računom",
    "continueWithout": "Nastavi bez računa",
    "nameLabel": "Ime i prezime",
    "emailLabel": "Email adresa",
    "enter": "Prijavi se"
  },
  "mission": {
    "title": "Misije",
    "active": "Aktivna",
    "suspended": "Obustavljena",
    "closed": "Zatvorena",
    "create": "Nova misija",
    "join": "Pridruži se",
    "suspend": "Obustavi",
    "resume": "Nastavi",
    "close": "Zatvori misiju",
    "qrCode": "QR kod misije",
    "keepTeams": "Zadrži timove",
    "dissolveTeams": "Raspusti timove",
    "ended": "Misija je završena"
  },
  "team": {
    "title": "Timovi",
    "create": "Novi tim",
    "join": "Pridruži se timu",
    "leave": "Napusti tim",
    "dissolve": "Raspusti tim",
    "dissolveConfirm": "Jeste li sigurni da želite raspustiti ovaj tim?",
    "leader": "Voditelj",
    "member": "Član",
    "members": "Članovi",
    "resting": "Odmor",
    "idle": "Spreman",
    "inTask": "U zadatku",
    "dissolved": "Raspušten",
    "assignTask": "Dodijeli zadatak",
    "showQr": "Prikaži QR kod",
    "shareLink": "Podijeli poveznicu",
    "selectTeam": "Odaberite tim",
    "noName": "Tim"
  },
  "task": {
    "title": "Zadaci",
    "create": "Novi zadatak",
    "draft": "Skica",
    "unassigned": "Nedodijeljeno",
    "inProgress": "U tijeku",
    "completed": "Završeno",
    "label": "Oznaka",
    "searchType": "Tip pretrage",
    "priority": "Prioritet",
    "notes": "Bilješke",
    "assignTeam": "Dodijeli tim",
    "revokeTeam": "Oduzmi tim",
    "markComplete": "Označi završenim",
    "high": "Visok",
    "medium": "Srednji",
    "low": "Nizak",
    "hasty": "Brza pretraga",
    "grid": "Sustavna pretraga",
    "roadPatrol": "Ophodnja ceste",
    "baseSupport": "Potpora baze",
    "selectTask": "Odaberite zadatak",
    "noTask": "Nema dodijeljenog zadatka"
  },
  "control": {
    "youHaveControl": "Vi imate kontrolu",
    "controller": "Kontrolor",
    "takeControl": "Preuzmi kontrolu",
    "takeControlConfirm": "Jeste li sigurni da želite preuzeti kontrolu?",
    "noController": "Nitko nema kontrolu"
  },
  "participants": {
    "title": "Sudionici",
    "unassigned": "Nedodijeljeni",
    "inTeam": "U timu",
    "addFromAd": "Dodaj iz imenika",
    "count": "{{count}} sudionika"
  },
  "searcher": {
    "scanQr": "Skeniraj QR kod",
    "openLink": "Otvori poveznicu",
    "waitingForTeam": "Čekanje na dodjelu tima",
    "scanToJoin": "Skenirajte QR kod ili otvorite poveznicu za pridruživanje misiji ili timu",
    "createTeam": "Stvori tim",
    "teamName": "Naziv tima (opcionalno)"
  }
}
```

- [ ] **Step 7: Set up main entry point**

Write `mockup/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Write a placeholder `mockup/src/App.tsx`:

```tsx
export default function App() {
  return <div className="p-8 text-center text-xl">CMRS Team Planner — Mockup</div>;
}
```

- [ ] **Step 8: Add .gitignore**

Write `mockup/.gitignore`:

```
node_modules
dist
.vite
```

- [ ] **Step 9: Verify setup compiles and runs**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm run build`
Expected: Build succeeds, `dist/` directory created

- [ ] **Step 10: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/
git commit -m "feat: scaffold mockup project with Vite, React, Tailwind, i18n, Zustand"
```

---

### Task 2: Types & Mock Data

**Files:**
- Create: `mockup/src/types.ts`
- Create: `mockup/src/mock-data.ts`

- [ ] **Step 1: Define all entity types**

Write `mockup/src/types.ts`:

```ts
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
```

- [ ] **Step 2: Create mock seed data**

Write `mockup/src/mock-data.ts`:

```ts
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
```

- [ ] **Step 3: Verify types compile**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/types.ts mockup/src/mock-data.ts
git commit -m "feat: add TypeScript types and Croatian mock data for all entities"
```

---

### Task 3: Zustand Store

**Files:**
- Create: `mockup/src/store.ts`

- [ ] **Step 1: Write the complete store with all actions**

Write `mockup/src/store.ts`:

```ts
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
  pendingAssignment: PendingAssignment | null;

  // UI actions
  setViewMode: (mode: ViewMode) => void;
  setSelectedMission: (missionId: string | null) => void;
  setPendingAssignment: (pa: PendingAssignment | null) => void;

  // Auth
  loginAsRegistered: (userId: string) => void;
  loginAsAnonymous: (name: string, email: string) => void;
  loginManagerAs: (userId: string) => void;
  logout: () => void;

  // Searcher actions
  joinMission: (missionId: string) => void;
  joinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  createTeam: (missionId: string, name?: string) => void;
  toggleTeamResting: (teamId: string) => void;
  markTaskComplete: (taskId: string) => void;

  // Manager actions
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
  dissolveTeam: (teamId: string) => void;
  moveTeamToStatus: (teamId: string, newStatus: TeamStatus) => void;
  takeControl: (missionId: string) => void;
  addParticipantToMission: (missionId: string, userId: string, role: ParticipantRole) => void;

  // Helpers
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
  pendingAssignment: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedMission: (missionId) => set({ selectedMissionId: missionId }),
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
    const filtered = missionParticipants.filter((mp) => mp.userId !== currentUser.id);
    set({
      missionParticipants: [
        ...filtered,
        { userId: currentUser.id, missionId, role: 'searcher', joinedAt: new Date().toISOString() },
      ],
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
    set((s) => {
      let teams = s.teams;
      if (newStatus === 'completed' && task.assignedTeamId) {
        teams = teams.map((t) =>
          t.id === task.assignedTeamId ? { ...t, status: 'idle' as const } : t,
        );
      }
      return {
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, assignedTeamId: newStatus === 'completed' ? null : t.assignedTeamId }
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
    set((s) => ({
      teamMembers: [
        ...filtered,
        { teamId, userId, role: hasLeader ? 'member' : 'leader', joinedAt: new Date().toISOString() },
      ],
    }));
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
    const filtered = get().missionParticipants.filter((mp) => mp.userId !== userId);
    set((s) => ({
      missionParticipants: [
        ...filtered,
        { userId, missionId, role, joinedAt: new Date().toISOString() },
      ],
    }));
  },

  getUserMission: (userId) => {
    const mp = get().missionParticipants.find((mp) => mp.userId === userId);
    return mp ? get().missions.find((m) => m.id === mp.missionId) : undefined;
  },

  getUserTeam: (userId) => {
    const tm = get().teamMembers.find((tm) => tm.userId === userId);
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
```

- [ ] **Step 2: Verify store compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/store.ts
git commit -m "feat: add Zustand store with all business logic for team-task management"
```

---

### Task 4: Store Tests

**Files:**
- Create: `mockup/src/store.test.ts`

- [ ] **Step 1: Write tests for core business rules**

Write `mockup/src/store.test.ts`:

```ts
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

  describe('one mission at a time', () => {
    it('joining a new mission removes from previous', () => {
      useStore.getState().loginAsRegistered('u2');
      useStore.getState().joinMission('m2');
      const state = useStore.getState();
      const m1 = state.missionParticipants.filter((mp) => mp.userId === 'u2' && mp.missionId === 'm1');
      const m2 = state.missionParticipants.filter((mp) => mp.userId === 'u2' && mp.missionId === 'm2');
      expect(m1).toHaveLength(0);
      expect(m2).toHaveLength(1);
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
```

- [ ] **Step 2: Run tests**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/store.test.ts
git commit -m "test: add store tests for team-task linkage, status transitions, control"
```

---

### Task 5: App Shell & Shared Components

**Files:**
- Modify: `mockup/src/App.tsx`
- Create: `mockup/src/components/ViewSwitcher.tsx`
- Create: `mockup/src/components/PhoneFrame.tsx`
- Create: `mockup/src/components/StatusBadge.tsx`
- Create: `mockup/src/components/ConfirmDialog.tsx`
- Create: `mockup/src/components/searcher/SearcherApp.tsx` (placeholder)
- Create: `mockup/src/components/manager/ManagerApp.tsx` (placeholder)

- [ ] **Step 1: Write ViewSwitcher**

Write `mockup/src/components/ViewSwitcher.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import type { ViewMode } from '../store';

export default function ViewSwitcher() {
  const { t } = useTranslation();
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);

  const modes: { key: ViewMode; label: string }[] = [
    { key: 'searcher', label: t('views.searcher') },
    { key: 'manager', label: t('views.manager') },
    { key: 'split', label: t('views.split') },
  ];

  return (
    <header className="bg-hgss-blue text-white px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold tracking-wide">HGSS Team Planner</h1>
      <div className="flex gap-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setViewMode(m.key)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === m.key
                ? 'bg-white text-hgss-blue'
                : 'bg-hgss-blue text-white border border-white/30 hover:bg-white/10'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Write PhoneFrame**

Write `mockup/src/components/PhoneFrame.tsx`:

```tsx
import type { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-4 border-gray-800 overflow-hidden relative flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-gray-800 rounded-b-xl z-10" />
      <div className="flex-1 overflow-y-auto pt-8">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Write StatusBadge**

Write `mockup/src/components/StatusBadge.tsx`:

```tsx
import { useTranslation } from 'react-i18next';

const colorMap: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-600',
  resting: 'bg-orange-100 text-orange-800',
  idle: 'bg-blue-100 text-blue-800',
  inTask: 'bg-green-100 text-green-800',
  dissolved: 'bg-gray-100 text-gray-500',
  draft: 'bg-gray-100 text-gray-600',
  unassigned: 'bg-yellow-100 text-yellow-800',
  inProgress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-600',
};

const labelMap: Record<string, string> = {
  active: 'mission.active',
  suspended: 'mission.suspended',
  closed: 'mission.closed',
  resting: 'team.resting',
  idle: 'team.idle',
  inTask: 'team.inTask',
  dissolved: 'team.dissolved',
  draft: 'task.draft',
  unassigned: 'task.unassigned',
  inProgress: 'task.inProgress',
  completed: 'task.completed',
  high: 'task.high',
  medium: 'task.medium',
  low: 'task.low',
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(labelMap[status] || status)}
    </span>
  );
}
```

- [ ] **Step 4: Write ConfirmDialog**

Write `mockup/src/components/ConfirmDialog.tsx`:

```tsx
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-hgss-red text-white rounded hover:bg-red-700">
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write placeholder SearcherApp and ManagerApp**

Write `mockup/src/components/searcher/SearcherApp.tsx`:

```tsx
export default function SearcherApp() {
  return <div className="p-4 text-center text-gray-500">Searcher App — coming next</div>;
}
```

Write `mockup/src/components/manager/ManagerApp.tsx`:

```tsx
export default function ManagerApp() {
  return <div className="p-4 text-center text-gray-500">Manager App — coming next</div>;
}
```

- [ ] **Step 6: Write App.tsx with view switching**

Write `mockup/src/App.tsx`:

```tsx
import ViewSwitcher from './components/ViewSwitcher';
import PhoneFrame from './components/PhoneFrame';
import SearcherApp from './components/searcher/SearcherApp';
import ManagerApp from './components/manager/ManagerApp';
import { useStore } from './store';

export default function App() {
  const viewMode = useStore((s) => s.viewMode);

  return (
    <div className="min-h-screen flex flex-col">
      <ViewSwitcher />
      <main className="flex-1 p-6">
        {viewMode === 'searcher' && (
          <div className="flex justify-center py-8">
            <PhoneFrame>
              <SearcherApp />
            </PhoneFrame>
          </div>
        )}
        {viewMode === 'manager' && (
          <ManagerApp />
        )}
        {viewMode === 'split' && (
          <div className="flex gap-8 items-start">
            <div className="flex-1">
              <ManagerApp />
            </div>
            <div className="flex-shrink-0">
              <PhoneFrame>
                <SearcherApp />
              </PhoneFrame>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Verify it compiles and renders**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm run build`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/
git commit -m "feat: add app shell with view switcher, phone frame, status badges, shared components"
```

---

### Task 6: Searcher Flow — All Screens

**Files:**
- Modify: `mockup/src/components/searcher/SearcherApp.tsx`
- Create: `mockup/src/components/searcher/WelcomeScreen.tsx`
- Create: `mockup/src/components/searcher/AnonymousEntry.tsx`
- Create: `mockup/src/components/searcher/MissionList.tsx`
- Create: `mockup/src/components/searcher/MissionLobby.tsx`
- Create: `mockup/src/components/searcher/TeamView.tsx`

- [ ] **Step 1: Write WelcomeScreen**

Write `mockup/src/components/searcher/WelcomeScreen.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  onAnonymous: () => void;
}

export default function WelcomeScreen({ onAnonymous }: Props) {
  const { t } = useTranslation();
  const loginAsRegistered = useStore((s) => s.loginAsRegistered);
  const users = useStore((s) => s.users.filter((u) => u.type === 'registered'));

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6">
      <div className="w-16 h-16 bg-hgss-red rounded-full flex items-center justify-center mb-4">
        <span className="text-white text-2xl font-bold">H</span>
      </div>
      <h1 className="text-xl font-bold text-hgss-blue mb-8">HGSS Team Planner</h1>

      <div className="w-full space-y-3">
        <select
          onChange={(e) => { if (e.target.value) loginAsRegistered(e.target.value); }}
          className="w-full p-3 border rounded-lg text-center bg-hgss-blue text-white font-medium"
          defaultValue=""
        >
          <option value="" disabled>{t('auth.signInHgss')}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.station})</option>
          ))}
        </select>

        <div className="text-center text-gray-400 text-sm">ili</div>

        <button
          onClick={onAnonymous}
          className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
        >
          {t('auth.continueWithout')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write AnonymousEntry**

Write `mockup/src/components/searcher/AnonymousEntry.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  onBack: () => void;
}

export default function AnonymousEntry({ onBack }: Props) {
  const { t } = useTranslation();
  const loginAsAnonymous = useStore((s) => s.loginAsAnonymous);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (name.trim() && email.trim()) {
      loginAsAnonymous(name.trim(), email.trim());
    }
  };

  return (
    <div className="p-6">
      <button onClick={onBack} className="text-hgss-blue mb-4">← {t('common.back')}</button>
      <h2 className="text-lg font-semibold mb-6">{t('auth.continueWithout')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.nameLabel')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ime i prezime"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.emailLabel')}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full p-3 border rounded-lg"
            placeholder="email@primjer.hr"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !email.trim()}
          className="w-full p-3 bg-hgss-blue text-white rounded-lg font-medium disabled:opacity-50"
        >
          {t('auth.enter')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write MissionList (searcher)**

Write `mockup/src/components/searcher/MissionList.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

export default function MissionList() {
  const { t } = useTranslation();
  const missions = useStore((s) => s.missions.filter((m) => m.status === 'active'));
  const joinMission = useStore((s) => s.joinMission);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('mission.title')}</h2>
      <div className="space-y-3">
        {missions.map((m) => (
          <div key={m.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">{m.name}</h3>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-xs text-gray-500 mb-3">{m.description}</p>
            <button
              onClick={() => joinMission(m.id)}
              className="w-full py-2 bg-hgss-blue text-white rounded text-sm font-medium"
            >
              {t('mission.join')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write MissionLobby**

Write `mockup/src/components/searcher/MissionLobby.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

export default function MissionLobby() {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const mission = useStore((s) => currentUser ? s.getUserMission(currentUser.id) : undefined);
  const teams = useStore((s) => mission ? s.teams.filter((t) => t.missionId === mission.id && t.status !== 'dissolved') : []);
  const joinTeam = useStore((s) => s.joinTeam);
  const createTeam = useStore((s) => s.createTeam);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');

  if (!mission) return null;

  const handleCreate = () => {
    createTeam(mission.id, teamName.trim() || undefined);
    setShowCreate(false);
    setTeamName('');
  };

  return (
    <div className="p-4">
      <div className="bg-hgss-blue text-white p-3 rounded-lg mb-4">
        <p className="text-xs opacity-80">{t('mission.title')}</p>
        <p className="font-semibold">{mission.name}</p>
      </div>

      <div className="text-center py-6">
        <div className="text-4xl mb-2">⏳</div>
        <p className="text-gray-500">{t('searcher.waitingForTeam')}</p>
      </div>

      <div className="space-y-2 mb-6">
        <p className="text-sm font-medium text-gray-700">{t('team.title')}</p>
        {teams.map((team) => {
          const leader = useStore.getState().getTeamLeader(team.id);
          const members = useStore.getState().getTeamMembers(team.id);
          return (
            <div key={team.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{team.name || leader?.name || t('team.noName')}</p>
                <p className="text-xs text-gray-500">{members.length} {t('team.members').toLowerCase()}</p>
              </div>
              <button
                onClick={() => joinTeam(team.id)}
                className="px-3 py-1 bg-hgss-blue text-white rounded text-xs"
              >
                {t('team.join')}
              </button>
            </div>
          );
        })}
      </div>

      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full py-3 border-2 border-dashed border-hgss-blue text-hgss-blue rounded-lg font-medium"
        >
          + {t('searcher.createTeam')}
        </button>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={t('searcher.teamName')}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border rounded text-gray-600">
              {t('common.cancel')}
            </button>
            <button onClick={handleCreate} className="flex-1 py-2 bg-hgss-blue text-white rounded">
              {t('common.create')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write TeamView**

Write `mockup/src/components/searcher/TeamView.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

export default function TeamView() {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const team = useStore((s) => currentUser ? s.getUserTeam(currentUser.id) : undefined);
  const members = useStore((s) => team ? s.getTeamMembers(team.id) : []);
  const task = useStore((s) => team ? s.getTeamTask(team.id) : undefined);
  const teamDisplayName = useStore((s) => team ? s.getTeamDisplayName(team.id) : '');
  const toggleTeamResting = useStore((s) => s.toggleTeamResting);
  const markTaskComplete = useStore((s) => s.markTaskComplete);
  const leaveTeam = useStore((s) => s.leaveTeam);
  const [showQr, setShowQr] = useState(false);

  const isLeader = currentUser && team
    ? useStore.getState().teamMembers.find(
        (tm) => tm.teamId === team.id && tm.userId === currentUser.id && tm.role === 'leader',
      )
    : null;

  if (!team) return null;

  const searchTypeLabels: Record<string, string> = {
    hasty: t('task.hasty'),
    grid: t('task.grid'),
    roadPatrol: t('task.roadPatrol'),
    baseSupport: t('task.baseSupport'),
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">{teamDisplayName}</h2>
          <StatusBadge status={team.status} />
        </div>
        <button
          onClick={() => setShowQr(!showQr)}
          className="p-2 border rounded-lg text-xs text-hgss-blue"
        >
          {t('team.showQr')}
        </button>
      </div>

      {showQr && (
        <div className="flex flex-col items-center py-4 mb-4 bg-gray-50 rounded-lg">
          <QRCodeSVG value={`cmrs://team/${team.joinCode}`} size={160} />
          <p className="text-xs text-gray-500 mt-2">{team.joinCode}</p>
        </div>
      )}

      {isLeader && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => toggleTeamResting(team.id)}
            className={`flex-1 py-2 rounded text-sm font-medium ${
              team.status === 'resting'
                ? 'bg-blue-500 text-white'
                : 'bg-orange-500 text-white'
            }`}
          >
            {team.status === 'resting'
              ? (task ? t('team.inTask') : t('team.idle'))
              : t('team.resting')}
          </button>
          {task && (
            <button
              onClick={() => markTaskComplete(task.id)}
              className="flex-1 py-2 bg-green-600 text-white rounded text-sm font-medium"
            >
              {t('task.markComplete')}
            </button>
          )}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('team.members')} ({members.length})</h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">
                  {m.name}
                  {m.role === 'leader' && (
                    <span className="ml-2 text-xs text-hgss-gold font-semibold">★ {t('team.leader')}</span>
                  )}
                </p>
                {m.station && <p className="text-xs text-gray-500">{m.station}</p>}
              </div>
              {m.phone && (
                <a href={`tel:${m.phone}`} className="text-hgss-blue text-sm">
                  {m.phone}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('task.title')}</h3>
        {task ? (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{task.label}</p>
              <StatusBadge status={task.priority} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{searchTypeLabels[task.searchType]}</p>
            {task.notes && <p className="text-sm text-gray-600 mt-2">{task.notes}</p>}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">{t('task.noTask')}</p>
        )}
      </div>

      {!isLeader && (
        <button
          onClick={leaveTeam}
          className="w-full py-2 border border-red-300 text-red-600 rounded text-sm"
        >
          {t('team.leave')}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Write SearcherApp with state machine**

Write `mockup/src/components/searcher/SearcherApp.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import WelcomeScreen from './WelcomeScreen';
import AnonymousEntry from './AnonymousEntry';
import MissionList from './MissionList';
import MissionLobby from './MissionLobby';
import TeamView from './TeamView';

export default function SearcherApp() {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const mission = useStore((s) => currentUser ? s.getUserMission(currentUser.id) : undefined);
  const team = useStore((s) => currentUser ? s.getUserTeam(currentUser.id) : undefined);
  const logout = useStore((s) => s.logout);
  const [showAnonymous, setShowAnonymous] = useState(false);

  if (!currentUser) {
    if (showAnonymous) {
      return <AnonymousEntry onBack={() => setShowAnonymous(false)} />;
    }
    return <WelcomeScreen onAnonymous={() => setShowAnonymous(true)} />;
  }

  const missionClosed = mission?.status === 'closed';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-hgss-blue text-white px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">{currentUser.name}</span>
        <button onClick={logout} className="text-xs opacity-80 hover:opacity-100">
          Odjava
        </button>
      </div>

      {missionClosed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-lg font-semibold">{t('mission.ended')}</p>
        </div>
      ) : team && team.status !== 'dissolved' ? (
        <TeamView />
      ) : mission ? (
        <MissionLobby />
      ) : currentUser.type === 'registered' ? (
        <MissionList />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-gray-500">{t('searcher.scanToJoin')}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Verify it compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm run build`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/searcher/
git commit -m "feat: add complete searcher flow - welcome, login, mission list, lobby, team view"
```

---

### Task 7: Manager — Mission List & Creation

**Files:**
- Modify: `mockup/src/components/manager/ManagerApp.tsx`
- Create: `mockup/src/components/manager/MissionListManager.tsx`
- Create: `mockup/src/components/manager/CreateMissionDialog.tsx`
- Create: `mockup/src/components/manager/MissionDashboard.tsx` (placeholder)

- [ ] **Step 1: Write CreateMissionDialog**

Write `mockup/src/components/manager/CreateMissionDialog.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  onClose: () => void;
}

export default function CreateMissionDialog({ onClose }: Props) {
  const { t } = useTranslation();
  const createMission = useStore((s) => s.createMission);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      createMission(name.trim(), description.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('mission.create')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('common.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Potraga..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Opis misije..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 bg-hgss-blue text-white rounded disabled:opacity-50"
          >
            {t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write MissionListManager**

Write `mockup/src/components/manager/MissionListManager.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';
import CreateMissionDialog from './CreateMissionDialog';

export default function MissionListManager() {
  const { t } = useTranslation();
  const missions = useStore((s) => s.missions);
  const setSelectedMission = useStore((s) => s.setSelectedMission);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? missions : missions.filter((m) => m.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('mission.title')}</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-hgss-blue text-white rounded-lg font-medium"
        >
          + {t('mission.create')}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'active', 'suspended', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f ? 'bg-hgss-blue text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f === 'all' ? 'Sve' : t(`mission.${f}`)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedMission(m.id)}
            className="bg-white rounded-lg p-4 border hover:border-hgss-blue cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{m.name}</h3>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{m.description}</p>
          </div>
        ))}
      </div>

      {showCreate && <CreateMissionDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
```

- [ ] **Step 3: Write placeholder MissionDashboard**

Write `mockup/src/components/manager/MissionDashboard.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

export default function MissionDashboard() {
  const { t } = useTranslation();
  const selectedMissionId = useStore((s) => s.selectedMissionId);
  const mission = useStore((s) => s.missions.find((m) => m.id === selectedMissionId));
  const setSelectedMission = useStore((s) => s.setSelectedMission);

  if (!mission) return null;

  return (
    <div>
      <button onClick={() => setSelectedMission(null)} className="text-hgss-blue mb-4">
        ← {t('common.back')}
      </button>
      <h2 className="text-xl font-bold">{mission.name}</h2>
      <p className="text-gray-500">Dashboard — coming next</p>
    </div>
  );
}
```

- [ ] **Step 4: Write ManagerApp with routing**

Write `mockup/src/components/manager/ManagerApp.tsx`:

```tsx
import { useStore } from '../../store';
import MissionListManager from './MissionListManager';
import MissionDashboard from './MissionDashboard';

export default function ManagerApp() {
  const selectedMissionId = useStore((s) => s.selectedMissionId);

  return selectedMissionId ? <MissionDashboard /> : <MissionListManager />;
}
```

- [ ] **Step 5: Verify it compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm run build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/manager/
git commit -m "feat: add manager mission list with creation dialog and routing"
```

---

### Task 8: Manager — Kanban Infrastructure

**Files:**
- Create: `mockup/src/components/manager/KanbanColumn.tsx`
- Create: `mockup/src/components/manager/KanbanCard.tsx`

- [ ] **Step 1: Write KanbanCard**

Write `mockup/src/components/manager/KanbanCard.tsx`:

```tsx
import { useDraggable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export default function KanbanCard({ id, disabled, children, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'shadow-lg opacity-80 z-50' : 'shadow-sm hover:shadow-md'
      } ${disabled ? 'cursor-default opacity-70' : ''}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Write KanbanColumn**

Write `mockup/src/components/manager/KanbanColumn.tsx`:

```tsx
import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  count: number;
  color: string;
  children: ReactNode;
  collapsed?: boolean;
}

export default function KanbanColumn({ id, title, count, color, children, collapsed }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  if (collapsed) {
    return (
      <div className="w-48 flex-shrink-0">
        <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${color}`}>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
        </div>
        <div ref={setNodeRef} className={`min-h-[100px] rounded-lg p-1 transition-colors ${isOver ? 'bg-blue-50' : ''}`}>
          <p className="text-xs text-gray-400 text-center py-4">{count} stavki</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${color}`}>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg p-1 transition-colors ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/manager/KanbanCard.tsx mockup/src/components/manager/KanbanColumn.tsx
git commit -m "feat: add reusable kanban card and column components with dnd-kit"
```

---

### Task 9: Manager — Tasks Kanban

**Files:**
- Create: `mockup/src/components/manager/TasksKanban.tsx`
- Create: `mockup/src/components/manager/TeamAssignDialog.tsx`
- Create: `mockup/src/components/manager/CreateTaskDialog.tsx`

- [ ] **Step 1: Write TeamAssignDialog**

Write `mockup/src/components/manager/TeamAssignDialog.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  taskId: string;
  missionId: string;
  onClose: () => void;
}

export default function TeamAssignDialog({ taskId, missionId, onClose }: Props) {
  const { t } = useTranslation();
  const teams = useStore((s) =>
    s.teams.filter((t) => t.missionId === missionId && (t.status === 'idle' || t.status === 'resting')),
  );
  const assignTeamToTask = useStore((s) => s.assignTeamToTask);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const getTeamMembers = useStore((s) => s.getTeamMembers);

  const handleSelect = (teamId: string) => {
    assignTeamToTask(taskId, teamId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('team.selectTeam')}</h3>
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nema dostupnih timova</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => {
              const members = getTeamMembers(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => handleSelect(team.id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-hgss-blue transition-colors"
                >
                  <p className="font-medium">{getTeamDisplayName(team.id)}</p>
                  <p className="text-xs text-gray-500">{members.length} {t('team.members').toLowerCase()}</p>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write CreateTaskDialog**

Write `mockup/src/components/manager/CreateTaskDialog.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import type { SearchType, TaskPriority } from '../../types';

interface Props {
  missionId: string;
  onClose: () => void;
}

export default function CreateTaskDialog({ missionId, onClose }: Props) {
  const { t } = useTranslation();
  const createTask = useStore((s) => s.createTask);
  const [label, setLabel] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('hasty');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    if (label.trim()) {
      createTask(missionId, label.trim(), searchType, priority, notes.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('task.create')}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.label')}</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full p-2 border rounded" placeholder="Sektor 5 - ..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.searchType')}</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value as SearchType)} className="w-full p-2 border rounded">
              <option value="hasty">{t('task.hasty')}</option>
              <option value="grid">{t('task.grid')}</option>
              <option value="roadPatrol">{t('task.roadPatrol')}</option>
              <option value="baseSupport">{t('task.baseSupport')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.priority')}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full p-2 border rounded">
              <option value="high">{t('task.high')}</option>
              <option value="medium">{t('task.medium')}</option>
              <option value="low">{t('task.low')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded h-20" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
          <button onClick={handleCreate} disabled={!label.trim()} className="px-4 py-2 bg-hgss-blue text-white rounded disabled:opacity-50">{t('common.create')}</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write TasksKanban**

Write `mockup/src/components/manager/TasksKanban.tsx`:

```tsx
import { useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import type { TaskStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import StatusBadge from '../StatusBadge';
import TeamAssignDialog from './TeamAssignDialog';
import CreateTaskDialog from './CreateTaskDialog';

interface Props {
  missionId: string;
}

const columns: { status: TaskStatus; color: string }[] = [
  { status: 'draft', color: 'border-gray-400' },
  { status: 'unassigned', color: 'border-yellow-400' },
  { status: 'inProgress', color: 'border-blue-400' },
  { status: 'completed', color: 'border-green-400' },
];

export default function TasksKanban({ missionId }: Props) {
  const { t } = useTranslation();
  const tasks = useStore((s) => s.tasks.filter((tk) => tk.missionId === missionId));
  const isController = useStore((s) => s.isController(missionId));
  const moveTaskToStatus = useStore((s) => s.moveTaskToStatus);
  const pendingAssignment = useStore((s) => s.pendingAssignment);
  const setPendingAssignment = useStore((s) => s.setPendingAssignment);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const [showCreate, setShowCreate] = useState(false);

  const searchTypeLabels: Record<string, string> = {
    hasty: t('task.hasty'),
    grid: t('task.grid'),
    roadPatrol: t('task.roadPatrol'),
    baseSupport: t('task.baseSupport'),
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isController) return;
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    moveTaskToStatus(taskId, newStatus);
  };

  const statusLabels: Record<string, string> = {
    draft: t('task.draft'),
    unassigned: t('task.unassigned'),
    inProgress: t('task.inProgress'),
    completed: t('task.completed'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('task.title')}</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="text-xs px-3 py-1 bg-hgss-blue text-white rounded"
        >
          + {t('task.create')}
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((tk) => tk.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                id={col.status}
                title={statusLabels[col.status]}
                count={colTasks.length}
                color={col.color}
              >
                {colTasks.map((task) => (
                  <KanbanCard key={task.id} id={task.id} disabled={!isController}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-tight">{task.label}</p>
                      <StatusBadge status={task.priority} />
                    </div>
                    <p className="text-xs text-gray-500">{searchTypeLabels[task.searchType]}</p>
                    {task.assignedTeamId && (
                      <p className="text-xs text-hgss-blue mt-1 font-medium">
                        → {getTeamDisplayName(task.assignedTeamId)}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.notes}</p>
                    )}
                  </KanbanCard>
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      {pendingAssignment?.type === 'assignTeamToTask' && pendingAssignment.taskId && (
        <TeamAssignDialog
          taskId={pendingAssignment.taskId}
          missionId={missionId}
          onClose={() => setPendingAssignment(null)}
        />
      )}

      {showCreate && (
        <CreateTaskDialog missionId={missionId} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/manager/TasksKanban.tsx mockup/src/components/manager/TeamAssignDialog.tsx mockup/src/components/manager/CreateTaskDialog.tsx
git commit -m "feat: add tasks kanban with drag-and-drop and team assignment popup"
```

---

### Task 10: Manager — Teams Kanban

**Files:**
- Create: `mockup/src/components/manager/TeamsKanban.tsx`
- Create: `mockup/src/components/manager/TaskAssignDialog.tsx`

- [ ] **Step 1: Write TaskAssignDialog**

Write `mockup/src/components/manager/TaskAssignDialog.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

interface Props {
  teamId: string;
  missionId: string;
  onClose: () => void;
}

export default function TaskAssignDialog({ teamId, missionId, onClose }: Props) {
  const { t } = useTranslation();
  const tasks = useStore((s) =>
    s.tasks.filter((t) => t.missionId === missionId && t.status === 'unassigned'),
  );
  const assignTeamToTask = useStore((s) => s.assignTeamToTask);

  const searchTypeLabels: Record<string, string> = {
    hasty: t('task.hasty'),
    grid: t('task.grid'),
    roadPatrol: t('task.roadPatrol'),
    baseSupport: t('task.baseSupport'),
  };

  const handleSelect = (taskId: string) => {
    assignTeamToTask(taskId, teamId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('task.selectTask')}</h3>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nema nedodijeljenih zadataka</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleSelect(task.id)}
                className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-hgss-blue transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{task.label}</p>
                  <StatusBadge status={task.priority} />
                </div>
                <p className="text-xs text-gray-500">{searchTypeLabels[task.searchType]}</p>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write TeamsKanban**

Write `mockup/src/components/manager/TeamsKanban.tsx`:

```tsx
import { useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import type { TeamStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import StatusBadge from '../StatusBadge';
import TaskAssignDialog from './TaskAssignDialog';
import ConfirmDialog from '../ConfirmDialog';

interface Props {
  missionId: string;
}

const columns: { status: TeamStatus; color: string }[] = [
  { status: 'resting', color: 'border-orange-400' },
  { status: 'idle', color: 'border-blue-400' },
  { status: 'inTask', color: 'border-green-400' },
  { status: 'dissolved', color: 'border-gray-400' },
];

export default function TeamsKanban({ missionId }: Props) {
  const { t } = useTranslation();
  const teams = useStore((s) => s.teams.filter((t) => t.missionId === missionId));
  const isController = useStore((s) => s.isController(missionId));
  const moveTeamToStatus = useStore((s) => s.moveTeamToStatus);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const getTeamMembers = useStore((s) => s.getTeamMembers);
  const getTeamTask = useStore((s) => s.getTeamTask);
  const [assigningTeamId, setAssigningTeamId] = useState<string | null>(null);
  const [dissolvingTeamId, setDissolvingTeamId] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isController) return;
    const { active, over } = event;
    if (!over) return;
    const teamId = active.id as string;
    const newStatus = over.id as TeamStatus;
    const team = teams.find((t) => t.id === teamId);
    if (!team || team.status === newStatus) return;

    if (newStatus === 'dissolved') {
      setDissolvingTeamId(teamId);
      return;
    }

    if (newStatus === 'inTask') return;

    moveTeamToStatus(teamId, newStatus);
  };

  const statusLabels: Record<string, string> = {
    resting: t('team.resting'),
    idle: t('team.idle'),
    inTask: t('team.inTask'),
    dissolved: t('team.dissolved'),
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{t('team.title')}</h3>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTeams = teams.filter((t) => t.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                id={col.status}
                title={statusLabels[col.status]}
                count={colTeams.length}
                color={col.color}
                collapsed={col.status === 'dissolved'}
              >
                {colTeams.map((team) => {
                  const members = getTeamMembers(team.id);
                  const task = getTeamTask(team.id);
                  return (
                    <KanbanCard key={team.id} id={team.id} disabled={!isController || team.status === 'dissolved'}>
                      <p className="text-sm font-medium mb-1">{getTeamDisplayName(team.id)}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {members.length} {t('team.members').toLowerCase()}
                        {members.length > 0 && ` — ${members.map((m) => m.name.split(' ')[0]).join(', ')}`}
                      </p>
                      {task && (
                        <div className="text-xs bg-blue-50 text-blue-700 p-1.5 rounded mb-2">
                          → {task.label}
                        </div>
                      )}
                      {isController && (team.status === 'idle' || team.status === 'resting') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setAssigningTeamId(team.id); }}
                          className="text-xs text-hgss-blue hover:underline"
                        >
                          {t('team.assignTask')}
                        </button>
                      )}
                    </KanbanCard>
                  );
                })}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      {assigningTeamId && (
        <TaskAssignDialog
          teamId={assigningTeamId}
          missionId={missionId}
          onClose={() => setAssigningTeamId(null)}
        />
      )}

      {dissolvingTeamId && (
        <ConfirmDialog
          title={t('team.dissolve')}
          message={t('team.dissolveConfirm')}
          onConfirm={() => {
            moveTeamToStatus(dissolvingTeamId, 'dissolved');
            setDissolvingTeamId(null);
          }}
          onCancel={() => setDissolvingTeamId(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/manager/TeamsKanban.tsx mockup/src/components/manager/TaskAssignDialog.tsx
git commit -m "feat: add teams kanban with task assignment, dissolve confirmation, drag-and-drop"
```

---

### Task 11: Manager — Participants Panel & Mission Controls

**Files:**
- Create: `mockup/src/components/manager/ParticipantsPanel.tsx`
- Create: `mockup/src/components/manager/MissionControls.tsx`

- [ ] **Step 1: Write ParticipantsPanel**

Write `mockup/src/components/manager/ParticipantsPanel.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

interface Props {
  missionId: string;
}

export default function ParticipantsPanel({ missionId }: Props) {
  const { t } = useTranslation();
  const participants = useStore((s) => s.getMissionParticipants(missionId));
  const unassigned = useStore((s) => s.getUnassignedParticipants(missionId));
  const teamMembers = useStore((s) => s.teamMembers);
  const teams = useStore((s) => s.teams.filter((t) => t.missionId === missionId && t.status !== 'dissolved'));
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const assignParticipantToTeam = useStore((s) => s.assignParticipantToTeam);
  const isController = useStore((s) => s.isController(missionId));

  const getParticipantTeam = (userId: string) => {
    const tm = teamMembers.find((m) => m.userId === userId);
    if (!tm) return null;
    const team = teams.find((t) => t.id === tm.teamId);
    return team || null;
  };

  return (
    <div className="bg-white rounded-lg border p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
        {t('participants.title')} ({participants.length})
      </h3>

      {unassigned.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-yellow-700 mb-2">{t('participants.unassigned')} ({unassigned.length})</p>
          {unassigned.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                {u.station && <p className="text-xs text-gray-500">{u.station}</p>}
              </div>
              {isController && teams.length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) assignParticipantToTeam(u.id, e.target.value); }}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="" disabled>→ Tim</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{getTeamDisplayName(t.id)}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t('participants.inTeam')}</p>
        {participants
          .filter((p) => !unassigned.find((u) => u.id === p.id))
          .map((p) => {
            const team = getParticipantTeam(p.id);
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <div className="flex items-center gap-2">
                    {p.role === 'manager' && <span className="text-xs text-hgss-red font-medium">Voditelj</span>}
                    {team && <span className="text-xs text-gray-500">→ {getTeamDisplayName(team.id)}</span>}
                  </div>
                </div>
                {team && <StatusBadge status={team.status} />}
              </div>
            );
          })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write MissionControls**

Write `mockup/src/components/manager/MissionControls.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';
import ConfirmDialog from '../ConfirmDialog';

interface Props {
  missionId: string;
}

export default function MissionControls({ missionId }: Props) {
  const { t } = useTranslation();
  const mission = useStore((s) => s.missions.find((m) => m.id === missionId))!;
  const isController = useStore((s) => s.isController(missionId));
  const controllerName = useStore((s) => s.getControllerName(missionId));
  const takeControl = useStore((s) => s.takeControl);
  const updateMissionStatus = useStore((s) => s.updateMissionStatus);
  const [showQr, setShowQr] = useState(false);
  const [showTakeControl, setShowTakeControl] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">{mission.name}</h2>
          <StatusBadge status={mission.status} />
        </div>
        <button
          onClick={() => setShowQr(!showQr)}
          className="px-3 py-1 border rounded text-sm text-hgss-blue"
        >
          {t('mission.qrCode')}
        </button>
      </div>

      {showQr && (
        <div className="flex flex-col items-center py-4 mb-4 bg-gray-50 rounded-lg">
          <QRCodeSVG value={`cmrs://mission/${mission.joinCode}`} size={160} />
          <p className="text-xs text-gray-500 mt-2">{mission.joinCode}</p>
        </div>
      )}

      <div className={`p-3 rounded-lg mb-4 ${isController ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        {isController ? (
          <p className="text-sm font-medium text-green-700">✓ {t('control.youHaveControl')}</p>
        ) : controllerName ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{t('control.controller')}: <strong>{controllerName}</strong></p>
            <button
              onClick={() => setShowTakeControl(true)}
              className="px-3 py-1 bg-hgss-red text-white rounded text-xs font-medium"
            >
              {t('control.takeControl')}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('control.noController')}</p>
            <button
              onClick={() => takeControl(missionId)}
              className="px-3 py-1 bg-hgss-blue text-white rounded text-xs font-medium"
            >
              {t('control.takeControl')}
            </button>
          </div>
        )}
      </div>

      {isController && mission.status === 'active' && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowSuspend(true)}
            className="flex-1 py-2 bg-yellow-500 text-white rounded text-sm font-medium"
          >
            {t('mission.suspend')}
          </button>
          <button
            onClick={() => updateMissionStatus(missionId, 'closed')}
            className="flex-1 py-2 bg-red-600 text-white rounded text-sm font-medium"
          >
            {t('mission.close')}
          </button>
        </div>
      )}

      {isController && mission.status === 'suspended' && (
        <button
          onClick={() => updateMissionStatus(missionId, 'active')}
          className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium"
        >
          {t('mission.resume')}
        </button>
      )}

      {showTakeControl && (
        <ConfirmDialog
          title={t('control.takeControl')}
          message={t('control.takeControlConfirm')}
          onConfirm={() => { takeControl(missionId); setShowTakeControl(false); }}
          onCancel={() => setShowTakeControl(false)}
        />
      )}

      {showSuspend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSuspend(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('mission.suspend')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => { updateMissionStatus(missionId, 'suspended', true); setShowSuspend(false); }}
                className="w-full p-3 border rounded-lg hover:bg-blue-50 text-left"
              >
                <p className="font-medium">{t('mission.keepTeams')}</p>
                <p className="text-xs text-gray-500">Timovi ostaju formirani za nastavak</p>
              </button>
              <button
                onClick={() => { updateMissionStatus(missionId, 'suspended', false); setShowSuspend(false); }}
                className="w-full p-3 border rounded-lg hover:bg-red-50 text-left"
              >
                <p className="font-medium text-red-600">{t('mission.dissolveTeams')}</p>
                <p className="text-xs text-gray-500">Svi timovi se raspuštaju</p>
              </button>
            </div>
            <button onClick={() => setShowSuspend(false)} className="w-full mt-4 py-2 text-gray-500">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/manager/ParticipantsPanel.tsx mockup/src/components/manager/MissionControls.tsx
git commit -m "feat: add participants panel and mission controls with lifecycle management"
```

---

### Task 12: Manager — Wire Up Mission Dashboard

**Files:**
- Modify: `mockup/src/components/manager/MissionDashboard.tsx`

- [ ] **Step 1: Replace placeholder MissionDashboard with full implementation**

Write `mockup/src/components/manager/MissionDashboard.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import MissionControls from './MissionControls';
import TasksKanban from './TasksKanban';
import TeamsKanban from './TeamsKanban';
import ParticipantsPanel from './ParticipantsPanel';

export default function MissionDashboard() {
  const { t } = useTranslation();
  const selectedMissionId = useStore((s) => s.selectedMissionId);
  const mission = useStore((s) => s.missions.find((m) => m.id === selectedMissionId));
  const setSelectedMission = useStore((s) => s.setSelectedMission);

  if (!mission || !selectedMissionId) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setSelectedMission(null)}
          className="text-hgss-blue hover:underline text-sm"
        >
          ← {t('common.back')}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-6">
          <MissionControls missionId={selectedMissionId} />
          <TasksKanban missionId={selectedMissionId} />
          <TeamsKanban missionId={selectedMissionId} />
        </div>
        <div className="w-72 flex-shrink-0">
          <ParticipantsPanel missionId={selectedMissionId} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify full app compiles**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run all tests**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add mockup/src/components/manager/MissionDashboard.tsx
git commit -m "feat: wire up mission dashboard with kanban boards, participants, controls"
```

---

### Task 13: Final Polish & Verification

**Files:**
- Possibly modify various files for fixes discovered during manual testing

- [ ] **Step 1: Start dev server and verify in browser**

Run: `cd /home/daliborku/repos/cmrs_team_planner/mockup && npm run dev`

Open http://localhost:5173 in browser. Verify:

1. **Split view** loads with manager dashboard on left, searcher phone frame on right
2. **View switcher** toggles between Searcher / Manager / Split views
3. **Manager — Mission list**: shows 2 missions, filter buttons work, "Nova misija" creates a mission
4. **Manager — Dashboard**: clicking a mission opens the dashboard with two kanban boards and participants panel
5. **Manager — Tasks kanban**: drag task from Draft to Unassigned works, dragging to In Progress shows team selection popup
6. **Manager — Teams kanban**: drag between Resting/Idle works, "Dodijeli zadatak" button shows task popup, dragging to Dissolved shows confirmation
7. **Manager — Control**: "Vi imate kontrolu" indicator shows, take control dialog works
8. **Manager — Participants**: unassigned participants shown with team dropdown, assigned participants show their team
9. **Manager — Mission controls**: suspend with keep/dissolve options, QR code display
10. **Searcher — Welcome**: HGSS login dropdown and anonymous entry both work
11. **Searcher — Mission list**: shows active missions, join button works
12. **Searcher — Lobby**: shows team list, create team button works
13. **Searcher — Team view**: members with phones shown, QR code, team leader actions (rest/complete)
14. **Linked state**: in split view, manager assigning a team to a task updates the searcher view
15. **Croatian UI**: all strings display in Croatian

- [ ] **Step 2: Fix any issues found during manual testing**

Address any compilation errors, layout issues, or interaction bugs found in step 1.

- [ ] **Step 3: Add .superpowers to .gitignore**

Append to `mockup/.gitignore`:

```
.superpowers
```

- [ ] **Step 4: Final commit**

```bash
cd /home/daliborku/repos/cmrs_team_planner
git add -A
git commit -m "feat: complete interactive mockup with linked searcher and manager views"
```

---

## Verification

After all tasks are complete, verify the full mockup end-to-end:

1. `cd mockup && npm install && npm test` — all store tests pass
2. `npm run build` — production build succeeds
3. `npm run dev` — open http://localhost:5173 in browser
4. Walk through the full stakeholder demo flow:
   - Manager creates a mission → QR code appears
   - Manager creates teams, assigns participants
   - Manager creates tasks, drags them through the kanban
   - Assign a task to a team → team moves to "U zadatku"
   - Switch to searcher view → see the team with assigned task
   - Team leader marks task complete → both boards update
   - Suspend mission with dissolve → all teams dissolved
5. Verify Croatian language is consistent throughout
6. Verify split view shows linked state changes in real-time
