import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

interface Props {
  missionId: string;
}

export default function ParticipantsPanel({ missionId }: Props) {
  const { t } = useTranslation();
  const missionParticipants = useStore((s) => s.missionParticipants);
  const users = useStore((s) => s.users);
  const teamMembers = useStore((s) => s.teamMembers);
  const allTeams = useStore((s) => s.teams);
  const teams = allTeams.filter((te) => te.missionId === missionId && te.status !== 'dissolved');
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const assignParticipantToTeam = useStore((s) => s.assignParticipantToTeam);
  const addParticipantToMission = useStore((s) => s.addParticipantToMission);
  const removeParticipantFromMission = useStore((s) => s.removeParticipantFromMission);
  const currentManagerUserId = useStore((s) => s.currentManagerUser?.id);
  const controllerId = useStore((s) => s.controllers[missionId]);
  const isController = !!currentManagerUserId && controllerId === currentManagerUserId;
  const [showAddDialog, setShowAddDialog] = useState(false);

  const participants = missionParticipants
    .filter((mp) => mp.missionId === missionId)
    .map((mp) => ({ ...users.find((u) => u.id === mp.userId)!, role: mp.role }));

  const assignedUserIds = teamMembers
    .filter((tm) => teams.some((te) => te.id === tm.teamId))
    .map((tm) => tm.userId);
  const unassigned = participants.filter((p) => !assignedUserIds.includes(p.id));

  const participantIds = missionParticipants.filter((mp) => mp.missionId === missionId).map((mp) => mp.userId);
  const availableToAdd = users.filter((u) => u.type === 'registered' && !participantIds.includes(u.id));

  const getParticipantTeam = (userId: string) => {
    const tm = teamMembers.find((m) => m.userId === userId);
    if (!tm) return null;
    return teams.find((te) => te.id === tm.teamId) || null;
  };

  return (
    <div className="bg-white rounded-lg border p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {t('participants.title')} ({participants.length})
        </h3>
        {isController && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="text-xs px-2 py-1 bg-hgss-blue text-white rounded"
          >
            + {t('participants.addToMission')}
          </button>
        )}
      </div>

      {unassigned.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-yellow-700 mb-2">{t('participants.unassigned')} ({unassigned.length})</p>
          {unassigned.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                {u.station && <p className="text-xs text-gray-500">{u.station}</p>}
              </div>
              <div className="flex items-center gap-1">
                {isController && teams.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) assignParticipantToTeam(u.id, e.target.value); }}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="" disabled>{'→'} Tim</option>
                    {teams.map((te) => (
                      <option key={te.id} value={te.id}>{getTeamDisplayName(te.id)}</option>
                    ))}
                  </select>
                )}
                {isController && u.role !== 'manager' && (
                  <button
                    onClick={() => { if (confirm(t('participants.removeConfirm'))) removeParticipantFromMission(missionId, u.id); }}
                    className="text-xs text-red-500 hover:underline ml-1"
                    title={t('participants.removeFromMission')}
                  >
                    ✕
                  </button>
                )}
              </div>
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
                    {team && <span className="text-xs text-gray-500">{'→'} {getTeamDisplayName(team.id)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {team && <StatusBadge status={team.status} />}
                  {isController && p.role !== 'manager' && (
                    <button
                      onClick={() => { if (confirm(t('participants.removeConfirm'))) removeParticipantFromMission(missionId, p.id); }}
                      className="text-xs text-red-500 hover:underline"
                      title={t('participants.removeFromMission')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddDialog(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('participants.addToMission')}</h3>
            <div className="space-y-2">
              {availableToAdd.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { addParticipantToMission(missionId, u.id, 'searcher'); }}
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-hgss-blue transition-colors"
                >
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.station} — {u.rank}</p>
                </button>
              ))}
              {availableToAdd.length === 0 && (
                <p className="text-gray-500 text-center py-4">Svi članovi su već dodani</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
