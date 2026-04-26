import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

interface Props {
  missionId: string;
}

export default function TeamView({ missionId }: Props) {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const allTeamMembers = useStore((s) => s.teamMembers);
  const allTeams = useStore((s) => s.teams);
  const allTasks = useStore((s) => s.tasks);
  const users = useStore((s) => s.users);
  const toggleTeamResting = useStore((s) => s.toggleTeamResting);
  const markTaskComplete = useStore((s) => s.markTaskComplete);
  const leaveTeam = useStore((s) => s.leaveTeam);

  const allPeriods = useStore((s) => s.periods);
  const missionPeriodIds = allPeriods.filter((p) => p.missionId === missionId).map((p) => p.id);
  const tm = currentUser ? allTeamMembers.find((m) => {
    const team = allTeams.find((te) => te.id === m.teamId);
    return m.userId === currentUser.id && m.active && team && missionPeriodIds.includes(team.periodId);
  }) : undefined;
  const team = tm ? allTeams.find((te) => te.id === tm.teamId) : undefined;
  const members = team
    ? allTeamMembers.filter((m) => m.teamId === team.id && m.active).map((m) => ({ ...users.find((u) => u.id === m.userId)!, role: m.role }))
    : [];
  const teamTasks = team ? allTasks.filter((tk) => tk.assignedTeamId === team.id && tk.status === 'inProgress') : [];
  const task = teamTasks[0];
  const leader = team ? allTeamMembers.find((m) => m.teamId === team.id && m.role === 'leader') : undefined;
  const teamDisplayName = team ? (team.name || (leader ? users.find((u) => u.id === leader.userId)?.name : 'Tim') || 'Tim') : '';
  const [showQr, setShowQr] = useState(false);

  if (!team || !currentUser) return null;

  const isLeader = allTeamMembers.find(
    (m) => m.teamId === team.id && m.userId === currentUser.id && m.role === 'leader',
  );

  const searchTypeLabels: Record<string, string> = {
    hasty: t('task.hasty'),
    grid: t('task.grid'),
    roadPatrol: t('task.roadPatrol'),
    baseSupport: t('task.baseSupport'),
  };

  const taskTypeLabels: Record<string, string> = {
    ground: t('task.ground'),
    k9: t('task.k9'),
    uav: t('task.uav'),
    police: t('task.police'),
  };

  const taskTypeBadgeColors: Record<string, string> = {
    ground: 'bg-green-100 text-green-700',
    k9: 'bg-orange-100 text-orange-700',
    uav: 'bg-purple-100 text-purple-700',
    police: 'bg-blue-100 text-blue-700',
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
        </div>
      )}

      <div className="mb-4">
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

      <div className="flex gap-2 mb-6">
        {isLeader && (
          <button
            onClick={() => { if (confirm(t('team.dissolveConfirm'))) { useStore.getState().dissolveTeam(team.id); } }}
            className="flex-1 py-2 border border-red-300 text-red-600 rounded text-sm"
          >
            {t('team.dissolve')}
          </button>
        )}
        <button
          onClick={leaveTeam}
          className="flex-1 py-2 border border-gray-300 text-gray-600 rounded text-sm"
        >
          {t('team.leave')}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('task.title')}</h3>
        {teamTasks.length > 0 ? (
          <div className="space-y-3">
            {teamTasks.map((tk) => (
              <div key={tk.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{tk.label}</p>
                  <StatusBadge status={tk.priority} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${taskTypeBadgeColors[tk.taskType]}`}>
                    {taskTypeLabels[tk.taskType]}
                  </span>
                  <p className="text-xs text-gray-500">{searchTypeLabels[tk.searchType]}</p>
                </div>
                {tk.notes && <p className="text-sm text-gray-600 mt-2">{tk.notes}</p>}
                {isLeader && (
                  <button
                    onClick={() => markTaskComplete(tk.id)}
                    className="w-full mt-3 py-2 bg-green-600 text-white rounded text-sm font-medium"
                  >
                    {t('task.markComplete')}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">{t('task.noTask')}</p>
        )}
      </div>
    </div>
  );
}
