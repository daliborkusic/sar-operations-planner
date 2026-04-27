import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  missionId: string;
}

export default function MissionLobby({ missionId }: Props) {
  const { t } = useTranslation();
  const missions = useStore((s) => s.missions);
  const allTeams = useStore((s) => s.teams);
  const allTeamMembers = useStore((s) => s.teamMembers);
  const users = useStore((s) => s.users);
  const allPeriods = useStore((s) => s.periods);
  const joinTeam = useStore((s) => s.joinTeam);
  const createTeam = useStore((s) => s.createTeam);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return null;

  // All unlocked periods for this mission
  const unlockedPeriods = allPeriods.filter((p) => p.missionId === missionId && !p.locked);

  // Teams from all unlocked periods, grouped by period
  const teamsByPeriod = unlockedPeriods
    .map((period) => ({
      period,
      teams: allTeams.filter((te) => te.periodId === period.id && te.status !== 'dissolved'),
    }))
    .filter((group) => group.teams.length > 0 || unlockedPeriods.length > 0);

  const handleOpenCreate = () => {
    // Pre-select period if only one unlocked period exists
    setSelectedPeriodId(unlockedPeriods.length === 1 ? unlockedPeriods[0].id : '');
    setTeamName('');
    setShowCreate(true);
  };

  const handleCreate = () => {
    const periodId = unlockedPeriods.length === 1 ? unlockedPeriods[0].id : selectedPeriodId;
    if (!periodId) return;
    createTeam(periodId, teamName.trim() || undefined);
    setShowCreate(false);
    setTeamName('');
    setSelectedPeriodId('');
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

      {unlockedPeriods.length === 0 ? (
        <p className="text-gray-400 text-center py-4">{t('period.noperiods')}</p>
      ) : (
        <div className="space-y-4 mb-6">
          {teamsByPeriod.map(({ period, teams }) => (
            <div key={period.id}>
              {unlockedPeriods.length > 1 && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {period.name}
                </p>
              )}
              {teams.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">{t('team.title')}: —</p>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => {
                    const leaderMember = allTeamMembers.find((m) => m.teamId === team.id && m.role === 'leader' && m.active);
                    const leader = leaderMember ? users.find((u) => u.id === leaderMember.userId) : undefined;
                    const memberCount = allTeamMembers.filter((m) => m.teamId === team.id && m.active).length;
                    return (
                      <div key={team.id} className="border rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{team.name || leader?.name || t('team.noName')}</p>
                          <p className="text-xs text-gray-500">{memberCount} {t('team.members').toLowerCase()}</p>
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
              )}
            </div>
          ))}
        </div>
      )}

      {unlockedPeriods.length > 0 && (
        !showCreate ? (
          <button
            onClick={handleOpenCreate}
            className="w-full py-3 border-2 border-dashed border-hgss-blue text-hgss-blue rounded-lg font-medium"
          >
            + {t('searcher.createTeam')}
          </button>
        ) : (
          <div className="border rounded-lg p-4 space-y-3">
            {unlockedPeriods.length > 1 && (
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">{t('period.select')}</option>
                {unlockedPeriods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
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
              <button
                onClick={handleCreate}
                disabled={unlockedPeriods.length > 1 && !selectedPeriodId}
                className="flex-1 py-2 bg-hgss-blue text-white rounded disabled:opacity-50"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
