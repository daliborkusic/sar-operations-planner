import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  onClose: () => void;
}

export default function CreateMissionDialog({ onClose }: Props) {
  const { t } = useTranslation();
  const createMission = useStore((s) => s.createMission);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      createMission(name.trim(), description.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('mission.create')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('common.name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="Potraga..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('common.description')}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded h-24" placeholder="Opis misije..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
          <button onClick={handleCreate} disabled={!name.trim()} className="px-4 py-2 bg-hgss-blue text-white rounded disabled:opacity-50">{t('common.create')}</button>
        </div>
      </div>
    </div>
  );
}
