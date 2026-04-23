import ViewSwitcher from './components/ViewSwitcher';
import PhoneFrame from './components/PhoneFrame';
import SearcherApp from './components/searcher/SearcherApp';
import ManagerApp from './components/manager/ManagerApp';
import { useStore } from './store';

export default function App() {
  const viewMode = useStore((s) => s.viewMode);

  return (
    <div className="min-h-screen flex flex-col">
      <ViewSwitcher />
      <main className="flex-1 p-6">
        {viewMode === 'searcher' && (
          <div className="flex justify-center py-8">
            <PhoneFrame>
              <SearcherApp />
            </PhoneFrame>
          </div>
        )}
        {viewMode === 'manager' && (
          <ManagerApp />
        )}
        {viewMode === 'split' && (
          <div className="flex gap-8 items-start">
            <div className="flex-1">
              <ManagerApp />
            </div>
            <div className="flex-shrink-0">
              <PhoneFrame>
                <SearcherApp />
              </PhoneFrame>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
