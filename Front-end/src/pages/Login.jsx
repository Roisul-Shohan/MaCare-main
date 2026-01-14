import React from 'react';
import { useAuth } from '../utils/AuthContext';

/**
 * Login Page
 * User authentication page with role-based login
 */
const Login = ({ onNavigate }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Navigate based on user role
        if (result.user.Role === 'mother') {
          onNavigate('mother-dashboard');
        } else if (result.user.Role === 'doctor') {
          onNavigate('doctor-dashboard');
        } else if (result.user.Role === 'midWife') {
          onNavigate('midwife-dashboard');
        } else {
          onNavigate('landing');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড"
                className="input-field"
                required
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

            <button 
              type="submit" 
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              নতুন ব্যবহারকারী?{' '}
              <button 
                onClick={() => onNavigate('register')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                রেজিস্টার করুন
              </button>
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
