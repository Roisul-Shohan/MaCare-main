import React from 'react';

/**
 * Register Page
 * User registration with role selection
 */
const Register = () => {
  const [userRole, setUserRole] = React.useState('mother');
  const [currentStep, setCurrentStep] = React.useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">MaCare</h1>
          <p className="text-gray-600">মা ও শিশু যত্ন</p>
        </div>

        {/* Registration Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">রেজিস্টার করুন</h2>
          <p className="text-gray-600 text-center mb-6">আপনার তথ্য দিয়ে একাউন্ট তৈরি করুন</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">আপনি কে?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setUserRole('mother')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    userRole === 'mother'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <svg className="w-16 h-16 mx-auto mb-3 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-bold text-gray-900 mb-2">মা</h4>
                  <p className="text-sm text-gray-600">গর্ভবতী মা বা নবজাতকের মা</p>
                </button>

                <button
                  onClick={() => setUserRole('doctor')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    userRole === 'doctor'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <svg className="w-16 h-16 mx-auto mb-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <h4 className="font-bold text-gray-900 mb-2">ডাক্তার/মিডওয়াইফ</h4>
                  <p className="text-sm text-gray-600">স্বাস্থ্য সেবা প্রদানকারী</p>
                </button>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full btn-primary"
              >
                পরবর্তী
              </button>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">ব্যক্তিগত তথ্য</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ণ নাম</label>
                  <input type="text" placeholder="আপনার নাম লিখুন" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মোবাইল নম্বর</label>
                  <input type="tel" placeholder="০১৭XXXXXXXX" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বয়স</label>
                  <input type="number" placeholder="আপনার বয়স" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ঠিকানা</label>
                  <textarea placeholder="আপনার ঠিকানা লিখুন" className="input-field" rows="3"></textarea>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 btn-outline"
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 btn-primary"
                  >
                    পরবর্তী
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Account Setup */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">একাউন্ট সেটআপ</h3>
              <form className="space-y-4">
                {userRole === 'mother' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">গর্ভাবস্থার সপ্তাহ (যদি প্রযোজ্য হয়)</label>
                    <input type="number" placeholder="সপ্তাহ সংখ্যা" className="input-field" />
                  </div>
                )}

                {userRole === 'doctor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">পেশাদার শংসাপত্র নম্বর</label>
                      <input type="text" placeholder="লাইসেন্স/সার্টিফিকেট নম্বর" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">বিশেষত্ব</label>
                      <select className="input-field">
                        <option>প্রসূতি বিশেষজ্ঞ</option>
                        <option>শিশু বিশেষজ্ঞ</option>
                        <option>মিডওয়াইফ</option>
                        <option>সাধারণ চিকিৎসক</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড</label>
                  <input type="password" placeholder="নিরাপদ পাসওয়ার্ড তৈরি করুন" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input type="password" placeholder="পাসওয়ার্ড পুনরায় লিখুন" className="input-field" />
                </div>

                <div className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-2" />
                  <label className="text-sm text-gray-700">
                    আমি{' '}
                    <a href="#terms" className="text-primary-600 hover:text-primary-700">শর্তাবলী</a>
                    {' '}এবং{' '}
                    <a href="#privacy" className="text-primary-600 hover:text-primary-700">গোপনীয়তা নীতি</a>
                    {' '}সম্মত
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 btn-outline"
                  >
                    পূর্ববর্তী
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    রেজিস্টার সম্পূর্ণ করুন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ইতিমধ্যে একাউন্ট আছে?{' '}
              <a href="#login" className="text-primary-600 hover:text-primary-700 font-semibold">
                লগইন করুন
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
