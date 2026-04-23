import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import WelcomeScreen from './WelcomeScreen';
import AnonymousEntry from './AnonymousEntry';
import MissionList from './MissionList';
import MissionLobby from './MissionLobby';
import TeamView from './TeamView';

export default function SearcherApp() {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const missionParticipants = useStore((s) => s.missionParticipants);
  const missions = useStore((s) => s.missions);
  const teamMembers = useStore((s) => s.teamMembers);
  const teams = useStore((s) => s.teams);
  const logout = useStore((s) => s.logout);

  const mp = currentUser ? missionParticipants.find((p) => p.userId === currentUser.id) : undefined;
  const mission = mp ? missions.find((m) => m.id === mp.missionId) : undefined;
  const tm = currentUser ? teamMembers.find((m) => m.userId === currentUser.id) : undefined;
  const team = tm ? teams.find((te) => te.id === tm.teamId) : undefined;
  const [showAnonymous, setShowAnonymous] = useState(false);

  if (!currentUser) {
    if (showAnonymous) {
      return <AnonymousEntry onBack={() => setShowAnonymous(false)} />;
    }
    return <WelcomeScreen onAnonymous={() => setShowAnonymous(true)} />;
  }

  const missionClosed = mission?.status === 'closed';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-hgss-blue text-white px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">{currentUser.name}</span>
        <button onClick={logout} className="text-xs opacity-80 hover:opacity-100">
          Odjava
        </button>
      </div>

      {missionClosed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-4xl mb-4">&check;</div>
          <p className="text-lg font-semibold">{t('mission.ended')}</p>
        </div>
      ) : team && team.status !== 'dissolved' ? (
        <TeamView />
      ) : mission ? (
        <MissionLobby />
      ) : currentUser.type === 'registered' ? (
        <MissionList />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl mb-4">&#128241;</div>
          <p className="text-gray-500">{t('searcher.scanToJoin')}</p>
        </div>
      )}
    </div>
  );
}
