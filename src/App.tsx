import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import LandingPage from './pages/LandingPage';
import WorldMapPage from './pages/WorldMapPage';
import KidsDashboard from './pages/KidsDashboard';
import TeensDashboard from './pages/TeensDashboard';
import AdultsDashboard from './pages/AdultsDashboard';
import CategoryPage from './pages/CategoryPage';
import GameplayPage from './pages/GameplayPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import WalletPage from './pages/WalletPage';
import PiggyBankPage from './pages/PiggyBankPage';
import FamilyPage from './pages/FamilyPage';
import DuelPlayPage from './pages/DuelPlayPage';
import DuelResultsPage from './pages/DuelResultsPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import ClassJoinPage from './pages/ClassJoinPage';
import ClassLeaderboardPage from './pages/ClassLeaderboardPage';
import SoundController from './components/ui/SoundController';
import WalletOnboardingModal from './components/ui/WalletOnboardingModal';

/** Redirects /map → the correct track dashboard, or /map itself if no profile */
function MapRedirect() {
  const { profile } = useGameStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!profile) { navigate('/', { replace: true }); return; }
    const dest = profile.ageTrack === 'kids' ? '/kids' : profile.ageTrack === 'teens' ? '/teens' : '/adults';
    navigate(dest, { replace: true });
  }, [profile, navigate]);
  return null;
}

function WalletDisclaimerGate() {
  const { profile } = useGameStore();
  // Show the disclaimer the first time the user has earned credits but hasn't seen the disclaimer
  const shouldShow =
    profile !== null &&
    !profile.walletDisclaimerSeen &&
    profile.walletBalance > 0;

  return (
    <AnimatePresence>
      {shouldShow && <WalletOnboardingModal />}
    </AnimatePresence>
  );
}

function App() {
  const { setLiteMode } = useGameStore();

  useEffect(() => {
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 2;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    if (hardwareConcurrency <= 2 || deviceMemory <= 2) {
      setLiteMode(true);
    }
  }, [setLiteMode]);

  return (
    <BrowserRouter>
      <SoundController />
      <WalletDisclaimerGate />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/map" element={<MapRedirect />} />
        <Route path="/map/classic" element={<WorldMapPage />} />
        <Route path="/kids" element={<KidsDashboard />} />
        <Route path="/teens" element={<TeensDashboard />} />
        <Route path="/adults" element={<AdultsDashboard />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/play" element={<GameplayPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/parent" element={<ParentDashboardPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/piggybank" element={<PiggyBankPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/duel/:id" element={<DuelPlayPage />} />
        <Route path="/duel/:id/results" element={<DuelResultsPage />} />
        <Route path="/teacher" element={<TeacherDashboardPage />} />
        <Route path="/class/join" element={<ClassJoinPage />} />
        <Route path="/class/:classId/leaderboard" element={<ClassLeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
