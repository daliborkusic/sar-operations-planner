import { useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import type { TaskStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import StatusBadge from '../StatusBadge';
import TeamAssignDialog from './TeamAssignDialog';
import CreateTaskDialog from './CreateTaskDialog';

interface Props {
  missionId: string;
}

const columns: { status: TaskStatus; color: string }[] = [
  { status: 'draft', color: 'border-gray-400' },
  { status: 'unassigned', color: 'border-yellow-400' },
  { status: 'inProgress', color: 'border-blue-400' },
  { status: 'completed', color: 'border-green-400' },
];

export default function TasksKanban({ missionId }: Props) {
  const { t } = useTranslation();
  const allTasks = useStore((s) => s.tasks);
  const tasks = allTasks.filter((tk) => tk.missionId === missionId);
  const currentManagerUserId = useStore((s) => s.currentManagerUser?.id);
  const controllerId = useStore((s) => s.controllers[missionId]);
  const isController = !!currentManagerUserId && controllerId === currentManagerUserId;
  const moveTaskToStatus = useStore((s) => s.moveTaskToStatus);
  const pendingAssignment = useStore((s) => s.pendingAssignment);
  const setPendingAssignment = useStore((s) => s.setPendingAssignment);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const [showCreate, setShowCreate] = useState(false);

  const searchTypeLabels: Record<string, string> = {
    hasty: t('task.hasty'),
    grid: t('task.grid'),
    roadPatrol: t('task.roadPatrol'),
    baseSupport: t('task.baseSupport'),
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isController) return;
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((tk) => tk.id === taskId);
    if (!task || task.status === newStatus) return;
    moveTaskToStatus(taskId, newStatus);
  };

  const statusLabels: Record<string, string> = {
    draft: t('task.draft'),
    unassigned: t('task.unassigned'),
    inProgress: t('task.inProgress'),
    completed: t('task.completed'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('task.title')}</h3>
        <button onClick={() => setShowCreate(true)} className="text-xs px-3 py-1 bg-hgss-blue text-white rounded">
          + {t('task.create')}
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 pb-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((tk) => tk.status === col.status);
            return (
              <KanbanColumn key={col.status} id={col.status} title={statusLabels[col.status]} count={colTasks.length} color={col.color}>
                {colTasks.map((task) => (
                  <KanbanCard key={task.id} id={task.id} disabled={!isController}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-tight">{task.label}</p>
                      <StatusBadge status={task.priority} />
                    </div>
                    <p className="text-xs text-gray-500">{searchTypeLabels[task.searchType]}</p>
                    {task.assignedTeamId && (
                      <p className="text-xs text-hgss-blue mt-1 font-medium">
                        &rarr; {getTeamDisplayName(task.assignedTeamId)}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.notes}</p>
                    )}
                  </KanbanCard>
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      {pendingAssignment?.type === 'assignTeamToTask' && pendingAssignment.taskId && (
        <TeamAssignDialog taskId={pendingAssignment.taskId} missionId={missionId} onClose={() => setPendingAssignment(null)} />
      )}

      {showCreate && <CreateTaskDialog missionId={missionId} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
