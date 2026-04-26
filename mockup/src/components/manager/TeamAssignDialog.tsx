import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  taskId: string;
  periodId: string;
  onClose: () => void;
}

export default function TeamAssignDialog({ taskId, periodId, onClose }: Props) {
  const { t } = useTranslation();
  const allTeams = useStore((s) => s.teams);
  const teams = allTeams.filter((te) => te.periodId === periodId && (te.status === 'idle' || te.status === 'resting'));
  const assignTeamToTask = useStore((s) => s.assignTeamToTask);
  const getTeamDisplayName = useStore((s) => s.getTeamDisplayName);
  const getTeamMembers = useStore((s) => s.getTeamMembers);

  const handleSelect = (teamId: string) => {
    assignTeamToTask(taskId, teamId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('team.selectTeam')}</h3>
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nema dostupnih timova</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => {
              const members = getTeamMembers(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => handleSelect(team.id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-hgss-blue transition-colors"
                >
                  <p className="font-medium">{getTeamDisplayName(team.id)}</p>
                  <p className="text-xs text-gray-500">{members.length} {t('team.members').toLowerCase()}</p>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
