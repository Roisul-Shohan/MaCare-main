import React from 'react';
import { useAuth } from '../utils/AuthContext';

/**
 * Sidebar Component for Dashboards
 * Navigation sidebar for Mother, Doctor, and Midwife dashboards
 */
const Sidebar = ({ userRole = 'mother', onNavigate }) => {
  const { user, logout } = useAuth();
  
  // Different menu items based on user role
  const motherMenu = [
    { name: 'ড্যাশবোর্ড', icon: 'home', action: 'dashboard' },
    { name: 'গর্ভাবস্থা ট্র্যাকার', icon: 'chart', action: 'pregnancy' },
    { name: 'টিকার সময়সূচী (বাচ্চা)', icon: 'calendar', action: 'vaccine' },
    { name: 'টিকার সময়সূচী (মা)', icon: 'syringe', action: 'vaccine-schedule' },
    { name: 'পুষ্টি পরামর্শ', icon: 'food', action: 'nutrition' },
    { name: 'মেসেজ', icon: 'message', action: 'messages' },
    { name: 'জরুরি যোগাযোগ', icon: 'phone', action: 'emergency' },
  ];

  const doctorMenu = [
    { name: 'ড্যাশবোর্ড', icon: 'home', link: '#dashboard' },
    { name: 'রোগীদের তালিকা', icon: 'users', link: '#patients' },
    { name: 'অ্যাপয়েন্টমেন্ট', icon: 'calendar', link: '#appointments' },
    { name: 'মেসেজ', icon: 'message', link: '#messages' },
    { name: 'রিপোর্ট', icon: 'chart', link: '#reports' },
  ];

  const menu = userRole === 'mother' ? motherMenu : doctorMenu;

  const getIcon = (iconName) => {
    const icons = {
      home: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />,
      chart: <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />,
      calendar: <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />,
      syringe: <path fillRule="evenodd" d="M17.293 1.293a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0l-1-1-3.586 3.586a3 3 0 00-2.828-.586l-4.172 4.172a3 3 0 100 4.242l4.172 4.172a3 3 0 004.242 0l4.172-4.172a3 3 0 00-.586-2.828l3.586-3.586-1-1a1 1 0 010-1.414l2-2zm-11 11.414L4.586 11l1.707-1.707 1.707 1.707-1.707 1.707zm3.414 0l-1.707-1.707L9.707 9.293 11.414 11l-1.707 1.707z" clipRule="evenodd" />,
      food: <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />,
      message: <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />,
      phone: <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />,
      
      users: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />,
      user: <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />,
    };
    return icons[iconName] || icons.home;
  };

  return (
    <aside className="bg-white w-64 min-h-screen shadow-lg">
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary-600">MaCare</h2>
        <p className="text-sm text-gray-600">
          {userRole === 'mother' ? 'মায়ের প্যানেল' : (userRole === 'midWife' || userRole === 'midwife') ? 'ধাত্রীর প্যানেল' : 'ডাক্তারের প্যানেল'}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menu.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => onNavigate && onNavigate(item.action)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  {getIcon(item.icon)}
                </svg>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => onNavigate && onNavigate('profile')}
        >
          {user?.ProfileImage ? (
            <img 
              src={user.ProfileImage} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.FullName?.charAt(0) || (userRole === 'mother' ? 'ম' : 'ড')}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {user?.FullName || (userRole === 'mother' ? 'রহিমা খাতুন' : 'ডা. করিম')}
            </p>
            <p className="text-xs text-gray-500">
              প্রোফাইল দেখুন
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full mt-2 text-xs text-gray-600 hover:text-red-600 text-left px-2 py-1 hover:bg-red-50 rounded transition-colors"
        >
          লগআউট
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
