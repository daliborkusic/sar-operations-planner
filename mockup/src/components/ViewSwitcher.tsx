import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import type { ViewMode } from '../store';

export default function ViewSwitcher() {
  const { t } = useTranslation();
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);

  const modes: { key: ViewMode; label: string }[] = [
    { key: 'searcher', label: t('views.searcher') },
    { key: 'manager', label: t('views.manager') },
    { key: 'split', label: t('views.split') },
  ];

  return (
    <header className="bg-hgss-blue text-white px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold tracking-wide">HGSS Team Planner</h1>
      <div className="flex gap-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setViewMode(m.key)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === m.key
                ? 'bg-white text-hgss-blue'
                : 'bg-hgss-blue text-white border border-white/30 hover:bg-white/10'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
