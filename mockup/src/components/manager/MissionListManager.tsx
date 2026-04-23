import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';
import CreateMissionDialog from './CreateMissionDialog';

export default function MissionListManager() {
  const { t } = useTranslation();
  const missions = useStore((s) => s.missions);
  const setSelectedMission = useStore((s) => s.setSelectedMission);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? missions : missions.filter((m) => m.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('mission.title')}</h2>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-hgss-blue text-white rounded-lg font-medium">
          + {t('mission.create')}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'active', 'suspended', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-hgss-blue text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {f === 'all' ? 'Sve' : t(`mission.${f}`)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} onClick={() => setSelectedMission(m.id)} className="bg-white rounded-lg p-4 border hover:border-hgss-blue cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{m.name}</h3>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{m.description}</p>
          </div>
        ))}
      </div>

      {showCreate && <CreateMissionDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
