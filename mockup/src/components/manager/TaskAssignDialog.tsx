import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

interface Props {
  teamId: string;
  periodId: string;
  onClose: () => void;
}

export default function TaskAssignDialog({ teamId, periodId, onClose }: Props) {
  const { t } = useTranslation();
  const allTasks = useStore((s) => s.tasks);
  const tasks = allTasks.filter((tk) => tk.periodId === periodId && tk.status === 'unassigned');
  const assignTeamToTask = useStore((s) => s.assignTeamToTask);

  const searchTypeLabels: Record<string, string> = {
    hasty: t('task.hasty'),
    grid: t('task.grid'),
    roadPatrol: t('task.roadPatrol'),
    baseSupport: t('task.baseSupport'),
  };

  const handleSelect = (taskId: string) => {
    assignTeamToTask(taskId, teamId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('task.selectTask')}</h3>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nema nedodijeljenih zadataka</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleSelect(task.id)}
                className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-hgss-blue transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{task.label}</p>
                  <StatusBadge status={task.priority} />
                </div>
                <p className="text-xs text-gray-500">{searchTypeLabels[task.searchType]}</p>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
