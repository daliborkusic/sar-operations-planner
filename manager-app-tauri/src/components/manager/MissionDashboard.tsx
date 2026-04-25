import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'tasks' | 'teams'>('tasks');
  const [showParticipants, setShowParticipants] = useState(false);

  if (!mission || !selectedMissionId) return null;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setSelectedMission(null)} className="text-hgss-blue hover:underline text-sm">
          {'←'} {t('common.back')}
        </button>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="lg:hidden px-3 py-1 border rounded text-sm text-hgss-blue"
        >
          {t('participants.title')}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-6">
          <MissionControls missionId={selectedMissionId} />

          <div className="lg:hidden flex border-b mb-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks' ? 'border-hgss-blue text-hgss-blue' : 'border-transparent text-gray-500'
              }`}
            >
              {t('dashboard.tasks')}
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'teams' ? 'border-hgss-blue text-hgss-blue' : 'border-transparent text-gray-500'
              }`}
            >
              {t('dashboard.teams')}
            </button>
          </div>

          <div className="hidden lg:block">
            <TasksKanban missionId={selectedMissionId} />
          </div>
          <div className="hidden lg:block border-t pt-6">
            <TeamsKanban missionId={selectedMissionId} />
          </div>

          <div className="lg:hidden">
            {activeTab === 'tasks' && <TasksKanban missionId={selectedMissionId} />}
            {activeTab === 'teams' && <TeamsKanban missionId={selectedMissionId} />}
          </div>
        </div>

        <div className="hidden lg:block w-72 flex-shrink-0">
          <ParticipantsPanel missionId={selectedMissionId} />
        </div>
      </div>

      {showParticipants && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowParticipants(false)} />
          <div className="relative ml-auto w-80 h-full bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold">{t('participants.title')}</h3>
              <button onClick={() => setShowParticipants(false)} className="text-gray-500 text-lg">{'✕'}</button>
            </div>
            <ParticipantsPanel missionId={selectedMissionId} />
          </div>
        </div>
      )}
    </div>
  );
}
