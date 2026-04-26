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
  const selectedPeriodId = useStore((s) => s.selectedPeriodId);
  const mission = useStore((s) => s.missions.find((m) => m.id === selectedMissionId));
  const allPeriods = useStore((s) => s.periods);
  const setSelectedMission = useStore((s) => s.setSelectedMission);
  const setSelectedPeriod = useStore((s) => s.setSelectedPeriod);
  const createPeriod = useStore((s) => s.createPeriod);
  const lockPeriod = useStore((s) => s.lockPeriod);
  const unlockPeriod = useStore((s) => s.unlockPeriod);
  const [activeTab, setActiveTab] = useState<'tasks' | 'teams'>('tasks');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCreatePeriod, setShowCreatePeriod] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');

  if (!mission || !selectedMissionId) return null;

  const missionPeriods = allPeriods.filter((p) => p.missionId === selectedMissionId);
  const activePeriodId = selectedPeriodId && missionPeriods.some((p) => p.id === selectedPeriodId)
    ? selectedPeriodId
    : (missionPeriods[0]?.id ?? null);
  const activePeriod = missionPeriods.find((p) => p.id === activePeriodId);

  const handleCreatePeriod = () => {
    if (newPeriodName.trim()) {
      createPeriod(selectedMissionId, newPeriodName.trim());
      setNewPeriodName('');
      setShowCreatePeriod(false);
    }
  };

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

      {/* Period selector */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('period.title')}:</span>
          {missionPeriods.length === 0 ? (
            <span className="text-xs text-gray-400">{t('period.noperiods')}</span>
          ) : (
            missionPeriods.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  p.id === activePeriodId
                    ? 'bg-hgss-blue text-white border-hgss-blue'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-hgss-blue'
                }`}
              >
                {p.name}
                {p.locked && <span className="ml-1 opacity-70">🔒</span>}
              </button>
            ))
          )}
          <button
            onClick={() => setShowCreatePeriod(true)}
            className="text-xs px-2 py-1 border border-dashed border-gray-300 rounded-full text-gray-500 hover:border-hgss-blue hover:text-hgss-blue"
          >
            + {t('period.create')}
          </button>
          {activePeriod && (
            <button
              onClick={() => activePeriod.locked ? unlockPeriod(activePeriod.id) : lockPeriod(activePeriod.id)}
              className="text-xs px-2 py-1 border rounded text-gray-500 hover:bg-gray-50"
            >
              {activePeriod.locked ? t('period.unlock') : t('period.lock')}
            </button>
          )}
        </div>
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

          {activePeriodId ? (
            <>
              <div className="hidden lg:block">
                <TasksKanban periodId={activePeriodId} />
              </div>
              <div className="hidden lg:block border-t pt-6">
                <TeamsKanban periodId={activePeriodId} />
              </div>

              <div className="lg:hidden">
                {activeTab === 'tasks' && <TasksKanban periodId={activePeriodId} />}
                {activeTab === 'teams' && <TeamsKanban periodId={activePeriodId} />}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">{t('period.noperiods')}</p>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-72 flex-shrink-0">
          <ParticipantsPanel missionId={selectedMissionId} periodId={activePeriodId ?? undefined} />
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
            <ParticipantsPanel missionId={selectedMissionId} periodId={activePeriodId ?? undefined} />
          </div>
        </div>
      )}

      {showCreatePeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreatePeriod(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('period.create')}</h3>
            <input
              value={newPeriodName}
              onChange={(e) => setNewPeriodName(e.target.value)}
              placeholder={t('period.name')}
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowCreatePeriod(false); setNewPeriodName(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
              <button onClick={handleCreatePeriod} disabled={!newPeriodName.trim()} className="px-4 py-2 bg-hgss-blue text-white rounded disabled:opacity-50">{t('common.create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
