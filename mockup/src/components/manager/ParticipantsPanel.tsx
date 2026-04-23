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
  const currentManagerUserId = useStore((s) => s.currentManagerUser?.id);
  const controllerId = useStore((s) => s.controllers[missionId]);
  const isController = !!currentManagerUserId && controllerId === currentManagerUserId;

  const participants = missionParticipants
    .filter((mp) => mp.missionId === missionId)
    .map((mp) => ({ ...users.find((u) => u.id === mp.userId)!, role: mp.role }));

  const assignedUserIds = teamMembers
    .filter((tm) => teams.some((te) => te.id === tm.teamId))
    .map((tm) => tm.userId);
  const unassigned = participants.filter((p) => !assignedUserIds.includes(p.id));

  const getParticipantTeam = (userId: string) => {
    const tm = teamMembers.find((m) => m.userId === userId);
    if (!tm) return null;
    return teams.find((te) => te.id === tm.teamId) || null;
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
                  <option value="" disabled>&rarr; Tim</option>
                  {teams.map((te) => (
                    <option key={te.id} value={te.id}>{getTeamDisplayName(te.id)}</option>
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
                    {team && <span className="text-xs text-gray-500">&rarr; {getTeamDisplayName(team.id)}</span>}
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
