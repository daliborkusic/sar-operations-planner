# CMRS Team Planner — System Design Spec

A field tool for the Croatian Mountain Rescue Service (HGSS) that simplifies forming search teams and coordinating tasks during search and rescue missions.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Searcher app | Flutter (iOS + Android) |
| Manager app | Flutter (Windows desktop + iOS/Android + Web) |
| Backend API | C# / ASP.NET Core Minimal API |
| Hosting | Azure Container Apps (scale-to-zero) |
| Database | Azure SQL Serverless (auto-pause at idle) |
| Real-time | Azure SignalR Service (native .NET) |
| Auth | Microsoft Entra ID (Office 365) + anonymous token flow |
| AD sync | Microsoft Graph API |
| Localization | Croatian (primary), English (secondary), extensible via Flutter intl/ARB |

## Data Model

### Mission

- ID, name, description
- Status: Active / Suspended / Closed
- Join code (for QR and deep links)
- Created date, created by
- On suspend → resume: manager chooses to keep or dissolve teams

### User

- Two types in one table:
  - **Registered**: Entra ID object ID, email, name, phone, AD attributes (station/unit, rank, qualifications — synced via Graph API on mission join, cached)
  - **Anonymous**: name, email only (no auth link)
- A user can be a member of one mission at a time

### MissionParticipant

- User ID, Mission ID
- Role: Searcher / Manager
- Joined at timestamp

### Team

- ID, Mission ID
- Name: optional — defaults to team leader's display name
- Status: Resting / Idle / In Task / Dissolved
- Created by
- Join code (for QR and deep links)
- Dissolved teams remain with Dissolved status for historical record

### TeamMember

- Team ID, User ID
- Role: Leader / Member
- Exactly one Leader per team (enforced by app logic)
- Joined at timestamp
- If the leader leaves the team: leadership transfers to the longest-serving remaining member. If no members remain, team is dissolved.
- Any team member can voluntarily leave a team (returns to Mission Lobby as unassigned)

### Task

- ID, Mission ID
- Label: sector number or free-text description
- Search type: enum (Hasty, Grid, Road Patrol, etc. — extensible)
- Priority: High / Medium / Low
- Notes: free text
- Status: Draft / Unassigned / In Progress / Completed
- Assigned team: nullable FK to Team

### Entity Relationships

```
Mission 1──* Team 1──* TeamMember *──1 User
Mission 1──* Task *──1 Team (nullable)
Mission 1──* MissionParticipant *──1 User
```

## Operations Control Model

One manager holds "operations control" of a mission at a time. Protocol-based, not enforcement-heavy.

**Controller can**: assign teams to tasks, change task status, change team status, manage mission lifecycle, dissolve teams, all CRUD operations.

**Non-controlling managers can**: view everything in real-time, add notes to tasks, create tasks in Draft status.

**Takeover**: any registered SAR manager can take control via a confirmation dialog. No approval from current controller needed. No auto-release on inactivity.

**Access**: only registered HGSS users (Entra ID) can access the manager app. Future: AD attribute to restrict to SAR manager role.

**Offline edge case**: if offline controller's queued changes conflict with new controller's changes, show them on reconnect for manual review/discard.

## Team Status Transitions

| Transition | Manager (controller) | Team Leader (searcher app) |
|------------|---------------------|---------------------------|
| Idle → Resting | Drag on kanban | Toggle in app |
| Resting → Idle | Drag on kanban | Toggle in app |
| Idle → In Task | Via task assignment | — |
| In Task → Resting | Drag on kanban | Toggle in app (pauses task) |
| Resting → In Task | Drag on kanban (resumes task) | Toggle in app (resumes task) |
| In Task → Idle | Task completed or revoked | Mark task as Completed |
| Any → Dissolved | Drag on kanban (confirmation dialog) | — |

**Resting while In Task** preserves the task assignment — the team is taking a break. The task stays In Progress. Resuming returns the team to In Task with the same assignment.

**Task revocation**: manager unassigns a team from an In Progress task. Task returns to Unassigned, team goes to Idle.

## Searcher App Flow

### 1. Welcome Screen

Two paths:
- "Sign in with HGSS account" (Entra ID / Office 365)
- "Continue without account" (enter name + email)

### 2. Post-Login Routing

- **Registered user pre-assigned to a team** → straight to Team View (already in mission + team)
- **Registered user pre-assigned to a mission (no team)** → Mission Lobby
- **Registered user with no assignment** → Active Missions List
- **Anonymous user** → message: "Scan a QR code or open a link to join a mission or team"

### 3. Active Missions List (registered users only)

- All currently active missions across the service
- Tap to join (one mission at a time — joining a new one leaves the previous)
- Scan QR / open link option also available

### 4. Mission Lobby (in mission, no team yet)

- "Waiting for team assignment" message
- Scan team QR / open team link to join a team
- "Create a team" button → user becomes team leader, can display QR and share link

### 5. Team View (main screen)

- Team name (or leader's name if unnamed)
- Team members list with names and phone numbers (tap to call)
- Team leader indicated
- Current task details (label, search type, priority, notes) or "No task assigned"
- Team status badge (Resting / Idle / In Task)
- Options: display team QR, share team link
- All updates in real-time via SignalR

### 6. Team Leader Actions (in searcher app)

- Create team and generate QR/link
- Display/share team QR and link
- Toggle team status: Resting ↔ Idle, Resting ↔ In Task (resume)
- Mark assigned task as Completed → team auto-transitions to Idle

### 7. Mission Ended

- Summary screen when manager closes mission

### QR / Deep Link Handling

- Mission QR/link → joins mission
- Team QR/link → joins team + mission in one step
- Deep link scheme: `cmrs://mission/{code}` and `cmrs://team/{code}`

## Manager App Flow

### 1. Login

Entra ID only. No anonymous access.

### 2. Mission List (home screen)

- All missions: Active, Suspended, Closed (filterable)
- "Create Mission" → name, description → generates mission QR + deep link
- Tap mission to open

### 3. Mission Dashboard

Two kanban boards. Side-by-side on desktop, tabbed on mobile.

**Tasks Kanban — columns: Draft | Unassigned | In Progress | Completed**

- Cards show: label, search type, priority badge, assigned team, notes preview
- Controller drag-and-drop:
  - Draft → Unassigned: direct drag
  - Unassigned → In Progress: drag → popup to select an Idle team. Assigns team, sets team to In Task.
  - In Progress → Completed: drag. Assigned team auto-transitions to Idle.
- Tap card to edit details, assign/reassign/revoke team
- Non-controllers: add cards to Draft only, add notes

**Teams Kanban — columns: Resting | Idle | In Task | Dissolved**

- Cards show: team name/leader name, member count, member names, assigned task (if In Task)
- Controller actions:
  - Drag between Resting ↔ Idle
  - "Assign Task" button → popup to select an Unassigned task → task moves to In Progress, team to In Task
  - Drag to Dissolved → confirmation dialog
  - In Task → Idle happens via task completion or revocation
- Dissolved column: read-only historical teams, collapsed by default
- Tap card for full team details, members with AD attributes, phones

### 4. Participants Panel (sidebar on desktop, drawer on mobile)

- All mission participants: name, status (in team / unassigned), AD attributes for registered users
- Manager can drag unassigned participants into teams
- Manager can add registered HGSS users from AD directory (pre-assign — auto-joins them to mission and optionally a team)
- Shows anonymous users who joined via QR

### 5. Mission Controls

- Control indicator: "You have control" / "Controller: [name]" + "Take control" button
- Mission QR code display / share link
- Suspend mission (option: keep teams or dissolve)
- Resume mission
- Close mission

### 6. Team Creation by Manager

- Create team, optionally name it, assign a leader
- Add members from participant list
- Assign a task
- Generate team QR/link

### Desktop vs Mobile Layout

- **Windows desktop / web**: side-by-side kanban boards, participants panel as sidebar
- **Mobile**: tabbed view — Tasks board, Teams board, Participants. Same functionality, adapted layout.

## Architecture

### System Overview

```
Azure Cloud:
  - Entra ID (auth)
  - Azure SignalR Service (real-time push)
  - Azure Container Apps → ASP.NET Core API
    - REST endpoints (missions, teams, tasks, users)
    - SignalR hub (real-time events)
    - Microsoft Graph client (AD sync)
    - QR/deep link generation
  - Azure SQL Serverless (auto-pause at idle)

Clients:
  - Searcher App (Flutter, iOS/Android) — requires connectivity
  - Manager App (Flutter, Windows/iOS/Android/Web) — offline-capable
```

### Backend — Single Service, Three Concerns

1. **REST API**: CRUD for missions, teams, tasks, users. JWT bearer auth (Entra ID tokens) + lightweight anonymous session tokens. Versioned endpoints.

2. **SignalR Hub**: clients subscribe to mission-scoped groups. Pushes events for all state changes. Searcher apps receive, manager app sends and receives.

3. **Microsoft Graph Client**: fetches AD profile attributes on registered user mission join. Server-side only, cached in User record.

### Authentication

- **Registered users**: Entra ID / Office 365 login. Backend validates JWT tokens via Microsoft.Identity.Web.
- **Anonymous users**: submit name + email, backend issues a lightweight JWT (containing anonymous user ID and mission scope, no Entra ID claims). No Entra ID link.

### Real-time Events (SignalR)

All connected clients subscribe to a SignalR group scoped to their mission.

| Event | Triggered by |
|-------|-------------|
| TeamCreated | Manager or searcher creates team |
| TeamUpdated | Status change, name change, dissolved |
| TeamMemberJoined | Someone joins a team |
| TeamMemberLeft | Someone leaves or gets reassigned |
| TaskCreated | Manager creates task |
| TaskUpdated | Status change, assignment, priority change |
| MissionStatusChanged | Manager suspends/resumes/closes |
| ControlChanged | Manager takes control |
| ParticipantJoined | Searcher joins mission |

### Offline Support (Manager App Only)

- Local SQLite database via Drift mirrors mission state
- When offline: manager reads/writes to local DB, changes queued in sync table
- On reconnect:
  - If still in control: replay queue against API
  - If someone else took control: show queued changes for review/discard
- Receive missed events via SignalR catch-up or "sync since timestamp" REST endpoint
- Searcher app requires connectivity — no local DB

### Connection Lifecycle

- Searcher app: connects on mission join, disconnects on app close
- Manager app: connects on mission open, queues changes if offline, reconnects with exponential backoff (built into SignalR .NET client)

## Sub-project Decomposition

### Sub-project 0: Interactive Web Mockup

React web app with mock data for stakeholder validation before building the real system.

- Two views: Searcher and Manager
- Clickable, interactive — stakeholders tap through real flows
- Linked via local state if feasible (manager assigns team → searcher view updates)
- Croatian language for stakeholder review
- Deployable as static site or localhost
- Disposable — validation tool, not production code

### Sub-project 1: Backend API + Data Model

- ASP.NET Core Minimal API project
- Entity Framework Core + Azure SQL schema
- Entra ID authentication + anonymous token flow
- REST endpoints for all entities
- SignalR hub with mission-scoped groups
- Microsoft Graph integration for AD attributes
- QR code / deep link generation
- Operations control mechanism

### Sub-project 2: Searcher Mobile App (Flutter)

- Flutter project setup with localization (hr/en)
- Entra ID login + anonymous entry
- Mission join flow (list, QR scan, deep link)
- Team view (members, phones, task details)
- Team leader actions (create team, QR, mark complete, toggle status)
- SignalR client for real-time updates

### Sub-project 3: Manager App (Flutter)

- Shared codebase with searcher app, role-based navigation
- Mission CRUD + lifecycle
- Two kanban boards with drag-and-drop + assignment popups
- Participants panel with AD attributes
- Operations control mechanism
- Team/task CRUD and assignment flows
- Offline support (Drift, sync queue, conflict handling)
- Platform builds: Windows desktop, mobile, web

### Build Order

0. Interactive Mockup → stakeholder validation, UX sign-off
1. Backend API → after UX validated
2. Searcher App → validates API end-to-end
3. Manager App → most complex, builds on proven API + shared Flutter code

### Future: CalTopo Integration

- Import task/sector assignments from CalTopo
- Data model designed to accommodate this without rebuild
- Separate sub-project when needed
