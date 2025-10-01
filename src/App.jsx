
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import HomePage from '@/components/HomePage';
import CaseSubmission from '@/components/CaseSubmission';
import Dashboard from '@/components/Dashboard';
import CaseAnalysis from '@/components/CaseAnalysis';
import AuthPage from '@/components/AuthPage';
import ProfilePage from '@/components/ProfilePage';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentCase, setCurrentCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pavia_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }

    const savedCases = localStorage.getItem('pavia_cases');
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    }
  }, []);

  const saveCases = (updatedCases) => {
    setCases(updatedCases);
    localStorage.setItem('pavia_cases', JSON.stringify(updatedCases));
  };

  const handleLogin = (userData) => {
    const newUser = { name: userData.email.split('@')[0], email: userData.email };
    setUser(newUser);
    localStorage.setItem('pavia_user', JSON.stringify(newUser));
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('pavia_user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('home');
  };

  const handleStartCase = () => {
    if (isAuthenticated) {
      setCurrentView('submission');
    } else {
      setCurrentView('auth');
    }
  };

  const handleCaseSubmitted = (caseData) => {
    const newCase = {
      id: Date.now().toString(),
      ...caseData,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      timeline: [
        {
          step: 'Dossier soumis',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Votre dossier a été reçu et enregistré'
        },
        {
          step: 'Analyse des documents',
          status: 'current',
          timestamp: null,
          description: 'Traitement automatique en cours'
        },
        {
          step: 'Questions de clarification',
          status: 'pending',
          timestamp: null,
          description: 'Questions personnalisées selon votre cas'
        },
        {
          step: 'Analyse finale',
          status: 'pending',
          timestamp: null,
          description: 'Génération de l\'analyse et recommandations'
        }
      ]
    };

    const updatedCases = [...cases, newCase];
    saveCases(updatedCases);
    setCurrentCase(newCase);
    setCurrentView('dashboard');

    setTimeout(() => {
      const caseWithAnalysis = {
        ...newCase,
        status: 'analysis_ready',
        timeline: newCase.timeline.map((item, index) => {
          if (index === 1) {
            return { ...item, status: 'completed', timestamp: new Date().toISOString() };
          }
          if (index === 2) {
            return { ...item, status: 'current' };
          }
          return item;
        })
      };
      
      const updatedCasesWithAnalysis = updatedCases.map(c => 
        c.id === newCase.id ? caseWithAnalysis : c
      );
      saveCases(updatedCasesWithAnalysis);
      setCurrentCase(caseWithAnalysis);
    }, 3000);
  };

  const handleViewCase = (caseId) => {
    const selectedCase = cases.find(c => c.id === caseId);
    setCurrentCase(selectedCase);
    setCurrentView('analysis');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentCase(null);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleUpdateCase = (updatedCase) => {
    const updatedCases = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
    saveCases(updatedCases);
    setCurrentCase(updatedCase);
  };

  const renderView = () => {
    if (!isAuthenticated) {
      switch (currentView) {
        case 'auth':
          return <AuthPage onLogin={handleLogin} />;
        default:
          return <HomePage onStartCase={handleStartCase} />;
      }
    }

    switch (currentView) {
      case 'submission':
        return <CaseSubmission onCaseSubmitted={handleCaseSubmitted} />;
      case 'analysis':
        return <CaseAnalysis case={currentCase} onBack={handleBackToDashboard} onUpdateCase={handleUpdateCase} />;
      case 'profile':
        return <ProfilePage user={user} onBack={handleBackToDashboard} />;
      case 'dashboard':
        return <Dashboard cases={cases} currentCase={currentCase} onViewCase={handleViewCase} onStartNewCase={handleStartCase} />;
      default:
        return <HomePage onStartCase={handleStartCase} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>PAVIA - Plateforme d'Arbitrage Virtuel par IA</title>
        <meta name="description" content="Résolvez vos conflits civils et commerciaux simples grâce à notre plateforme d'arbitrage virtuel alimentée par l'intelligence artificielle. Conforme au droit québécois." />
      </Helmet>

      <Header 
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        user={user}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
        onBackToDashboard={handleBackToDashboard}
      />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
