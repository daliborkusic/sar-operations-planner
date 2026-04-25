import { useEffect, useState } from 'react';
import { useStore } from './store';
import ManagerApp from './components/manager/ManagerApp';

export default function App() {
  const dbReady = useStore((s) => s.dbReady);
  const hydrate = useStore((s) => s.hydrate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate().catch((e) => setError(String(e)));
  }, [hydrate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
          <h2 className="text-lg font-bold text-red-600 mb-2">Greška pri pokretanju</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Učitavanje...</p>
      </div>
    );
  }

  return <ManagerApp />;
}
