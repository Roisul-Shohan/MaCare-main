import React from 'react';

/**
 * Feature Cards Component
 * Displays key features of MaCare platform
 */
const FeatureCards = () => {
  const features = [
    {
      title: 'গর্ভাবস্থার যত্ন',
      description: 'সপ্তাহ অনুযায়ী গর্ভাবস্থার তথ্য, পুষ্টি পরামর্শ এবং নিয়মিত চেকআপ রিমাইন্ডার',
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'শিশুর পুষ্টি ও বৃদ্ধি',
      description: 'নবজাতকের ওজন, উচ্চতা ট্র্যাকিং এবং বয়স অনুযায়ী পুষ্টি নির্দেশনা',
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'টিকা ও চেকআপ রিমাইন্ডার',
      description: 'সময়মত টিকা দেওয়া এবং ডাক্তারের অ্যাপয়েন্টমেন্ট মনে করিয়ে দেওয়া',
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'পরিবার পরিকল্পনা',
      description: 'পরিবার পরিকল্পনা পরামর্শ এবং প্রয়োজনীয় তথ্য ও সেবার সহজ প্রবেশ',
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            আমাদের সেবাসমূহ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            মা এবং শিশুর সুস্বাস্থ্য নিশ্চিত করতে সব ধরনের প্রয়োজনীয় সেবা এক জায়গায়
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover:scale-105 transition-transform duration-200"
            >
              <div className={`bg-gradient-to-br ${feature.color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
