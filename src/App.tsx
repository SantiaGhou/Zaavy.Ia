import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/pages/LandingPage';
import { Dashboard } from './components/pages/Dashboard';
import { CreateBot } from './components/pages/CreateBot';
import { BotSession } from './components/pages/BotSession';
import { SavedSessions } from './components/pages/SavedSessions';
import { BotBuilder } from './components/pages/BotBuilder';
import { apiService } from './services/api';

function AppContent() {
  const { state, dispatch } = useApp();

  // Initialize session on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const sessionData = await apiService.initializeSession();
        
        dispatch({ type: 'SET_USER', payload: {
          sessionId: sessionData.sessionId,
          hasOpenAIKey: sessionData.hasOpenAIKey,
          botsCount: sessionData.botsCount
        }});
        
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Load bots if user goes directly to dashboard
        if (window.location.hash === '#dashboard') {
          dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' });
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'create-bot':
        return <CreateBot />;
      case 'bot-session':
        return <BotSession />;
      case 'saved-sessions':
        return <SavedSessions />;
      case 'bot-builder':
        return <BotBuilder />;
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