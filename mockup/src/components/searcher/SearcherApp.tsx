import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import WelcomeScreen from './WelcomeScreen';
import AnonymousEntry from './AnonymousEntry';
import MissionList from './MissionList';
import MissionLobby from './MissionLobby';
import TeamView from './TeamView';

function PasteLinkField({ mode = 'all' }: { mode?: 'all' | 'teamOnly' }) {
  const { t } = useTranslation();
  const joinByLink = useStore((s) => s.joinByLink);
  const [pasteLink, setPasteLink] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const handlePaste = () => {
    const link = pasteLink.trim();
    if (!link) return;
    if (mode === 'teamOnly' && link.includes('cmrs://mission/')) {
      setLinkError(t('searcher.teamLinkOnly'));
      setTimeout(() => setLinkError(null), 3000);
      return;
    }
    const result = joinByLink(link);
    if (!result) {
      setLinkError(t('searcher.invalidLink'));
      setTimeout(() => setLinkError(null), 3000);
    } else {
      setPasteLink('');
      setLinkError(null);
    }
  };

  return (
    <div className="px-4 py-3 border-t">
      <p className="text-xs text-gray-500 mb-2">{t('searcher.pasteLink')}</p>
      <div className="flex gap-2">
        <input
          value={pasteLink}
          onChange={(e) => { setPasteLink(e.target.value); setLinkError(null); }}
          placeholder={mode === 'teamOnly' ? 'cmrs://team/...' : t('searcher.pasteLinkPlaceholder')}
          className={`flex-1 p-2 border rounded text-sm ${linkError ? 'border-red-400' : ''}`}
        />
        <button
          onClick={handlePaste}
          className="px-3 py-2 bg-hgss-blue text-white rounded text-sm"
        >
          {t('searcher.joinByLink')}
        </button>
      </div>
      {linkError && <p className="text-xs text-red-500 mt-1">{linkError}</p>}
    </div>
  );
}

function SearcherMissionView({ missionId }: { missionId: string }) {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const allTeamMembers = useStore((s) => s.teamMembers);
  const allTeams = useStore((s) => s.teams);
  const missions = useStore((s) => s.missions);
  const allPeriods = useStore((s) => s.periods);
  const leaveMission = useStore((s) => s.leaveMission);
  const setSelectedSearcherMission = useStore((s) => s.setSelectedSearcherMission);
  const [showMenu, setShowMenu] = useState(false);

  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return null;

  const missionPeriodIds = allPeriods.filter((p) => p.missionId === missionId).map((p) => p.id);

  const tm = currentUser
    ? allTeamMembers.find((m) => {
        const team = allTeams.find((te) => te.id === m.teamId);
        return m.userId === currentUser.id && m.active && team && missionPeriodIds.includes(team.periodId);
      })
    : undefined;
  const team = tm ? allTeams.find((te) => te.id === tm.teamId) : undefined;

  if (mission.status === 'closed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">{'✓'}</div>
        <p className="text-lg font-semibold mb-4">{t('mission.ended')}</p>
        <p className="text-sm text-gray-500 mb-6">{mission.name}</p>
        <button onClick={() => setSelectedSearcherMission(null)} className="px-4 py-2 bg-hgss-blue text-white rounded text-sm">
          {t('mission.backToList')}
        </button>
      </div>
    );
  }

  const headerBar = (
    <div className="bg-hgss-blue text-white px-3 py-2 flex items-center justify-between">
      <button onClick={() => setSelectedSearcherMission(null)} className="text-white/80 text-xs hover:text-white">
        {'←'}
      </button>
      <div className="flex-1 text-center mx-2 truncate">
        <span className="text-xs font-medium">{mission.name}</span>
      </div>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="text-white/80 text-xs hover:text-white px-1">
          {'⋮'}
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-50 py-1 min-w-[160px]">
            <button
              onClick={() => { if (confirm(t('mission.leaveConfirm'))) leaveMission(missionId); setShowMenu(false); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              {t('mission.leave')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (team && team.status !== 'dissolved') {
    return (
      <div className="flex-1 flex flex-col">
        {headerBar}
        <TeamView missionId={missionId} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {headerBar}
      <MissionLobby missionId={missionId} />
      <PasteLinkField mode="teamOnly" />
    </div>
  );
}

export default function SearcherApp() {
  const { t } = useTranslation();
  const currentUser = useStore((s) => s.currentUser);
  const missionParticipants = useStore((s) => s.missionParticipants);
  const missions = useStore((s) => s.missions);
  const selectedSearcherMissionId = useStore((s) => s.selectedSearcherMissionId);
  const setSelectedSearcherMission = useStore((s) => s.setSelectedSearcherMission);
  const logout = useStore((s) => s.logout);
  const [showAnonymous, setShowAnonymous] = useState(false);

  if (!currentUser) {
    if (showAnonymous) {
      return <AnonymousEntry onBack={() => setShowAnonymous(false)} />;
    }
    return <WelcomeScreen onAnonymous={() => setShowAnonymous(true)} />;
  }

  const userMissions = missionParticipants
    .filter((mp) => mp.userId === currentUser.id && !mp.leftAt)
    .map((mp) => missions.find((m) => m.id === mp.missionId))
    .filter(Boolean) as typeof missions;

  if (selectedSearcherMissionId && userMissions.some((m) => m.id === selectedSearcherMissionId)) {
    return (
      <div className="flex flex-col h-full">
        <SearcherMissionView missionId={selectedSearcherMissionId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-hgss-blue text-white px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">{currentUser.name}</span>
        <button onClick={logout} className="text-xs opacity-80 hover:opacity-100">
          Odjava
        </button>
      </div>

      {userMissions.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('mission.myMissions')}</h3>
          <div className="space-y-2">
            {userMissions.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedSearcherMission(m.id)}
                className="w-full text-left p-3 border rounded-lg hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{m.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === 'active' ? 'bg-green-100 text-green-800' :
                    m.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(`mission.${m.status}`)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <MissionList />
      <PasteLinkField mode="all" />
    </div>
  );
}
