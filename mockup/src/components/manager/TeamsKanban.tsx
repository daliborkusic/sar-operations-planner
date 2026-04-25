import { useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import type { TeamStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import TaskAssignDialog from './TaskAssignDialog';
import ConfirmDialog from '../ConfirmDialog';

interface Props {
  missionId: string;
}

const columns: { status: TeamStatus; color: string }[] = [
  { status: 'resting', color: 'border-orange-400' },
  { status: 'idle', color: 'border-blue-400' },
  { status: 'inTask', color: 'border-green-400' },
  { status: 'dissolved', color: 'border-gray-400' },
];

export default function TeamsKanban({ missionId }: Props) {
  const { t } = useTranslation();
  const allTeams = useStore((s) => s.teams);
  const allTasks = useStore((s) => s.tasks);
  const teams = allTeams.filter((te) => te.missionId === missionId);
  const currentManagerUserId = useStore((s) => s.currentManagerUser?.id);
  const controllerId = useStore((s) => s.controllers[missionId]);
  const isController = !!currentManagerUserId && controllerId === currentManagerUserId;
  const moveTeamToStatus = useStore((s) => s.moveTeamToStatus);
  const revokeTaskFromTeam = useStore((s) => s.revokeTaskFromTeam);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const getTeamMembers = useStore((s) => s.getTeamMembers);
  const getTeamTask = useStore((s) => s.getTeamTask);
  const createTeamAsManager = useStore((s) => s.createTeamAsManager);
  const renameTeam = useStore((s) => s.renameTeam);
  const [assigningTeamId, setAssigningTeamId] = useState<string | null>(null);
  const [dissolvingTeamId, setDissolvingTeamId] = useState<string | null>(null);
  const [renamingTeamId, setRenamingTeamId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isController) return;
    const { active, over } = event;
    if (!over) return;
    const teamId = active.id as string;
    const newStatus = over.id as TeamStatus;
    const team = teams.find((te) => te.id === teamId);
    if (!team || team.status === newStatus || team.status === 'dissolved') return;

    if (newStatus === 'dissolved') {
      setDissolvingTeamId(teamId);
      return;
    }

    const teamTask = allTasks.find((tk) => tk.assignedTeamId === teamId && tk.status === 'inProgress');

    if (newStatus === 'inTask') {
      if (teamTask) {
        moveTeamToStatus(teamId, 'inTask');
      } else {
        setAssigningTeamId(teamId);
      }
      return;
    }

    if (newStatus === 'idle' && team.status === 'inTask' && teamTask) {
      revokeTaskFromTeam(teamTask.id);
      return;
    }

    moveTeamToStatus(teamId, newStatus);
  };

  const statusLabels: Record<string, string> = {
    resting: t('team.resting'),
    idle: t('team.idle'),
    inTask: t('team.inTask'),
    dissolved: t('team.dissolved'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('team.title')}</h3>
        {isController && (
          <button
            onClick={() => setShowCreateTeam(true)}
            className="text-xs px-3 py-1 bg-hgss-blue text-white rounded"
          >
            + {t('team.create')}
          </button>
        )}
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 pb-4">
          {columns.map((col) => {
            const colTeams = teams.filter((te) => te.status === col.status);
            return (
              <KanbanColumn key={col.status} id={col.status} title={statusLabels[col.status]} count={colTeams.length} color={col.color}>
                {colTeams.map((team) => {
                  const members = getTeamMembers(team.id);
                  const task = getTeamTask(team.id);
                  return (
                    <KanbanCard key={team.id} id={team.id} disabled={!isController || team.status === 'dissolved'}>
                      <p className="text-sm font-medium mb-1">{getTeamDisplayName(team.id)}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {members.length} {t('team.members').toLowerCase()}
                        {members.length > 0 && ` — ${members.map((m) => m.name.split(' ')[0]).join(', ')}`}
                      </p>
                      {task && (
                        <div className="text-xs bg-blue-50 text-blue-700 p-1.5 rounded mb-2">
                          {'→'} {task.label}
                        </div>
                      )}
                      {isController && (
                        <div className="flex gap-3">
                          {(team.status === 'idle' || team.status === 'resting') && (
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setAssigningTeamId(team.id); }}
                              className="text-xs text-hgss-blue hover:underline"
                            >
                              {t('team.assignTask')}
                            </button>
                          )}
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setRenamingTeamId(team.id); setRenameValue(team.name || ''); }}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            {t('team.rename')}
                          </button>
                        </div>
                      )}
                    </KanbanCard>
                  );
                })}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      {assigningTeamId && (
        <TaskAssignDialog teamId={assigningTeamId} missionId={missionId} onClose={() => setAssigningTeamId(null)} />
      )}

      {dissolvingTeamId && (
        <ConfirmDialog
          title={t('team.dissolve')}
          message={t('team.dissolveConfirm')}
          onConfirm={() => { moveTeamToStatus(dissolvingTeamId, 'dissolved'); setDissolvingTeamId(null); }}
          onCancel={() => setDissolvingTeamId(null)}
        />
      )}

      {renamingTeamId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRenamingTeamId(null)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('team.rename')}</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={t('team.newName')}
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRenamingTeamId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
              <button onClick={() => { renameTeam(renamingTeamId, renameValue.trim()); setRenamingTeamId(null); }} className="px-4 py-2 bg-hgss-blue text-white rounded">{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateTeam(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('team.create')}</h3>
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder={t('team.newName')}
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowCreateTeam(false); setNewTeamName(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
              <button onClick={() => { createTeamAsManager(missionId, newTeamName.trim() || undefined); setShowCreateTeam(false); setNewTeamName(''); }} className="px-4 py-2 bg-hgss-blue text-white rounded">{t('common.create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
