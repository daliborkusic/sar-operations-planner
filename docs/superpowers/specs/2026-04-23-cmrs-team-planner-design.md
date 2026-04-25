# CMRS Team Planner — System Design Spec

A field tool for the Croatian Mountain Rescue Service (HGSS) that simplifies forming search teams and coordinating tasks during search and rescue missions.

> **Note:** "Mission" is referred to as "Akcija" in the Croatian UI throughout the app.

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
- Station: inherited from the creating user's station attribute
- Join code (for QR and deep links)
- Created date, created by
- On suspend → resume: manager chooses to keep or dissolve teams
- Can be permanently deleted (with confirmation) when Suspended or Closed

### User

- Two types in one table:
  - **Registered**: Entra ID object ID, email, name, phone, AD attributes (station/unit, rank, qualifications — synced via Graph API on mission join, cached)
  - **Anonymous**: name, email only (no auth link)
- A user can be a member of multiple missions simultaneously

### MissionParticipant

- User ID, Mission ID
- Role: Searcher / Manager
- Joined at timestamp

### Team

- ID, Mission ID
- Name: optional — defaults to team leader's display name. Manager can rename teams at any time.
- Status: Resting / Idle / In Task / Dissolved
- Created by
- Join code (for QR and deep links)
- Dissolved teams remain with Dissolved status for historical record. Once dissolved, a team cannot be reinstated.
- Manager can create empty teams (first participant assigned becomes team leader)

### TeamMember

- Team ID, User ID
- Role: Leader / Member
- Exactly one Leader per team (enforced by app logic)
- Joined at timestamp
- If the leader leaves the team: leadership transfers to the longest-serving remaining member. If no members remain, team is dissolved.
- Any team member (including the leader) can voluntarily leave a team (returns to Mission Lobby as unassigned)
- Team leader can dissolve their own team
- When a participant is removed from a mission, they are removed from active teams but remain in dissolved teams for historical record

### Task

- ID, Mission ID
- Label: sector number or free-text description
- Search type: enum (Hasty, Grid, Road Patrol, etc. — extensible)
- Priority: High / Medium / Low
- Notes: free text
- Status: Draft ("U pripremi") / Unassigned / In Progress / Completed
- Assigned team: nullable FK to Team
- Tasks are editable after creation (label, search type, priority, notes)

### Entity Relationships

```
Mission 1──* Team 1──* TeamMember *──1 User
Mission 1──* Task *──1 Team (nullable)
Mission 1──* MissionParticipant *──1 User
```

## Operations Control Model

One manager holds "operations control" of a mission at a time. Protocol-based, not enforcement-heavy.

**Controller can**: assign teams to tasks, change task status, change team status, manage mission lifecycle, dissolve teams, rename teams, delete missions, all CRUD operations.

**Non-controlling managers can**: view everything in real-time, add notes to tasks, create tasks in Draft status.

**Takeover**: any registered SAR manager can take control via a confirmation dialog. No approval from current controller needed. No auto-release on inactivity.

**Access**: only registered HGSS users (Entra ID) can access the manager app. Future: AD attribute to restrict to SAR manager role.

**Offline edge case**: if offline controller's queued changes conflict with new controller's changes, show them on reconnect for manual review/discard.

## Team Status Transitions

| Transition | Manager (controller) | Team Leader (searcher app) |
|------------|---------------------|---------------------------|
| Idle → Resting | Drag on kanban | Toggle in app |
| Resting → Idle | Drag on kanban | Toggle in app |
| Idle → In Task | Via task assignment (drag to column shows popup) | — |
| In Task → Resting | Drag on kanban | Toggle in app (pauses task) |
| Resting → In Task | Drag on kanban (resumes if has task, popup if not) | Toggle in app (resumes task) |
| In Task → Idle | Task completed or revoked | Mark task as Completed ("Zadatak izvršen") |
| Any (except Dissolved) → Dissolved | Drag on kanban (confirmation dialog) | Dissolve button in app |
| Dissolved → Any | **Not allowed** — dissolved is permanent | — |

**Resting while In Task** preserves the task assignment — the team is taking a break. The task stays In Progress. Resuming returns the team to In Task with the same assignment.

**Task revocation**: manager unassigns a team from an In Progress task. Task returns to Unassigned, team goes to Idle. Also triggered when dragging a task backward from In Progress to Unassigned or Draft.

**Moving task backward** (In Progress → Unassigned or Draft): releases the assigned team to Idle and clears the team assignment.

## Searcher App Flow

### 1. Welcome Screen

Two paths:
- "Sign in with HGSS account" (Entra ID / Office 365)
- "Continue without account" (enter name + email)

### 2. Post-Login Routing

- **Registered user pre-assigned to a team** → straight to Team View (already in mission + team)
- **Registered user pre-assigned to a mission (no team)** → Mission Lobby
- **Registered user with no assignment** → My Missions list (if any) + Active Missions List
- **Anonymous user** → message: "Scan a QR code or open a link to join a mission or team"

### 3. My Missions + Active Missions List

- "My Missions" section at top: missions the user has already joined (tap to view)
- Active Missions List below (registered users only): all active missions they haven't joined yet
- Tap to join — user can be in multiple missions simultaneously
- Scan QR / open link option also available
- Missions the user has already joined do not appear in the join list

### 4. Mission Lobby (in mission, no team yet)

- "Waiting for team assignment" message
- Scan team QR / open team link to join a team
- "Create a team" button → user becomes team leader, can display QR and share link
- "Leave mission" option available
- "Back to mission list" navigation

### 5. Team View (main screen)

Layout order (top to bottom):
1. Team name (or leader's name if unnamed) + status badge
2. QR code display button
3. Team leader status toggle (Resting ↔ Idle/In Task)
4. Team members list with names and phone numbers (tap to call), leader indicated
5. Dissolve team button (leader only) + Leave team button (all members)
6. Current task details (label, search type, priority, notes) with "Zadatak izvršen" button (leader only) — or "No task assigned"
- All updates in real-time via SignalR

### 6. Team Leader Actions (in searcher app)

- Create team and generate QR/link
- Display/share team QR and link
- Toggle team status: Resting ↔ Idle, Resting ↔ In Task (resume)
- Mark assigned task as Completed ("Zadatak izvršen") → team auto-transitions to Idle
- Dissolve own team (with confirmation)
- Leave team (leadership transfers)

### 7. Mission Ended

- Summary screen when manager closes mission
- "Back to mission list" button to navigate away

### 8. Leave Mission

- Searcher can leave a mission at any time
- Leaving removes them from active teams (leadership transfers, empty teams dissolve)
- Members remain in dissolved teams for historical record
- Manager can also remove a participant from a mission (same behavior)

### QR / Deep Link Handling

- Mission QR/link → joins mission
- Team QR/link → joins team + mission in one step
- Deep link scheme: `cmrs://mission/{code}` and `cmrs://team/{code}`

## Manager App Flow

### 1. Login

Entra ID only. No anonymous access.

### 2. Mission List (home screen)

- All missions grouped by station name in a collapsible tree structure
- Station inherited from the creating user's station attribute
- Filter buttons: All, Active, Suspended, Closed
- "Create Mission" → name, description → generates mission QR + deep link
- Tap mission to open

### 3. Mission Dashboard

Two kanban boards. Side-by-side on desktop, tabbed on mobile.

**Tasks Kanban — columns: U pripremi | Unassigned | In Progress | Completed**

- Cards show: label, search type, priority badge, assigned team, notes preview, edit link
- Controller drag-and-drop:
  - Draft → Unassigned: direct drag
  - Unassigned → In Progress: drag → popup to select an Idle/Resting team. Assigns team, sets team to In Task.
  - In Progress → Completed: drag. Assigned team auto-transitions to Idle.
  - In Progress → Unassigned/Draft: drag. Releases assigned team to Idle.
- Tap edit link on card to edit task details (label, search type, priority, notes)
- Non-controllers: add cards to Draft only, add notes
- Kanban columns expand to fill available screen width

**Teams Kanban — columns: Resting | Idle | In Task | Dissolved**

- Cards show: team name/leader name, member count, member names, assigned task (if In Task), rename link, assign task link
- Controller actions:
  - Drag between Resting ↔ Idle
  - Drag to In Task: if team has active task assignment → resumes; if no assignment → shows task assignment popup
  - "Assign Task" button → popup to select an Unassigned task → task moves to In Progress, team to In Task
  - "Rename" link → rename dialog
  - Drag to Dissolved → confirmation dialog
  - In Task → Idle: drag revokes task assignment
  - Dissolved teams: shown as full cards (not collapsed), cannot be dragged — permanent state
- Tap card for full team details, members with AD attributes, phones
- "+ New team" button creates empty teams (first member assigned becomes leader)

### 4. Participants Panel (sidebar on desktop, slide-out drawer on mobile)

- All mission participants: name, status (in team / unassigned), AD attributes for registered users
- Manager can assign unassigned participants to teams via dropdown
- Manager can add registered HGSS users from AD directory ("Add to mission" button) — auto-joins them to mission
- Manager can remove non-manager participants from mission (✕ button with confirmation)
- Removing a participant: removes from active teams, preserves membership in dissolved teams
- Shows anonymous users who joined via QR

### 5. Mission Controls

- Control indicator: "You have control" / "Controller: [name]" + "Take control" button
- Mission QR code display / share link
- Suspend mission (option: keep teams or dissolve) — with confirmation
- Resume mission
- Close mission — with confirmation dialog
- Delete mission — available on Suspended/Closed missions, with confirmation. Permanently removes all mission data.

### 6. Team Creation by Manager

- Create team, optionally name it
- First member assigned becomes team leader
- Add members from participant list
- Assign a task
- Generate team QR/link

### Desktop vs Mobile Layout

- **Windows desktop / web**: side-by-side kanban boards with expanding columns, participants panel as sidebar
- **Mobile**: tabbed view — Tasks board, Teams board. Participants accessible via slide-out drawer. Same functionality, adapted layout.

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
| MissionDeleted | Manager deletes mission |
| ControlChanged | Manager takes control |
| ParticipantJoined | Searcher joins mission |
| ParticipantLeft | Searcher leaves or is removed from mission |

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

### Sub-project 0: Interactive Web Mockup — COMPLETE

React web app deployed to GitHub Pages for stakeholder validation.
Deployed at: https://daliborkusic.github.io/sar-operations-planner/

### Side-quest: Tauri Manager App

Standalone manager-only desktop app (`manager-app-tauri/`) with local SQLite persistence. Does NOT replace the main Flutter plan. Available as Windows .exe and Linux AppImage.

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
- Multi-mission support with mission list navigation
- Mission join flow (list, QR scan, deep link)
- Leave mission flow
- Team view (members, phones, task details)
- Team leader actions (create team, QR, mark complete, toggle status, dissolve, leave)
- SignalR client for real-time updates

### Sub-project 3: Manager App (Flutter)

- Shared codebase with searcher app, role-based navigation
- Mission CRUD + lifecycle + delete
- Mission list grouped by station with collapsible tree
- Two kanban boards with drag-and-drop + assignment popups + expanding columns
- Responsive: tabs on mobile, side-by-side on desktop
- Task editing (label, search type, priority, notes)
- Team rename, create empty teams
- Participants panel with AD attributes, add/remove participants
- Participants as slide-out drawer on mobile
- Operations control mechanism
- Team/task CRUD and assignment flows
- Offline support (Drift, sync queue, conflict handling)
- Platform builds: Windows desktop, mobile, web

### Build Order

0. Interactive Mockup → stakeholder validation, UX sign-off ✅
1. Backend API → after UX validated
2. Searcher App → validates API end-to-end
3. Manager App → most complex, builds on proven API + shared Flutter code

### Future: CalTopo Integration

- Import task/sector assignments from CalTopo
- Data model designed to accommodate this without rebuild
- Separate sub-project when needed
