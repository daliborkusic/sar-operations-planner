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
import EditTaskDialog from './EditTaskDialog';
import type { Task } from '../../types';

interface Props {
  periodId: string;
}

const columns: { status: TaskStatus; color: string }[] = [
  { status: 'draft', color: 'border-gray-400' },
  { status: 'unassigned', color: 'border-yellow-400' },
  { status: 'inProgress', color: 'border-blue-400' },
  { status: 'completed', color: 'border-green-400' },
];

export default function TasksKanban({ periodId }: Props) {
  const { t } = useTranslation();
  const allTasks = useStore((s) => s.tasks);
  const tasks = allTasks.filter((tk) => tk.periodId === periodId);
  const allPeriods = useStore((s) => s.periods);
  const period = allPeriods.find((p) => p.id === periodId);
  const missionId = period?.missionId ?? '';
  const currentManagerUserId = useStore((s) => s.currentManagerUser?.id);
  const controllerId = useStore((s) => s.controllers[missionId]);
  const isController = !!currentManagerUserId && controllerId === currentManagerUserId;
  const moveTaskToStatus = useStore((s) => s.moveTaskToStatus);
  const pendingAssignment = useStore((s) => s.pendingAssignment);
  const setPendingAssignment = useStore((s) => s.setPendingAssignment);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const taskFilter = useStore((s) => s.taskFilter);
  const setTaskFilter = useStore((s) => s.setTaskFilter);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const filteredTasks = tasks.filter((tk) => {
    if (taskFilter.search && !tk.label.toLowerCase().includes(taskFilter.search.toLowerCase())) return false;
    if (taskFilter.taskType && tk.taskType !== taskFilter.taskType) return false;
    return true;
  });

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

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={taskFilter.search}
          onChange={(e) => setTaskFilter({ search: e.target.value })}
          placeholder={t('common.search')}
          className="flex-1 text-xs p-2 border rounded"
        />
        <select
          value={taskFilter.taskType ?? ''}
          onChange={(e) => setTaskFilter({ taskType: e.target.value ? e.target.value as import('../../types').TaskType : null })}
          className="text-xs p-2 border rounded"
        >
          <option value="">{t('common.all')}</option>
          <option value="ground">{t('task.ground')}</option>
          <option value="k9">{t('task.k9')}</option>
          <option value="uav">{t('task.uav')}</option>
          <option value="police">{t('task.police')}</option>
        </select>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((tk) => tk.status === col.status);
            return (
              <KanbanColumn key={col.status} id={col.status} title={statusLabels[col.status]} count={colTasks.length} color={col.color}>
                {colTasks.map((task) => (
                  <KanbanCard key={task.id} id={task.id} disabled={!isController}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-tight">{task.label}</p>
                      <StatusBadge status={task.priority} />
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${taskTypeBadgeColors[task.taskType]}`}>
                        {taskTypeLabels[task.taskType]}
                      </span>
                      <p className="text-xs text-gray-500">{searchTypeLabels[task.searchType]}</p>
                    </div>
                    {task.assignedTeamId && (
                      <p className="text-xs text-hgss-blue mt-1 font-medium">
                        {'→'} {getTeamDisplayName(task.assignedTeamId)}
                      </p>
                    )}
                    {task.startedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t('task.inProgress')}: {new Date(task.startedAt).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {task.completedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        {t('task.completed')}: {new Date(task.completedAt).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.notes}</p>
                    )}
                    {isController && (
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
                        className="text-xs text-gray-500 hover:text-hgss-blue hover:underline mt-1"
                      >
                        {t('task.edit')}
                      </button>
                    )}
                  </KanbanCard>
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      {pendingAssignment?.type === 'assignTeamToTask' && pendingAssignment.taskId && (
        <TeamAssignDialog taskId={pendingAssignment.taskId} periodId={periodId} onClose={() => setPendingAssignment(null)} />
      )}

      {showCreate && <CreateTaskDialog periodId={periodId} onClose={() => setShowCreate(false)} />}

      {editingTask && <EditTaskDialog task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  );
}
