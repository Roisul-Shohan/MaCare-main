import React from 'react';
import { AuthProvider, useAuth } from './utils/AuthContext';
import LandingPage from './pages/LandingPage';
import MotherDashboard from './pages/MotherDashboard';
import PregnancyTracker from './pages/PregnancyTracker';
import DoctorDashboard from './pages/DoctorDashboard';
import MidwifeDashboard from './pages/MidwifeDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Main App Component with Authentication
 * Simple routing system for MaCare application
 */
const AppContent = () => {
  const [currentPage, setCurrentPage] = React.useState('landing');
  const [isNavMinimized, setIsNavMinimized] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Render different pages based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'register':
        return <Register onNavigate={setCurrentPage} />;
      case 'mother-dashboard':
        return isAuthenticated && user?.Role === 'mother' ? (
          <MotherDashboard onNavigate={setCurrentPage} />
        ) : (
          <Login onNavigate={setCurrentPage} />
        );
      case 'pregnancy-tracker':
        return isAuthenticated && user?.Role === 'mother' ? (
          <PregnancyTracker onNavigate={setCurrentPage} />
        ) : (
          <Login onNavigate={setCurrentPage} />
        );
      case 'doctor-dashboard':
        return isAuthenticated && user?.Role === 'doctor' ? (
          <DoctorDashboard onNavigate={setCurrentPage} />
        ) : (
          <Login onNavigate={setCurrentPage} />
        );
      case 'midwife-dashboard':
        return isAuthenticated && user?.Role === 'midWife' ? (
          <MidwifeDashboard onNavigate={setCurrentPage} />
        ) : (
          <Login onNavigate={setCurrentPage} />
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {/* Navigation Helper (Remove in production) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header with minimize/maximize button */}
          <div 
            className="flex justify-between items-center p-3 bg-primary-500 text-white cursor-pointer hover:bg-primary-600 transition-colors"
            onClick={() => setIsNavMinimized(!isNavMinimized)}
          >
            <h3 className="font-bold text-sm">Demo Navigation</h3>
            <button className="focus:outline-none">
              {isNavMinimized ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Navigation content */}
          {!isNavMinimized && (
            <div className="p-4 max-w-xs">
              {isAuthenticated && (
                <p className="text-xs mb-2 text-gray-600 border-b pb-2">
                  {user?.FullName} ({user?.Role})
                </p>
              )}
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentPage('landing')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'landing' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Landing Page
                </button>
                <button
                  onClick={() => setCurrentPage('login')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'login' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'register' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Register
                </button>
                <button
                  onClick={() => setCurrentPage('mother-dashboard')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'mother-dashboard' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mother Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('health-articles')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'health-articles' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  স্বাস্থ্য সমস্যা (Demo)
                </button>
                <button
                  onClick={() => setCurrentPage('doctor-dashboard')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'doctor-dashboard' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Doctor Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('midwife-dashboard')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPage === 'midwife-dashboard' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Midwife Dashboard
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      logout();
                      setCurrentPage('landing');
                    }}
                    className="w-full text-left px-3 py-2 rounded text-sm bg-red-500 text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {renderPage()}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
