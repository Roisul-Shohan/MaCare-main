import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Users, AlertCircle, CheckCircle, Calendar, TrendingUp, Activity } from 'lucide-react';

const MidwifeDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, search, missed, motherDetails
  const [dashboardStats, setDashboardStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [missedCheckups, setMissedCheckups] = useState([]);
  const [selectedMother, setSelectedMother] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkupForm, setCheckupForm] = useState({
    systolic: '',
    diastolic: '',
    weight: '',
    height: '',
    notes: ''
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/midwife/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok && data.Success) {
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(
        `${API_BASE_URL}/midwife/search-mothers?village=${encodeURIComponent(searchQuery)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      if (response.ok && data.Success) {
        setSearchResults(data.data);
        setActiveView('search');
      }
    } catch (error) {
      console.error('Error searching mothers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissedCheckups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/midwife/missed-checkups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok && data.Success) {
        setMissedCheckups(data.data);
        setActiveView('missed');
      }
    } catch (error) {
      console.error('Error fetching missed checkups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMotherDetails = async (motherID) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/midwife/mother/${motherID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok && data.Success) {
        setSelectedMother(data.data);
        setActiveView('motherDetails');
      }
    } catch (error) {
      console.error('Error fetching mother details:', error);
      alert('মায়ের তথ্য লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckupSubmit = async (e) => {
    e.preventDefault();
    
    if (!checkupForm.systolic || !checkupForm.diastolic || !checkupForm.weight) {
      alert('রক্তচাপ এবং ওজন অবশ্যই প্রদান করতে হবে');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(
        `${API_BASE_URL}/midwife/mother/${selectedMother.motherInfo._id}/checkup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(checkupForm)
        }
      );
      
      const data = await response.json();
      if (response.ok && data.Success) {
        alert('চেকআপ সফলভাবে সংরক্ষিত হয়েছে');
        setCheckupForm({ systolic: '', diastolic: '', weight: '', height: '', notes: '' });
        fetchMotherDetails(selectedMother.motherInfo._id); // Refresh
      } else {
        alert(data.Message || 'চেকআপ সংরক্ষণে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error submitting checkup:', error);
      alert('চেকআপ সংরক্ষণে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    const { village, upazilla, zilla } = address;
    return [village, upazilla, zilla].filter(Boolean).join(', ') || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="midwife" onNavigate={(action) => {
        if (action === 'dashboard') setActiveView('dashboard');
      }} />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ধাত্রীর ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-2">সাপ্তাহিক চেকআপ পরিচালনা করুন</p>
          </div>

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8" />
                    <span className="text-3xl font-bold">{dashboardStats?.totalMothers || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium opacity-90">মোট মা</h3>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8" />
                    <span className="text-3xl font-bold">{dashboardStats?.checkupsThisWeek || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium opacity-90">এই সপ্তাহে চেকআপ</h3>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8" />
                    <span className="text-3xl font-bold">{dashboardStats?.checkupsToday || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium opacity-90">আজকের চেকআপ</h3>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <AlertCircle className="w-8 h-8" />
                    <span className="text-3xl font-bold">{dashboardStats?.mothersMissedCheckup || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium opacity-90">মিসড চেকআপ</h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                  onClick={fetchMissedCheckups}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-red-200 hover:border-red-400"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">মিসড চেকআপের তালিকা</h3>
                      <p className="text-gray-600">যারা এই সপ্তাহে চেকআপ করাননি</p>
                    </div>
                  </div>
                </button>

                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-200">
                  <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        গ্রামের নাম দিয়ে খুঁজুন
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="গ্রামের নাম লিখুন..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="self-end px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Recent Checkups */}
              {dashboardStats?.recentCheckups && dashboardStats.recentCheckups.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">সাম্প্রতিক চেকআপ</h2>
                  <div className="space-y-3">
                    {dashboardStats.recentCheckups.map((checkup) => (
                      <div key={checkup._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900">{checkup.motherID?.FullName}</h3>
                            <p className="text-sm text-gray-600">{formatAddress(checkup.motherID?.address)}</p>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(checkup.checkupDate)}</span>
                        </div>
                        <div className="mt-3 flex gap-4 text-sm">
                          <span className="text-gray-700">
                            <strong>BP:</strong> {checkup.bloodPressure?.systolic}/{checkup.bloodPressure?.diastolic}
                          </span>
                          <span className="text-gray-700">
                            <strong>ওজন:</strong> {checkup.weight} কেজি
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Search Results View */}
          {activeView === 'search' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">অনুসন্ধান ফলাফল</h2>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ← ড্যাশবোর্ডে ফিরে যান
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">কোনো মা পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((mother) => (
                    <div
                      key={mother._id}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => fetchMotherDetails(mother._id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{mother.FullName}</h3>
                          <p className="text-sm text-gray-600">{formatAddress(mother.address)}</p>
                        </div>
                        {mother.hasCheckupThisWeek ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            ✓ চেকআপ হয়েছে
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            চেকআপ বাকি
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>ফোন:</strong> {mother.PhoneNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>রক্তের গ্রুপ:</strong> {mother.BloodGroup || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Missed Checkups View */}
          {activeView === 'missed' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">মিসড চেকআপের তালিকা</h2>
                  <p className="text-gray-600">এই সপ্তাহে যারা চেকআপ করাননি</p>
                </div>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ← ড্যাশবোর্ডে ফিরে যান
                </button>
              </div>

              {missedCheckups.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">সবাই এই সপ্তাহে চেকআপ করেছেন!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {missedCheckups.map((mother) => (
                    <div
                      key={mother._id}
                      className="border-2 border-red-200 rounded-xl p-6 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer bg-red-50"
                      onClick={() => fetchMotherDetails(mother._id)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{mother.FullName}</h3>
                          <p className="text-sm text-gray-600">{formatAddress(mother.address)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>ফোন:</strong> {mother.PhoneNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>রক্তের গ্রুপ:</strong> {mother.BloodGroup || 'N/A'}
                      </p>
                      <button className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        চেকআপ করুন
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mother Details View */}
          {activeView === 'motherDetails' && selectedMother && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">মায়ের বিস্তারিত তথ্য</h2>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  ← ড্যাশবোর্ডে ফিরে যান
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mother Info */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">ব্যক্তিগত তথ্য</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">নাম</p>
                      <p className="font-semibold text-gray-900">{selectedMother.motherInfo.FullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ফোন নম্বর</p>
                      <p className="font-semibold text-gray-900">{selectedMother.motherInfo.PhoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">রক্তের গ্রুপ</p>
                      <p className="font-semibold text-gray-900">{selectedMother.motherInfo.BloodGroup || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ঠিকানা</p>
                      <p className="font-semibold text-gray-900">{formatAddress(selectedMother.motherInfo.address)}</p>
                    </div>
                    {selectedMother.maternalRecord && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">গর্ভাবস্থার সপ্তাহ</p>
                          <p className="font-semibold text-gray-900">{selectedMother.maternalRecord.pregnancyWeek} সপ্তাহ</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">প্রত্যাশিত প্রসবের তারিখ</p>
                          <p className="font-semibold text-gray-900">{formatDate(selectedMother.maternalRecord.edd)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Checkup Form or Status */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedMother.hasCheckupThisWeek ? (
                    <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-900 mb-2">চেকআপ সম্পন্ন হয়েছে</h3>
                      <p className="text-green-700 mb-4">এই মায়ের এই সপ্তাহের চেকআপ ইতিমধ্যে সম্পন্ন হয়েছে</p>
                      <p className="text-sm text-green-600">পরবর্তী চেকআপ: আগামী সপ্তাহ</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">নতুন চেকআপ যোগ করুন</h3>
                      <form onSubmit={handleCheckupSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              সিস্টোলিক BP (mmHg) *
                            </label>
                            <input
                              type="number"
                              value={checkupForm.systolic}
                              onChange={(e) => setCheckupForm({...checkupForm, systolic: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="120"
                              min="70"
                              max="250"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ডায়াস্টোলিক BP (mmHg) *
                            </label>
                            <input
                              type="number"
                              value={checkupForm.diastolic}
                              onChange={(e) => setCheckupForm({...checkupForm, diastolic: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="80"
                              min="40"
                              max="180"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              ওজন (কেজি) *
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={checkupForm.weight}
                              onChange={(e) => setCheckupForm({...checkupForm, weight: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="65.5"
                              min="30"
                              max="200"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              উচ্চতা (সেমি)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={checkupForm.height}
                              onChange={(e) => setCheckupForm({...checkupForm, height: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="160"
                              min="100"
                              max="250"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            নোট
                          </label>
                          <textarea
                            value={checkupForm.notes}
                            onChange={(e) => setCheckupForm({...checkupForm, notes: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="অতিরিক্ত পর্যবেক্ষণ বা মন্তব্য..."
                            maxLength="1000"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
                        >
                          {loading ? 'সংরক্ষণ হচ্ছে...' : 'চেকআপ সংরক্ষণ করুন'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Doctor's Advice */}
                  {selectedMother.doctorAdvice && selectedMother.doctorAdvice.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">ডাক্তারের পরামর্শ</h3>
                      <div className="space-y-3">
                        {selectedMother.doctorAdvice.map((advice) => (
                          <div key={advice._id} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold text-blue-900">
                                {advice.doctorID?.FullName || 'ডাক্তার'}
                              </p>
                              <span className="text-xs text-blue-600">{formatDate(advice.createdAt)}</span>
                            </div>
                            <p className="text-gray-800">{advice.advice}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Checkups */}
                  {selectedMother.previousCheckups && selectedMother.previousCheckups.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">পূর্ববর্তী চেকআপের ইতিহাস</h3>
                      <div className="space-y-3">
                        {selectedMother.previousCheckups.map((checkup) => (
                          <div key={checkup._id} className="border-2 border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  সপ্তাহ {checkup.weekNumber}, {checkup.year}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {checkup.midwifeID?.FullName || 'ধাত্রী'}
                                </p>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(checkup.checkupDate)}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600">রক্তচাপ</p>
                                <p className="font-semibold text-gray-900">
                                  {checkup.bloodPressure?.systolic}/{checkup.bloodPressure?.diastolic}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">ওজন</p>
                                <p className="font-semibold text-gray-900">{checkup.weight} কেজি</p>
                              </div>
                              {checkup.height && (
                                <div>
                                  <p className="text-gray-600">উচ্চতা</p>
                                  <p className="font-semibold text-gray-900">{checkup.height} সেমি</p>
                                </div>
                              )}
                            </div>
                            {checkup.notes && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                {checkup.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && activeView === 'dashboard' && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">লোড হচ্ছে...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MidwifeDashboard;
