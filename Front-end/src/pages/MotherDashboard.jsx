import React from 'react';
import Sidebar from '../components/Sidebar';

/**
 * Mother Dashboard
 * Main dashboard for pregnant mothers with pregnancy tracking, appointments, and health info
 */
const MotherDashboard = () => {
  // Mock data
  const pregnancyWeek = 24;
  const nextAppointment = 'ফেব্রুয়ারি ১৫, ২০২৬';
  const vaccinesDue = 2;

  const appointments = [
    { date: 'ফেব্রুয়ারি ১৫', doctor: 'ডা. ফাতিমা', type: 'নিয়মিত চেকআপ', time: 'সকাল ১০:০০' },
    { date: 'মার্চ ০১', doctor: 'মিসেস রহিমা (মিডওয়াইফ)', type: 'আল্ট্রাসাউন্ড', time: 'বিকাল ৩:০০' },
  ];

  const messages = [
    { from: 'ডা. ফাতিমা', message: 'আয়রন ট্যাবলেট নিয়মিত খাবেন', time: '২ ঘণ্টা আগে', unread: true },
    { from: 'মিডওয়াইফ রহিমা', message: 'পরবর্তী ভিজিটের জন্য প্রস্তুত থাকুন', time: '১ দিন আগে', unread: false },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="mother" />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">স্বাগতম, রহিমা!</h1>
          <p className="text-gray-600">আপনার এবং আপনার শিশুর স্বাস্থ্য ট্র্যাকিং</p>
        </div>

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
            <div className="text-2xl font-bold mb-1">{nextAppointment}</div>
            <p className="text-sm opacity-90">ডা. ফাতিমার সাথে</p>
          </div>

          {/* Vaccines Due */}
          <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">আসন্ন টিকা</h3>
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
          {/* Upcoming Appointments */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">আসন্ন অ্যাপয়েন্টমেন্ট</h2>
            <div className="space-y-4">
              {appointments.map((apt, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{apt.type}</h3>
                    <span className="text-sm text-gray-600">{apt.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{apt.doctor}</p>
                  <p className="text-sm text-primary-600 font-medium">{apt.date}</p>
                </div>
              ))}
              <button className="w-full btn-outline text-sm py-2">
                সব দেখুন
              </button>
            </div>
          </div>

          {/* Messages from Doctor/Midwife */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">মেসেজ</h2>
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${msg.unread ? 'bg-primary-50 border-l-4 border-primary-500' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{msg.from}</h3>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                </div>
              ))}
              <button className="w-full btn-outline text-sm py-2">
                সব মেসেজ দেখুন
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        <div className="mt-8 card bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">জরুরি সহায়তা প্রয়োজন?</h3>
              <p className="opacity-90">যেকোনো জরুরি পরিস্থিতিতে তাৎক্ষণিক সাহায্যের জন্য কল করুন</p>
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
