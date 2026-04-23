import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  onAnonymous: () => void;
}

export default function WelcomeScreen({ onAnonymous }: Props) {
  const { t } = useTranslation();
  const loginAsRegistered = useStore((s) => s.loginAsRegistered);
  const allUsers = useStore((s) => s.users);
  const users = allUsers.filter((u) => u.type === 'registered');

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6">
      <div className="w-16 h-16 bg-hgss-red rounded-full flex items-center justify-center mb-4">
        <span className="text-white text-2xl font-bold">H</span>
      </div>
      <h1 className="text-xl font-bold text-hgss-blue mb-8">HGSS Team Planner</h1>

      <div className="w-full space-y-3">
        <select
          onChange={(e) => { if (e.target.value) loginAsRegistered(e.target.value); }}
          className="w-full p-3 border rounded-lg text-center bg-hgss-blue text-white font-medium"
          defaultValue=""
        >
          <option value="" disabled>{t('auth.signInHgss')}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.station})</option>
          ))}
        </select>

        <div className="text-center text-gray-400 text-sm">ili</div>

        <button
          onClick={onAnonymous}
          className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
        >
          {t('auth.continueWithout')}
        </button>
      </div>
    </div>
  );
}
