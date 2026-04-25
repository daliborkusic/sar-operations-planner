import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import type { SearchType, TaskPriority } from '../../types';

interface Props {
  missionId: string;
  onClose: () => void;
}

export default function CreateTaskDialog({ missionId, onClose }: Props) {
  const { t } = useTranslation();
  const createTask = useStore((s) => s.createTask);
  const [label, setLabel] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('hasty');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    if (label.trim()) {
      createTask(missionId, label.trim(), searchType, priority, notes.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('task.create')}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.label')}</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full p-2 border rounded" placeholder="Sektor 5 - ..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.searchType')}</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value as SearchType)} className="w-full p-2 border rounded">
              <option value="hasty">{t('task.hasty')}</option>
              <option value="grid">{t('task.grid')}</option>
              <option value="roadPatrol">{t('task.roadPatrol')}</option>
              <option value="baseSupport">{t('task.baseSupport')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.priority')}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full p-2 border rounded">
              <option value="high">{t('task.high')}</option>
              <option value="medium">{t('task.medium')}</option>
              <option value="low">{t('task.low')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('task.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded h-20" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('common.cancel')}</button>
          <button onClick={handleCreate} disabled={!label.trim()} className="px-4 py-2 bg-hgss-blue text-white rounded disabled:opacity-50">{t('common.create')}</button>
        </div>
      </div>
    </div>
  );
}
