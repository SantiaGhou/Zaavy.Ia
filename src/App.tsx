import React from 'react';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { Dashboard } from './components/pages/Dashboard';
import { CreateBot } from './components/pages/CreateBot';
import { BotSession } from './components/pages/BotSession';
import { SavedSessions } from './components/pages/SavedSessions';
import { apiService } from './services/api';

function AppContent() {
  const { state } = useApp();

  // Initialize app with stored token
  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      // TODO: Validate token and get user data
      // For now, just set as authenticated
    }
  }, []);

  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'create-bot':
        return <CreateBot />;
      case 'bot-session':
        return <BotSession />;
      case 'saved-sessions':
        return <SavedSessions />;
      default:
        return <LandingPage />;
    }
  };

  return <div className="min-h-screen bg-black">{renderCurrentPage()}</div>;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;