import React from 'react';
import LandingPage from './pages/LandingPage';
import MotherDashboard from './pages/MotherDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Main App Component
 * Simple routing system for MaCare application
 * 
 * To navigate between pages, change the 'currentPage' state
 * In a production app, you would use React Router
 */
const App = () => {
  // Simple state-based routing (for demo purposes)
  // Change this value to see different pages: 'landing', 'login', 'register', 'mother-dashboard', 'doctor-dashboard'
  const [currentPage, setCurrentPage] = React.useState('landing');

  // Render different pages based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'mother-dashboard':
        return <MotherDashboard />;
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="app">
      {/* Navigation Helper (Remove in production) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl p-4 max-w-xs">
          <h3 className="font-bold text-sm mb-2 text-gray-900">Demo Navigation</h3>
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
              onClick={() => setCurrentPage('doctor-dashboard')}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                currentPage === 'doctor-dashboard' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Doctor Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderPage()}
    </div>
  );
};

export default App;
