use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create initial tables",
            sql: "
                CREATE TABLE IF NOT EXISTS missions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    status TEXT NOT NULL DEFAULT 'active',
                    station TEXT NOT NULL DEFAULT '',
                    join_code TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    created_by TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS operational_periods (
                    id TEXT PRIMARY KEY,
                    mission_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    locked INTEGER NOT NULL DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL DEFAULT '',
                    phone TEXT,
                    station TEXT,
                    rank TEXT,
                    qualifications TEXT
                );
                CREATE TABLE IF NOT EXISTS mission_participants (
                    user_id TEXT NOT NULL,
                    mission_id TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'searcher',
                    joined_at TEXT NOT NULL,
                    left_at TEXT,
                    PRIMARY KEY (user_id, mission_id)
                );
                CREATE TABLE IF NOT EXISTS teams (
                    id TEXT PRIMARY KEY,
                    period_id TEXT NOT NULL,
                    name TEXT,
                    status TEXT NOT NULL DEFAULT 'idle',
                    join_code TEXT NOT NULL,
                    created_by TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS team_members (
                    team_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'member',
                    active INTEGER NOT NULL DEFAULT 1,
                    joined_at TEXT NOT NULL,
                    PRIMARY KEY (team_id, user_id)
                );
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    period_id TEXT NOT NULL,
                    label TEXT NOT NULL,
                    search_type TEXT NOT NULL,
                    task_type TEXT NOT NULL DEFAULT 'ground',
                    priority TEXT NOT NULL DEFAULT 'medium',
                    notes TEXT NOT NULL DEFAULT '',
                    status TEXT NOT NULL DEFAULT 'draft',
                    assigned_team_id TEXT,
                    started_at TEXT,
                    completed_at TEXT
                );
                CREATE TABLE IF NOT EXISTS controllers (
                    mission_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL
                );
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:sar_planner.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
