import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';
import StatusBadge from '../StatusBadge';
import ConfirmDialog from '../ConfirmDialog';

interface Props {
  missionId: string;
}

export default function MissionControls({ missionId }: Props) {
  const { t } = useTranslation();
  const mission = useStore((s) => s.missions.find((m) => m.id === missionId))!;
  const currentManagerUser = useStore((s) => s.currentManagerUser);
  const controllers = useStore((s) => s.controllers);
  const allUsers = useStore((s) => s.users);
  const isController = !!currentManagerUser && controllers[missionId] === currentManagerUser.id;
  const controllerUserId = controllers[missionId];
  const controllerName = controllerUserId ? allUsers.find((u) => u.id === controllerUserId)?.name || null : null;
  const takeControl = useStore((s) => s.takeControl);
  const updateMissionStatus = useStore((s) => s.updateMissionStatus);
  const [showQr, setShowQr] = useState(false);
  const [showTakeControl, setShowTakeControl] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showClose, setShowClose] = useState(false);

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">{mission.name}</h2>
          <StatusBadge status={mission.status} />
        </div>
        <button onClick={() => setShowQr(!showQr)} className="px-3 py-1 border rounded text-sm text-hgss-blue">
          {t('mission.qrCode')}
        </button>
      </div>

      {showQr && (
        <div className="flex flex-col items-center py-4 mb-4 bg-gray-50 rounded-lg">
          <QRCodeSVG value={`cmrs://mission/${mission.joinCode}`} size={160} />
          <p className="text-xs text-gray-500 mt-2">{mission.joinCode}</p>
        </div>
      )}

      <div className={`p-3 rounded-lg mb-4 ${isController ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        {isController ? (
          <p className="text-sm font-medium text-green-700">{'✓'} {t('control.youHaveControl')}</p>
        ) : controllerName ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{t('control.controller')}: <strong>{controllerName}</strong></p>
            <button onClick={() => setShowTakeControl(true)} className="px-3 py-1 bg-hgss-red text-white rounded text-xs font-medium">
              {t('control.takeControl')}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('control.noController')}</p>
            <button onClick={() => takeControl(missionId)} className="px-3 py-1 bg-hgss-blue text-white rounded text-xs font-medium">
              {t('control.takeControl')}
            </button>
          </div>
        )}
      </div>

      {isController && mission.status === 'active' && (
        <div className="flex gap-2">
          <button onClick={() => setShowSuspend(true)} className="flex-1 py-2 bg-yellow-500 text-white rounded text-sm font-medium">
            {t('mission.suspend')}
          </button>
          <button onClick={() => setShowClose(true)} className="flex-1 py-2 bg-red-600 text-white rounded text-sm font-medium">
            {t('mission.close')}
          </button>
        </div>
      )}

      {isController && mission.status === 'suspended' && (
        <button onClick={() => updateMissionStatus(missionId, 'active')} className="w-full py-2 bg-green-600 text-white rounded text-sm font-medium">
          {t('mission.resume')}
        </button>
      )}

      {showTakeControl && (
        <ConfirmDialog
          title={t('control.takeControl')}
          message={t('control.takeControlConfirm')}
          onConfirm={() => { takeControl(missionId); setShowTakeControl(false); }}
          onCancel={() => setShowTakeControl(false)}
        />
      )}

      {showClose && (
        <ConfirmDialog
          title={t('mission.close')}
          message={t('mission.closeConfirm')}
          onConfirm={() => { updateMissionStatus(missionId, 'closed'); setShowClose(false); }}
          onCancel={() => setShowClose(false)}
        />
      )}

      {showSuspend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSuspend(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('mission.suspend')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => { updateMissionStatus(missionId, 'suspended', true); setShowSuspend(false); }}
                className="w-full p-3 border rounded-lg hover:bg-blue-50 text-left"
              >
                <p className="font-medium">{t('mission.keepTeams')}</p>
                <p className="text-xs text-gray-500">Timovi ostaju formirani za nastavak</p>
              </button>
              <button
                onClick={() => { updateMissionStatus(missionId, 'suspended', false); setShowSuspend(false); }}
                className="w-full p-3 border rounded-lg hover:bg-red-50 text-left"
              >
                <p className="font-medium text-red-600">{t('mission.dissolveTeams')}</p>
                <p className="text-xs text-gray-500">Svi timovi se raspuštaju</p>
              </button>
            </div>
            <button onClick={() => setShowSuspend(false)} className="w-full mt-4 py-2 text-gray-500">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
