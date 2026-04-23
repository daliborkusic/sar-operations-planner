import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

export default function TeamView() {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const allTeamMembers = useStore((s) => s.teamMembers);
  const allTeams = useStore((s) => s.teams);
  const allTasks = useStore((s) => s.tasks);
  const users = useStore((s) => s.users);
  const toggleTeamResting = useStore((s) => s.toggleTeamResting);
  const markTaskComplete = useStore((s) => s.markTaskComplete);
  const leaveTeam = useStore((s) => s.leaveTeam);

  const tm = currentUser ? allTeamMembers.find((m) => m.userId === currentUser.id) : undefined;
  const team = tm ? allTeams.find((te) => te.id === tm.teamId) : undefined;
  const members = team
    ? allTeamMembers.filter((m) => m.teamId === team.id).map((m) => ({ ...users.find((u) => u.id === m.userId)!, role: m.role }))
    : [];
  const task = team ? allTasks.find((tk) => tk.assignedTeamId === team.id && tk.status === 'inProgress') : undefined;
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
                    <span className="ml-2 text-xs text-hgss-gold font-semibold">&starf; {t('team.leader')}</span>
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
