import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CodingWorkspace from './components/CodingWorkspace';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProblemsetPage from './pages/ProblemsetPage';
import ContestsPage from './pages/ContestsPage';
import CompanyDashboard from './pages/CompanyDashboard';
import HomePage from './pages/HomePage';
import SuperadminDashboard from './pages/SuperadminDashboard';
import ContestArena from './pages/ContestArena';
import AiRoadmapPage from './pages/AiRoadmapPage';
import MockInterviewPage from './pages/MockInterviewPage';
import HomepageFooter from './components/homepage/HomepageFooter';

function AppContent() {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/workspace');

  return (
    <div className={`flex flex-col bg-[var(--color-dark-bg)] text-white font-sans relative ${isWorkspace ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(220,68,5,0.15), transparent 70%)"
          }}
        />
      </div>

      <div className={`z-10 flex flex-col w-full relative bg-black ${isWorkspace ? 'h-full overflow-hidden' : 'min-h-screen'}`}>
        <Navbar />
        <main className={`flex-1 flex flex-col pt-16 ${isWorkspace ? 'min-h-0 overflow-hidden' : ''}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problemset" element={<ProblemsetPage />} />
            <Route path="/contests" element={<ContestsPage />} />
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/superadmin" element={<SuperadminDashboard />} />
            <Route path="/workspace/practice/:problemId" element={<CodingWorkspace />} />
            <Route path="/workspace/contest/:contestId" element={<ContestArena />} />
            <Route path="/workspace/contest/:contestId/:problemId" element={<CodingWorkspace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/ai-roadmap" element={<AiRoadmapPage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
          </Routes>
        </main>
        {!isWorkspace && (
          <div className='bg-black'>
            <HomepageFooter />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
