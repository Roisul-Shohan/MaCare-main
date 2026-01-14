import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

/**
 * Midwife Dashboard
 * Dashboard for midwives to manage up to 20 assigned mothers
 */
const MidwifeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedMothers, setAssignedMothers] = useState([]);
  const [pendingCheckups, setPendingCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMother, setSelectedMother] = useState(null);
  const [showHealthUpdateForm, setShowHealthUpdateForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, mothersResponse, checkupsResponse] = await Promise.all([
        api.getMidwifeDashboard(),
        api.getAssignedMothers(),
        api.getPendingCheckups()
      ]);

      setDashboardData(dashResponse.data);
      setAssignedMothers(mothersResponse.data);
      setPendingCheckups(checkupsResponse.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMotherDetails = async (motherId) => {
    try {
      const response = await api.getMotherDetailsByID(motherId);
      setSelectedMother(response.data);
      setShowHealthUpdateForm(false);
    } catch (err) {
      alert('Error loading mother details: ' + err.message);
    }
  };

  const handleCompleteCheckup = async (checkupId) => {
    const notes = prompt('Enter checkup notes:');
    if (!notes) return;

    try {
      await api.completeCheckup(checkupId, notes);
      alert('Checkup marked as completed!');
      fetchDashboardData();
    } catch (err) {
      alert('Error completing checkup: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userRole="midwife" />
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
        <Sidebar userRole="midwife" />
        <main className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ত্রুটি: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="midwife" />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">মিডওয়াইফ ড্যাশবোর্ড</h1>
          <p className="text-gray-600">আপনার নিযুক্ত মা এবং চেকআপ পরিচালনা করুন</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Assigned Mothers Capacity */}
          <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">নিযুক্ত মা</h3>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-2">
              {dashboardData?.capacity || '0/20'}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2" 
                style={{ width: `${(dashboardData?.assignedMothersCount / 20) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm opacity-90">সর্বোচ্চ ২০ জন মা</p>
          </div>

          {/* Today's Checkups */}
          <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">আজকের চেকআপ</h3>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-4xl font-bold">
              {dashboardData?.todaysCheckups?.length || 0}
            </div>
            <p className="mt-2 text-sm opacity-90">আজের জন্য নির্ধারিত</p>
          </div>

          {/* Pending Checkups */}
          <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">অপেক্ষমাণ চেকআপ</h3>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-4xl font-bold">{pendingCheckups.length}</div>
            <p className="mt-2 text-sm opacity-90">আগামী চেকআপ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Mothers List */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              নিযুক্ত মা ({assignedMothers.length}/20)
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignedMothers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">এখনো কোনো মা নিযুক্ত হয়নি</p>
              ) : (
                assignedMothers.map((mother) => (
                  <div 
                    key={mother._id} 
                    className="border-l-4 border-primary-500 pl-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleViewMotherDetails(mother._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{mother.FullName}</h3>
                        <p className="text-sm text-gray-600">{mother.Email}</p>
                        <p className="text-sm text-gray-600">{mother.PhoneNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary-600">
                          সপ্তাহ {mother.pregnancyWeek || 'নেই'}
                        </span>
                        <p className="text-xs text-gray-500">গর্ভাবস্থা</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Checkups */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">অপেক্ষমাণ চেকআপ</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingCheckups.length === 0 ? (
                <p className="text-gray-500 text-center py-8">কোনো অপেক্ষমাণ চেকআপ নেই</p>
              ) : (
                pendingCheckups.map((checkup) => (
                  <div key={checkup._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {checkup.motherID?.FullName || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Type: {checkup.checkupType}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {checkup.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Scheduled: {new Date(checkup.scheduledDate).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => handleCompleteCheckup(checkup._id)}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Mother Details Modal */}
        {selectedMother && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMother.motherDetails?.FullName}
                </h2>
                <button 
                  onClick={() => setSelectedMother(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Mother Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedMother.motherDetails?.Email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedMother.motherDetails?.PhoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Maternal Record */}
                {selectedMother.maternalRecord && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Pregnancy Information</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">LMP Date</p>
                        <p className="font-medium">
                          {new Date(selectedMother.maternalRecord.pregnancy.lmpDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">EDD</p>
                        <p className="font-medium">
                          {new Date(selectedMother.maternalRecord.pregnancy.edd).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pregnancy Week</p>
                        <p className="font-medium text-primary-600">
                          Week {selectedMother.pregnancyWeek}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Updates */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">Health Updates</h3>
                  {selectedMother.healthUpdates?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMother.healthUpdates.slice(0, 3).map((update) => (
                        <div key={update._id} className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-gray-600">
                            {new Date(update.createdAt).toLocaleDateString()} - 
                            BP: {update.vitalSigns?.bloodPressure}, 
                            Weight: {update.vitalSigns?.weight}kg
                          </p>
                          <p className="text-sm">{update.findings}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No health updates yet</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowHealthUpdateForm(true)}
                    className="btn-primary"
                  >
                    Add Health Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MidwifeDashboard;
