import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import MissionControls from './MissionControls';
import TasksKanban from './TasksKanban';
import TeamsKanban from './TeamsKanban';
import ParticipantsPanel from './ParticipantsPanel';

export default function MissionDashboard() {
  const { t } = useTranslation();
  const selectedMissionId = useStore((s) => s.selectedMissionId);
  const mission = useStore((s) => s.missions.find((m) => m.id === selectedMissionId));
  const setSelectedMission = useStore((s) => s.setSelectedMission);

  if (!mission || !selectedMissionId) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setSelectedMission(null)} className="text-hgss-blue hover:underline text-sm">
          &larr; {t('common.back')}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-6">
          <MissionControls missionId={selectedMissionId} />
          <TasksKanban missionId={selectedMissionId} />
          <TeamsKanban missionId={selectedMissionId} />
        </div>
        <div className="w-72 flex-shrink-0">
          <ParticipantsPanel missionId={selectedMissionId} />
        </div>
      </div>
    </div>
  );
}
