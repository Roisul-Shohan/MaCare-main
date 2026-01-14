import React from 'react';
import Sidebar from '../components/Sidebar';

/**
 * Doctor/Midwife Dashboard
 * Dashboard for healthcare providers to manage patients and appointments
 */
const DoctorDashboard = () => {
  // Mock data
  const totalPatients = 45;
  const highRiskPatients = 8;
  const todayAppointments = 6;

  const patients = [
    { name: 'রহিমা খাতুন', age: 28, week: 24, risk: 'normal', lastVisit: 'জানুয়ারি ২০', nextVisit: 'ফেব্রুয়ারি ১৫' },
    { name: 'সালমা আক্তার', age: 32, week: 36, risk: 'high', lastVisit: 'জানুয়ারি ২৫', nextVisit: 'ফেব্রুয়ারি ০৫' },
    { name: 'নাসরিন বেগম', age: 25, week: 16, risk: 'normal', lastVisit: 'জানুয়ারি ১৮', nextVisit: 'ফেব্রুয়ারি ২০' },
    { name: 'শাপলা খাতুন', age: 35, week: 32, risk: 'high', lastVisit: 'জানুয়ারি ২৮', nextVisit: 'ফেব্রুয়ারি ১০' },
  ];

  const todaySchedule = [
    { time: '১০:০০', patient: 'রহিমা খাতুন', type: 'নিয়মিত চেকআপ', status: 'confirmed' },
    { time: '১১:০০', patient: 'সালমা আক্তার', type: 'জরুরি কনসালটেশন', status: 'confirmed' },
    { time: '১২:৩০', patient: 'ফারজানা আহমেদ', type: 'ফলোআপ', status: 'pending' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="doctor" />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">স্বাগতম, ডা. করিম!</h1>
          <p className="text-gray-600">আজকের তারিখ: জানুয়ারি ১৪, ২০২৬</p>
        </div>

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
            <p className="mt-2 text-sm opacity-90">নির্ধারিত সাক্ষাৎ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-2 card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">রোগীদের তালিকা</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                সব দেখুন →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="pb-3">নাম</th>
                    <th className="pb-3">বয়স</th>
                    <th className="pb-3">সপ্তাহ</th>
                    <th className="pb-3">ঝুঁকি</th>
                    <th className="pb-3">পরবর্তী ভিজিট</th>
                    <th className="pb-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-medium text-gray-900">{patient.name}</td>
                      <td className="py-4 text-gray-700">{patient.age}</td>
                      <td className="py-4 text-gray-700">{patient.week}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          patient.risk === 'high' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {patient.risk === 'high' ? 'উচ্চ ঝুঁকি' : 'স্বাভাবিক'}
                        </span>
                      </td>
                      <td className="py-4 text-gray-700">{patient.nextVisit}</td>
                      <td className="py-4">
                        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                          বিস্তারিত
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">আজকের সময়সূচী</h2>
            <div className="space-y-4">
              {todaySchedule.map((schedule, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4 py-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{schedule.patient}</h3>
                    <span className="text-sm font-bold text-primary-600">{schedule.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{schedule.type}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    schedule.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {schedule.status === 'confirmed' ? 'নিশ্চিত' : 'অপেক্ষমাণ'}
                  </span>
                </div>
              ))}
              <button className="w-full btn-primary text-sm py-2">
                নতুন অ্যাপয়েন্টমেন্ট
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button className="card hover:shadow-xl transition-shadow flex items-center justify-center space-x-3 py-6">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            <span className="font-semibold text-gray-900">নতুন রোগী যুক্ত করুন</span>
          </button>
          
          <button className="card hover:shadow-xl transition-shadow flex items-center justify-center space-x-3 py-6">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            <span className="font-semibold text-gray-900">মেসেজ পাঠান</span>
          </button>
          
          <button className="card hover:shadow-xl transition-shadow flex items-center justify-center space-x-3 py-6">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="font-semibold text-gray-900">রিপোর্ট দেখুন</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
