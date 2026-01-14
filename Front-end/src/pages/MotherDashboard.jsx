import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DoctorAdviceList from '../components/DoctorAdviceList';
import HealthUpdatesList from '../components/HealthUpdatesList';
import api from '../utils/api';

/**
 * Mother Dashboard
 * Main dashboard for pregnant mothers with pregnancy tracking, appointments, and health info
 */
const MotherDashboard = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, advice, health-updates, checkups

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getMotherDashboard();
      setDashboardData(response.data);
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
        <Sidebar userRole="mother" onNavigate={onNavigate} />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">আপনার ড্যাশবোর্ড লোড হচ্ছে...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole="mother" onNavigate={onNavigate} />
        <main className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ত্রুটি: {error}
          </div>
        </main>
      </div>
    );
  }

  const pregnancyWeek = dashboardData?.pregnancyWeek || 0;
  const nextAppointment = dashboardData?.appointments?.[0];
  const vaccinesDue = dashboardData?.vaccinesDue || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="mother" onNavigate={onNavigate} />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">আপনার ড্যাশবোর্ডে স্বাগতম!</h1>
          <p className="text-gray-600">আপনার গর্ভাবস্থা এবং স্বাস্থ্য আপডেট ট্র্যাক করুন</p>
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
              onClick={() => setActiveTab('advice')}
              className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'advice'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ডাক্তারের পরামর্শ
              {dashboardData?.doctorAdvice?.some(a => !a.isRead) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-2 h-2 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('health-updates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'health-updates'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              স্বাস্থ্য আপডেট
            </button>
            <button
              onClick={() => setActiveTab('checkups')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checkups'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              নির্ধারিত চেকআপ
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* NOTE: tracker is accessible from the sidebar — no extra dashboard button */}
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Pregnancy Week */}
              <div className="card bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">গর্ভাবস্থার সপ্তাহ</h3>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-2">{pregnancyWeek} সপ্তাহ</div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: `${(pregnancyWeek / 40) * 100}%` }}></div>
                </div>
                <p className="mt-2 text-sm opacity-90">৪০ সপ্তাহের মধ্যে</p>
              </div>

              {/* Next Appointment */}
              <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">পরবর্তী অ্যাপয়েন্টমেন্ট</h3>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                {nextAppointment ? (
                  <>
                    <div className="text-2xl font-bold mb-1">
                      {new Date(nextAppointment.appointmentDate).toLocaleDateString('bn-BD')}
                    </div>
                    <p className="text-sm opacity-90">
                      ডা. {nextAppointment.doctorID?.FullName} এর সাথে
                    </p>
                  </>
                ) : (
                  <p className="text-sm">কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই</p>
                )}
              </div>

              {/* Vaccines Due */}
              <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">টিকা প্রয়োজন</h3>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-1">{vaccinesDue}</div>
                <p className="text-sm opacity-90">জন্মের পর নবজাতকের জন্য</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Doctor Advice */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">সাম্প্রতিক ডাক্তারের পরামর্শ</h2>
                  <button
                    onClick={() => setActiveTab('advice')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    সব দেখুন →
                  </button>
                </div>
                <DoctorAdviceList limit={3} />
              </div>

              {/* Recent Health Updates */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">সাম্প্রতিক স্বাস্থ্য আপডেট</h2>
                  <button
                    onClick={() => setActiveTab('health-updates')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    সব দেখুন →
                  </button>
                </div>
                <HealthUpdatesList limit={3} />
              </div>
            </div>

            {/* Healthcare Providers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Assigned Doctor */}
              {dashboardData?.assignedDoctor && (
                <div className="card">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">আপনার ডাক্তার</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        ডা. {dashboardData.assignedDoctor.FullName}
                      </h3>
                      <p className="text-sm text-gray-600">{dashboardData.assignedDoctor.Email}</p>
                      <p className="text-sm text-gray-600">{dashboardData.assignedDoctor.PhoneNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Midwife */}
              {dashboardData?.assignedMidwife && (
                <div className="card">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">আপনার মিডওয়াইফ</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dashboardData.assignedMidwife.FullName}
                      </h3>
                      <p className="text-sm text-gray-600">{dashboardData.assignedMidwife.Email}</p>
                      <p className="text-sm text-gray-600">{dashboardData.assignedMidwife.PhoneNumber}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Checkups */}
            {dashboardData?.upcomingCheckups && dashboardData.upcomingCheckups.length > 0 && (
              <div className="card mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">আসন্ন চেকআপ</h2>
                  <button
                    onClick={() => setActiveTab('checkups')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    সব দেখুন →
                  </button>
                </div>
                <div className="space-y-3">
                  {dashboardData.upcomingCheckups.slice(0, 3).map((checkup) => (
                    <div key={checkup._id} className="border-l-4 border-green-500 pl-4 py-3 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{checkup.checkupType}</h3>
                          <p className="text-sm text-gray-600">
                            {checkup.midwifeID?.FullName} এর সাথে
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-700">
                          {new Date(checkup.scheduledDate).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Doctor Advice Tab */}
        {activeTab === 'advice' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">সমস্ত ডাক্তারের পরামর্শ</h2>
            <DoctorAdviceList />
          </div>
        )}

        {/* Health Updates Tab */}
        {activeTab === 'health-updates' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">সমস্ত স্বাস্থ্য আপডেট</h2>
            <HealthUpdatesList />
          </div>
        )}

        {/* Checkups Tab */}
        {activeTab === 'checkups' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">নির্ধারিত চেকআপ</h2>
            {dashboardData?.upcomingCheckups && dashboardData.upcomingCheckups.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingCheckups.map((checkup) => (
                  <div key={checkup._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{checkup.checkupType}</h3>
                        <p className="text-sm text-gray-600">
                          {checkup.midwifeID?.FullName} এর সাথে
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        checkup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        checkup.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {checkup.status === 'pending' ? 'অপেক্ষমাণ' : checkup.status === 'completed' ? 'সম্পন্ন' : checkup.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      নির্ধারিত: {new Date(checkup.scheduledDate).toLocaleDateString('bn-BD')} {new Date(checkup.scheduledDate).toLocaleTimeString('bn-BD')}
                    </p>
                    {checkup.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{checkup.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>কোনো নির্ধারিত চেকআপ নেই</p>
              </div>
            )}
          </div>
        )}

        {/* Emergency Button */}
        <div className="mt-8 card bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">জরুরি সাহায্য প্রয়োজন?</h3>
              <p className="opacity-90">যেকোনো জরুরি পরিস্থিতিতে তাৎক্ষণিক সহায়তার জন্য কল করুন</p>
            </div>
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              জরুরি কল
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MotherDashboard;
