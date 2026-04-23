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
  const teams = useStore((s) => s.teams.filter((te) => te.missionId === missionId));
  const isController = useStore((s) => s.isController(missionId));
  const moveTeamToStatus = useStore((s) => s.moveTeamToStatus);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const getTeamMembers = useStore((s) => s.getTeamMembers);
  const getTeamTask = useStore((s) => s.getTeamTask);
  const [assigningTeamId, setAssigningTeamId] = useState<string | null>(null);
  const [dissolvingTeamId, setDissolvingTeamId] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isController) return;
    const { active, over } = event;
    if (!over) return;
    const teamId = active.id as string;
    const newStatus = over.id as TeamStatus;
    const team = teams.find((te) => te.id === teamId);
    if (!team || team.status === newStatus) return;

    if (newStatus === 'dissolved') {
      setDissolvingTeamId(teamId);
      return;
    }

    if (newStatus === 'inTask') return;

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
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{t('team.title')}</h3>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTeams = teams.filter((te) => te.status === col.status);
            return (
              <KanbanColumn key={col.status} id={col.status} title={statusLabels[col.status]} count={colTeams.length} color={col.color} collapsed={col.status === 'dissolved'}>
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
                          &rarr; {task.label}
                        </div>
                      )}
                      {isController && (team.status === 'idle' || team.status === 'resting') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setAssigningTeamId(team.id); }}
                          className="text-xs text-hgss-blue hover:underline"
                        >
                          {t('team.assignTask')}
                        </button>
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
    </div>
  );
}
