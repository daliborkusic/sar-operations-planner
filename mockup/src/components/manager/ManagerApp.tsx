import { useStore } from '../../store';
import MissionListManager from './MissionListManager';
import MissionDashboard from './MissionDashboard';

export default function ManagerApp() {
  const selectedMissionId = useStore((s) => s.selectedMissionId);

  return selectedMissionId ? <MissionDashboard /> : <MissionListManager />;
}
