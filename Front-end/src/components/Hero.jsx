import React from 'react';

/**
 * Hero Section Component
 * Main landing page hero with headline and CTA buttons
 */
const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            মা ও নবজাতকের যত্নে
            <br />
            <span className="text-primary-600">আপনার ডিজিটাল সহকারী</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            গর্ভাবস্থা থেকে শিশুর বৃদ্ধি - প্রতিটি পদক্ষেপে বিশেষজ্ঞ পরামর্শ, রিমাইন্ডার এবং 
            স্বাস্থ্য পরিসেবা। ডাক্তার ও মিডওয়াইফদের সাথে সরাসরি যোগাযোগ করুন।
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-primary text-lg w-full sm:w-auto flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              মা হিসেবে যোগ দিন
            </button>
            <button className="btn-outline text-lg w-full sm:w-auto flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              ডাক্তার/মিডওয়াইফ হিসেবে যোগ দিন
            </button>
          </div>

          {/* Hero Image / Illustration Placeholder */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-primary-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <p className="text-gray-600 font-medium">মা ও শিশুর স্বাস্থ্য পরিচর্যা</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
