import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  missionId: string;
  periodId?: string;
}

export default function MissionLobby({ missionId, periodId }: Props) {
  const { t } = useTranslation();
  const missions = useStore((s) => s.missions);
  const allTeams = useStore((s) => s.teams);
  const allTeamMembers = useStore((s) => s.teamMembers);
  const users = useStore((s) => s.users);
  const joinTeam = useStore((s) => s.joinTeam);
  const createTeam = useStore((s) => s.createTeam);
  const joinByLink = useStore((s) => s.joinByLink);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [pasteLink, setPasteLink] = useState('');
  const [linkError, setLinkError] = useState(false);

  const allPeriods = useStore((s) => s.periods);
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return null;

  // If periodId prop provided, show only that period's teams; else all mission periods
  const activePeriodId = periodId;
  const missionPeriodIds = allPeriods.filter((p) => p.missionId === missionId).map((p) => p.id);
  const teams = allTeams.filter((te) =>
    activePeriodId ? te.periodId === activePeriodId : missionPeriodIds.includes(te.periodId),
  ).filter((te) => te.status !== 'dissolved');

  // Use the provided periodId or fall back to first unlocked period
  const effectivePeriod = activePeriodId
    ? allPeriods.find((p) => p.id === activePeriodId)
    : (allPeriods.find((p) => p.missionId === missionId && !p.locked) ?? allPeriods.find((p) => p.missionId === missionId));

  const handleCreate = () => {
    if (!effectivePeriod) return;
    createTeam(effectivePeriod.id, teamName.trim() || undefined);
    setShowCreate(false);
    setTeamName('');
  };

  const handlePasteLink = () => {
    const result = joinByLink(pasteLink.trim());
    if (!result) {
      setLinkError(true);
      setTimeout(() => setLinkError(false), 3000);
    } else {
      setPasteLink('');
      setLinkError(false);
    }
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
          const leaderMember = allTeamMembers.find((m) => m.teamId === team.id && m.role === 'leader');
          const leader = leaderMember ? users.find((u) => u.id === leaderMember.userId) : undefined;
          const memberCount = allTeamMembers.filter((m) => m.teamId === team.id).length;
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

      <div className="mt-4 border-t pt-4">
        <p className="text-xs text-gray-500 mb-2">{t('searcher.pasteLink')}</p>
        <div className="flex gap-2">
          <input
            value={pasteLink}
            onChange={(e) => { setPasteLink(e.target.value); setLinkError(false); }}
            placeholder={t('searcher.pasteLinkPlaceholder')}
            className={`flex-1 p-2 border rounded text-sm ${linkError ? 'border-red-400' : ''}`}
          />
          <button
            onClick={handlePasteLink}
            className="px-3 py-2 bg-hgss-blue text-white rounded text-sm"
          >
            {t('team.join')}
          </button>
        </div>
        {linkError && <p className="text-xs text-red-500 mt-1">{t('searcher.invalidLink')}</p>}
      </div>
    </div>
  );
}
