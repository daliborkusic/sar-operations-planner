import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';

export default function MissionList() {
  const { t } = useTranslation();
  const allMissions = useStore((s) => s.missions);
  const missions = allMissions.filter((m) => m.status === 'active');
  const joinMission = useStore((s) => s.joinMission);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('mission.title')}</h2>
      <div className="space-y-3">
        {missions.map((m) => (
          <div key={m.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">{m.name}</h3>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-xs text-gray-500 mb-3">{m.description}</p>
            <button
              onClick={() => joinMission(m.id)}
              className="w-full py-2 bg-hgss-blue text-white rounded text-sm font-medium"
            >
              {t('mission.join')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
