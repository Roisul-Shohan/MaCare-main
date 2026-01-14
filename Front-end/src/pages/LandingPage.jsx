import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import Footer from '../components/Footer';

/**
 * Landing Page
 * Main entry point for MaCare website
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <FeatureCards />
      
      {/* Statistics Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            আমাদের প্রভাব
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">১০,০০০+</div>
              <p className="text-xl opacity-90">নিবন্ধিত মা</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">৫০০+</div>
              <p className="text-xl opacity-90">ডাক্তার ও মিডওয়াইফ</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">৯৮%</div>
              <p className="text-xl opacity-90">সন্তুষ্ট ব্যবহারকারী</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            ব্যবহারকারীদের মতামত
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  র
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">রহিমা খাতুন</h4>
                  <p className="text-sm text-gray-600">মা</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "MaCare আমাকে গর্ভাবস্থায় প্রতিটি পদক্ষেপে সাহায্য করেছে। ডাক্তারের সাথে সহজে যোগাযোগ এবং সময়মত রিমাইন্ডার পাওয়া খুবই উপকারী।"
              </p>
              <div className="mt-4 text-yellow-500">★★★★★</div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  ড
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">ডা. ফাতিমা আহমেদ</h4>
                  <p className="text-sm text-gray-600">প্রসূতি বিশেষজ্ঞ</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "এই প্ল্যাটফর্ম আমার রোগীদের ট্র্যাক রাখা এবং তাদের সাথে নিয়মিত যোগাযোগ রাখা অনেক সহজ করে দিয়েছে।"
              </p>
              <div className="mt-4 text-yellow-500">★★★★★</div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  স
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">সালমা বেগম</h4>
                  <p className="text-sm text-gray-600">মা</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "আমার শিশুর টিকার সময়সূচী এবং বৃদ্ধি ট্র্যাক করা এখন খুব সহজ। প্রতিটি মায়ের জন্য এটি অপরিহার্য!"
              </p>
              <div className="mt-4 text-yellow-500">★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            আজই যোগ দিন MaCare পরিবারে
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            বাংলাদেশের সবচেয়ে বিশ্বস্ত মা ও শিশু স্বাস্থ্য প্ল্যাটফর্মে আপনাকে স্বাগতম
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg">
              মা হিসেবে রেজিস্টার করুন
            </button>
            <button className="btn-secondary text-lg">
              ডাক্তার হিসেবে যোগ দিন
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
