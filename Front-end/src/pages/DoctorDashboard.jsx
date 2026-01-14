import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DoctorSearchAndAdvice from '../components/DoctorSearchAndAdvice';
import api from '../utils/api';

/**
 * Doctor Dashboard
 * Dashboard for doctors to manage patients, send advice, and view records
 */
const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [adviceHistory, setAdviceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, search-advice, history

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, historyResponse] = await Promise.all([
        api.getDoctorDashboard(),
        api.getDoctorAdviceHistory()
      ]);

      setDashboardData(dashResponse.data);
      setAdviceHistory(historyResponse.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole="doctor" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">ড্যাশবোর্ড লোড হচ্ছে...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole="doctor" />
        <main className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ত্রুটি: {error}
          </div>
        </main>
      </div>
    );
  }

  const totalPatients = dashboardData?.totalPatients || 0;
  const highRiskPatients = dashboardData?.highRiskPatients || 0;
  const todayAppointments = dashboardData?.todayAppointments || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="doctor" />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ডাক্তার ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আজ: {new Date().toLocaleDateString('bn-BD')}</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              সংক্ষিপ্ত বিবরণ
            </button>
            <button
              onClick={() => setActiveTab('search-advice')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search-advice'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              মা খুঁজুন এবং পরামর্শ দিন
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              পরামর্শের ইতিহাস ({adviceHistory.length})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Patients */}
              <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">মোট রোগী</h3>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold">{totalPatients}</div>
                <p className="mt-2 text-sm opacity-90">সক্রিয় রোগী</p>
              </div>

              {/* High Risk Patients */}
              <div className="card bg-gradient-to-br from-red-500 to-pink-500 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">উচ্চ ঝুঁকি</h3>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-4xl font-bold">{highRiskPatients}</div>
                <p className="mt-2 text-sm opacity-90">বিশেষ নজরদারি প্রয়োজন</p>
              </div>

              {/* Today's Appointments */}
              <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">আজকের অ্যাপয়েন্টমেন্ট</h3>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-4xl font-bold">{todayAppointments}</div>
                <p className="mt-2 text-sm opacity-90">নির্ধারিত পরামর্শ</p>
              </div>
            </div>

            {/* Recent Advice Sent */}
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">সাম্প্রতিক পরামর্শ</h2>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  সব দেখুন →
                </button>
              </div>
              {adviceHistory && adviceHistory.length > 0 ? (
                <div className="space-y-3">
                  {adviceHistory.slice(0, 5).map((advice) => (
                    <div key={advice._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{advice.subject}</h3>
                          <p className="text-sm text-gray-600">
                            To: {advice.motherID?.FullName}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          advice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          advice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          advice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {advice.priority === 'urgent' ? 'জরুরি' : advice.priority === 'high' ? 'উচ্চ' : advice.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{advice.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {advice.adviceType === 'general' ? 'সাধারণ' : advice.adviceType === 'medication' ? 'ঔষধ' : advice.adviceType === 'diet' ? 'খাদ্য' : advice.adviceType === 'exercise' ? 'ব্যায়াম' : advice.adviceType === 'emergency' ? 'জরুরি' : 'ফলোআপ'}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{new Date(advice.createdAt).toLocaleDateString('bn-BD')}</span>
                          <span className={advice.isRead ? 'text-green-600' : 'text-gray-400'}>
                            {advice.isRead ? '✓ পড়া হয়েছে' : '○ পড়া হয়নি'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">এখনো কোনো পরামর্শ পাঠানো হয়নি</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab('search-advice')}
                className="card hover:shadow-xl transition-shadow flex items-center justify-center space-x-3 py-6"
              >
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                </svg>
                <span className="font-semibold text-gray-900">মা খুঁজুন</span>
              </button>
              
              <button className="card hover:shadow-xl transition-shadow flex items-center justify-center space-x-3 py-6">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-gray-900">অ্যাপয়েন্টমেন্ট দেখুন</span>
              </button>
              
              <button className="card hover:shadow-xl transition-shadow flex items-center justify-center space-x-3 py-6">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="font-semibold text-gray-900">রিপোর্ট দেখুন</span>
              </button>
            </div>
          </>
        )}

        {/* Search & Advise Tab */}
        {activeTab === 'search-advice' && (
          <DoctorSearchAndAdvice />
        )}

        {/* Advice History Tab */}
        {activeTab === 'history' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              পরামর্শের ইতিহাস ({adviceHistory.length})
            </h2>
            {adviceHistory.length > 0 ? (
              <div className="space-y-3">
                {adviceHistory.map((advice) => (
                  <div key={advice._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{advice.subject}</h3>
                        <p className="text-sm text-gray-600">
                          প্রাপক: {advice.motherID?.FullName} ({advice.motherID?.Email})
                        </p>
                        <p className="text-sm text-gray-600">
                          ফোন: {advice.motherID?.PhoneNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded mb-2 inline-block ${
                          advice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          advice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          advice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {advice.priority === 'urgent' ? 'জরুরি' : advice.priority === 'high' ? 'উচ্চ' : advice.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {new Date(advice.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{advice.message}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {advice.adviceType === 'general' ? 'সাধারণ' : advice.adviceType === 'medication' ? 'ঔষধ' : advice.adviceType === 'diet' ? 'খাদ্য' : advice.adviceType === 'exercise' ? 'ব্যায়াম' : advice.adviceType === 'emergency' ? 'জরুরি' : 'ফলোআপ'}
                        </span>
                        {advice.followupRequired && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            ফলোআপ: {new Date(advice.followupDate).toLocaleDateString('bn-BD')}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${advice.isRead ? 'text-green-600' : 'text-gray-400'}`}>
                        {advice.isRead ? (
                          <>✓ {new Date(advice.readAt).toLocaleDateString('bn-BD')} তে পড়া হয়েছে</>
                        ) : (
                          '○ এখনো পড়া হয়নি'
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <p>এখনো কোনো পরামর্শ পাঠানো হয়নি</p>
                <button
                  onClick={() => setActiveTab('search-advice')}
                  className="btn-primary mt-4"
                >
                  মাদের পরামর্শ দেওয়া শুরু করুন
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
