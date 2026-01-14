import React from 'react';

/**
 * Login Page
 * User authentication page with role-based login
 */
const Login = () => {
  const [userRole, setUserRole] = React.useState('mother');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">MaCare</h1>
          <p className="text-gray-600">মা ও শিশু যত্ন</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">লগইন করুন</h2>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              আপনি কে?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserRole('mother')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userRole === 'mother'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">মা</span>
              </button>
              <button
                onClick={() => setUserRole('doctor')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userRole === 'doctor'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <span className="font-semibold">ডাক্তার/মিডওয়াইফ</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মোবাইল নম্বর
              </label>
              <input
                type="tel"
                placeholder="০১৭XXXXXXXX"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                placeholder="আপনার পাসওয়ার্ড"
                className="input-field"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-700">মনে রাখুন</span>
              </label>
              <a href="#forgot" className="text-primary-600 hover:text-primary-700">
                পাসওয়ার্ড ভুলে গেছেন?
              </a>
            </div>

            <button type="submit" className="w-full btn-primary">
              লগইন করুন
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              নতুন ব্যবহারকারী?{' '}
              <a href="#register" className="text-primary-600 hover:text-primary-700 font-semibold">
                রেজিস্টার করুন
              </a>
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            জরুরি সাহায্য প্রয়োজন?{' '}
            <a href="tel:999" className="text-red-600 font-bold">
              ৯৯৯
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
