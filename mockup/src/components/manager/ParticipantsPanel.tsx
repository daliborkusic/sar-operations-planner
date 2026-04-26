import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

interface Props {
  missionId: string;
  periodId?: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
}

export default function ParticipantsPanel({ missionId, periodId }: Props) {
  const { t } = useTranslation();
  const missionParticipants = useStore((s) => s.missionParticipants);
  const periodParticipants = useStore((s) => s.periodParticipants);
  const users = useStore((s) => s.users);
  const teamMembers = useStore((s) => s.teamMembers);
  const allTeams = useStore((s) => s.teams);
  const allPeriods = useStore((s) => s.periods);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const assignParticipantToTeam = useStore((s) => s.assignParticipantToTeam);
  const addParticipantToMission = useStore((s) => s.addParticipantToMission);
  const removeParticipantFromMission = useStore((s) => s.removeParticipantFromMission);
  const checkInUserToPeriod = useStore((s) => s.checkInUserToPeriod);
  const checkOutUserFromPeriod = useStore((s) => s.checkOutUserFromPeriod);
  const currentManagerUserId = useStore((s) => s.currentManagerUser?.id);
  const controllerId = useStore((s) => s.controllers[missionId]);
  const isController = !!currentManagerUserId && controllerId === currentManagerUserId;
  const [showAddDialog, setShowAddDialog] = useState(false);

  const missionPeriodIds = allPeriods.filter((p) => p.missionId === missionId).map((p) => p.id);

  // When a period is selected, show period-level participants; otherwise show mission participants
  const effectivePeriodId = periodId;

  // Period participants for the selected period
  const activePeriodPps = effectivePeriodId
    ? periodParticipants.filter((pp) => pp.periodId === effectivePeriodId)
    : [];

  // Teams relevant to this period / mission
  const relevantPeriodIds = effectivePeriodId ? [effectivePeriodId] : missionPeriodIds;
  const teams = allTeams.filter((te) => relevantPeriodIds.includes(te.periodId) && te.status !== 'dissolved');

  // Assigned user IDs in teams for the relevant period(s)
  const assignedUserIds = teamMembers
    .filter((tm) => tm.active && teams.some((te) => te.id === tm.teamId))
    .map((tm) => tm.userId);

  const getParticipantTeam = (userId: string) => {
    const tm = teamMembers.find((m) => m.userId === userId && m.active);
    if (!tm) return null;
    return teams.find((te) => te.id === tm.teamId) || null;
  };

  if (effectivePeriodId) {
    // Period-level view: show users who are checked in to this period
    const checkedInPps = activePeriodPps.filter((pp) => pp.checkedOutAt === null);
    const checkedOutPps = activePeriodPps.filter((pp) => pp.checkedOutAt !== null);
    const checkedInUserIds = checkedInPps.map((pp) => pp.userId);
    const unassignedUserIds = checkedInUserIds.filter((uid) => !assignedUserIds.includes(uid));

    // Users in the mission but not checked into this period (for check-in button)
    const missionUserIds = missionParticipants
      .filter((mp) => mp.missionId === missionId && mp.leftAt === null)
      .map((mp) => mp.userId);
    const notCheckedIn = missionUserIds.filter(
      (uid) => !activePeriodPps.some((pp) => pp.userId === uid && pp.checkedOutAt === null),
    );

    // All registered users not in mission (to add + check in)
    const allCheckedInAndMissionIds = new Set([
      ...missionUserIds,
      ...activePeriodPps.map((pp) => pp.userId),
    ]);
    const availableToAdd = users.filter((u) => u.type === 'registered' && !allCheckedInAndMissionIds.has(u.id));

    return (
      <div className="bg-white rounded-lg border p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {t('period.participants')} ({checkedInPps.length})
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

        {/* Unassigned checked-in users */}
        {unassignedUserIds.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-yellow-700 mb-2">
              {t('participants.unassigned')} ({unassignedUserIds.length})
            </p>
            {unassignedUserIds.map((uid) => {
              const user = users.find((u) => u.id === uid);
              const pp = checkedInPps.find((p) => p.userId === uid);
              if (!user) return null;
              const mp = missionParticipants.find((m) => m.userId === uid && m.missionId === missionId);
              return (
                <div key={uid} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{t('period.checkedInAt')}: {pp ? formatTime(pp.checkedInAt) : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isController && teams.length > 0 && (
                      <select
                        defaultValue=""
                        onChange={(e) => { if (e.target.value) assignParticipantToTeam(uid, e.target.value); }}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="" disabled>{'→'} Tim</option>
                        {teams.map((te) => (
                          <option key={te.id} value={te.id}>{getTeamDisplayName(te.id)}</option>
                        ))}
                      </select>
                    )}
                    {isController && (
                      <button
                        onClick={() => checkOutUserFromPeriod(uid, effectivePeriodId)}
                        className="text-xs text-orange-500 hover:underline ml-1"
                        title={t('period.checkOutUser')}
                      >
                        ↩
                      </button>
                    )}
                    {isController && mp?.role !== 'manager' && (
                      <button
                        onClick={() => { if (confirm(t('participants.removeConfirm'))) removeParticipantFromMission(missionId, uid); }}
                        className="text-xs text-red-500 hover:underline ml-1"
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
        )}

        {/* Assigned/in-team checked-in users */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">{t('participants.inTeam')}</p>
          {checkedInUserIds.filter((uid) => !unassignedUserIds.includes(uid)).map((uid) => {
            const user = users.find((u) => u.id === uid);
            const pp = checkedInPps.find((p) => p.userId === uid);
            if (!user) return null;
            const team = getParticipantTeam(uid);
            const mp = missionParticipants.find((m) => m.userId === uid && m.missionId === missionId);
            return (
              <div key={uid} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <div className="flex items-center gap-2">
                    {mp?.role === 'manager' && <span className="text-xs text-hgss-red font-medium">Voditelj</span>}
                    {team && <span className="text-xs text-gray-500">{'→'} {getTeamDisplayName(team.id)}</span>}
                    <span className="text-xs text-gray-400">{pp ? formatTime(pp.checkedInAt) : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {team && <StatusBadge status={team.status} />}
                  {isController && (
                    <button
                      onClick={() => checkOutUserFromPeriod(uid, effectivePeriodId)}
                      className="text-xs text-orange-500 hover:underline"
                      title={t('period.checkOutUser')}
                    >
                      ↩
                    </button>
                  )}
                  {isController && mp?.role !== 'manager' && (
                    <button
                      onClick={() => { if (confirm(t('participants.removeConfirm'))) removeParticipantFromMission(missionId, uid); }}
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
          {checkedInUserIds.filter((uid) => !unassignedUserIds.includes(uid)).length === 0 && (
            <p className="text-xs text-gray-400 py-2">{t('team.noName')}</p>
          )}
        </div>

        {/* Not checked in yet (mission members who haven't checked into this period) */}
        {isController && notCheckedIn.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 mb-2">{t('period.checkIn')} ({notCheckedIn.length})</p>
            {notCheckedIn.map((uid) => {
              const user = users.find((u) => u.id === uid);
              if (!user) return null;
              return (
                <div key={uid} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="text-sm text-gray-500">{user.name}</p>
                  <button
                    onClick={() => checkInUserToPeriod(uid, effectivePeriodId)}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                  >
                    {t('period.checkIn')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Checked out users (history) */}
        {checkedOutPps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">{t('period.checkedOut')} ({checkedOutPps.length})</p>
            {checkedOutPps.map((pp) => {
              const user = users.find((u) => u.id === pp.userId);
              if (!user) return null;
              return (
                <div key={pp.userId} className="flex items-center justify-between py-2 border-b last:border-0 opacity-50">
                  <div>
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400">
                      {t('period.checkedInAt')}: {formatTime(pp.checkedInAt)}
                      {pp.checkedOutAt && ` — ${t('period.checkedOutAt')}: ${formatTime(pp.checkedOutAt)}`}
                    </p>
                  </div>
                  {isController && (
                    <button
                      onClick={() => checkInUserToPeriod(pp.userId, effectivePeriodId)}
                      className="text-xs px-2 py-1 border border-green-600 text-green-600 rounded"
                    >
                      {t('period.checkIn')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showAddDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddDialog(false)}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">{t('participants.addToMission')}</h3>
              <div className="space-y-2">
                {availableToAdd.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      addParticipantToMission(missionId, u.id, 'searcher');
                      checkInUserToPeriod(u.id, effectivePeriodId);
                    }}
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

  // Mission-level view (no period selected): show all mission participants
  const participants = missionParticipants
    .filter((mp) => mp.missionId === missionId)
    .map((mp) => ({ ...users.find((u) => u.id === mp.userId)!, role: mp.role }));

  const missionAssignedUserIds = teamMembers
    .filter((tm) => tm.active && allTeams.some((te) => te.id === tm.teamId && missionPeriodIds.includes(te.periodId) && te.status !== 'dissolved'))
    .map((tm) => tm.userId);

  const unassigned = participants.filter((p) => !missionAssignedUserIds.includes(p.id));
  const participantIds = missionParticipants.filter((mp) => mp.missionId === missionId).map((mp) => mp.userId);
  const availableToAddMission = users.filter((u) => u.type === 'registered' && !participantIds.includes(u.id));

  const getMissionParticipantTeam = (userId: string) => {
    const tm = teamMembers.find((m) => m.userId === userId && m.active);
    if (!tm) return null;
    return allTeams.find((te) => te.id === tm.teamId && missionPeriodIds.includes(te.periodId) && te.status !== 'dissolved') || null;
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
            const team = getMissionParticipantTeam(p.id);
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
              {availableToAddMission.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { addParticipantToMission(missionId, u.id, 'searcher'); }}
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-hgss-blue transition-colors"
                >
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.station} — {u.rank}</p>
                </button>
              ))}
              {availableToAddMission.length === 0 && (
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
