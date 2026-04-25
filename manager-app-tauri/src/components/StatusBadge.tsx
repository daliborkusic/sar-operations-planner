import { useTranslation } from 'react-i18next';

const colorMap: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-gray-100 text-gray-600',
  resting: 'bg-orange-100 text-orange-800',
  idle: 'bg-blue-100 text-blue-800',
  inTask: 'bg-green-100 text-green-800',
  dissolved: 'bg-gray-100 text-gray-500',
  draft: 'bg-gray-100 text-gray-600',
  unassigned: 'bg-yellow-100 text-yellow-800',
  inProgress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-600',
};

const labelMap: Record<string, string> = {
  active: 'mission.active',
  suspended: 'mission.suspended',
  closed: 'mission.closed',
  resting: 'team.resting',
  idle: 'team.idle',
  inTask: 'team.inTask',
  dissolved: 'team.dissolved',
  draft: 'task.draft',
  unassigned: 'task.unassigned',
  inProgress: 'task.inProgress',
  completed: 'task.completed',
  high: 'task.high',
  medium: 'task.medium',
  low: 'task.low',
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(labelMap[status] || status)}
    </span>
  );
}
