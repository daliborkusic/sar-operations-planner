import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';

interface Props {
  onBack: () => void;
}

export default function AnonymousEntry({ onBack }: Props) {
  const { t } = useTranslation();
  const loginAsAnonymous = useStore((s) => s.loginAsAnonymous);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (name.trim() && email.trim()) {
      loginAsAnonymous(name.trim(), email.trim());
    }
  };

  return (
    <div className="p-6">
      <button onClick={onBack} className="text-hgss-blue mb-4">&larr; {t('common.back')}</button>
      <h2 className="text-lg font-semibold mb-6">{t('auth.continueWithout')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.nameLabel')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ime i prezime"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.emailLabel')}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full p-3 border rounded-lg"
            placeholder="email@primjer.hr"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !email.trim()}
          className="w-full p-3 bg-hgss-blue text-white rounded-lg font-medium disabled:opacity-50"
        >
          {t('auth.enter')}
        </button>
      </div>
    </div>
  );
}
