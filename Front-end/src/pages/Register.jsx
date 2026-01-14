import React from 'react';
import { useAuth } from '../utils/AuthContext';

const Register = ({ onNavigate }) => {
  const [userRole, setUserRole] = React.useState('mother');
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    FullName: '',
    UserName: '',
    Email: '',
    Gender: '',
    Password: '',
    confirmPassword: '',
    PhoneNumber: '',
    DateOfBirth: '',
    BloodGroup: '',
    village: '',
    upazilla: '',
    zilla: '',
    ProfileImage: null,
  });

  const { register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, ProfileImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.Password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('FullName', formData.FullName);
      submitData.append('UserName', formData.UserName);
      submitData.append('Email', formData.Email);
      submitData.append('Gender', formData.Gender);
      submitData.append('Password', formData.Password);
      submitData.append('PhoneNumber', formData.PhoneNumber);
      submitData.append('Role', userRole);
      submitData.append('DateOfBirth', formData.DateOfBirth);
      submitData.append('BloodGroup', formData.BloodGroup);
      submitData.append('village', formData.village);
      submitData.append('upazilla', formData.upazilla);
      submitData.append('zilla', formData.zilla);
      if (formData.ProfileImage) {
        submitData.append('ProfileImage', formData.ProfileImage);
      }

      const result = await register(submitData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">MaCare</h1>
          <p className="text-gray-600">মা ও শিশু যত্ন</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">রেজিস্টার করুন</h2>
          <p className="text-gray-600 text-center mb-6">আপনার তথ্য দিয়ে একাউন্ট তৈরি করুন</p>

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
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4">
              Registration successful! Redirecting to login...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">আপনি কে?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setUserRole('mother')}
                  type="button"
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
                  type="button"
                  className={`p-6 rounded-lg border-2 transition-all ${
                    userRole === 'doctor'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <svg className="w-16 h-16 mx-auto mb-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <h4 className="font-bold text-gray-900 mb-2">ডাক্তার</h4>
                  <p className="text-sm text-gray-600">চিকিৎসক</p>
                </button>

                <button
                  onClick={() => setUserRole('midWife')}
                  type="button"
                  className={`p-6 rounded-lg border-2 transition-all ${
                    userRole === 'midWife'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <svg className="w-16 h-16 mx-auto mb-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <h4 className="font-bold text-gray-900 mb-2">মিডওয়াইফ</h4>
                  <p className="text-sm text-gray-600">ধাত্রী</p>
                </button>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                type="button"
                className="w-full btn-primary"
              >
                পরবর্তী
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">ব্যক্তিগত তথ্য</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ণ নাম *</label>
                    <input
                      type="text"
                      name="FullName"
                      value={formData.FullName}
                      onChange={handleInputChange}
                      placeholder="Your Full Name"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ইউজারনেম *</label>
                    <input 
                      type="text" 
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleInputChange}
                      placeholder="username" 
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল *</label>
                    <input 
                      type="email" 
                      name="Email"
                      value={formData.Email}
                      onChange={handleInputChange}
                      placeholder="your@email.com" 
                      className="input-field"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর *</label>
                    <input 
                      type="tel" 
                      name="PhoneNumber"
                      value={formData.PhoneNumber}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX" 
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জন্ম তারিখ *</label>
                    <input
                      type="date"
                      name="DateOfBirth"
                      value={formData.DateOfBirth}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">লিঙ্গ *</label>
                    <select 
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="Male">পুরুষ</option>
                      <option value="Female">মহিলা</option>
                      <option value="Other">অন্যান্য</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">রক্তের গ্রুপ</label>
                    <select 
                      name="BloodGroup"
                      value={formData.BloodGroup}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">গ্রাম *</label>
                    <input 
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      placeholder="গ্রামের নাম লিখুন" 
                      className="input-field" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">উপজেলা *</label>
                    <input 
                      type="text"
                      name="upazilla"
                      value={formData.upazilla}
                      onChange={handleInputChange}
                      placeholder="উপজেলার নাম লিখুন" 
                      className="input-field" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জেলা *</label>
                    <input 
                      type="text"
                      name="zilla"
                      value={formData.zilla}
                      onChange={handleInputChange}
                      placeholder="জেলার নাম লিখুন" 
                      className="input-field" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড *</label>
                    <input 
                      type="password"
                      name="Password"
                      value={formData.Password}
                      onChange={handleInputChange}
                      placeholder="কমপক্ষে ৩ অক্ষর" 
                      className="input-field"
                      required
                      minLength="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড নিশ্চিত করুন *</label>
                    <input 
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="পাসওয়ার্ড আবার লিখুন" 
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    প্রোফাইল ছবি (ঐচ্ছিক)
                  </label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="input-field"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 btn-outline"
                    disabled={loading}
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্টার করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ইতিমধ্যে একাউন্ট আছে?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                লগইন করুন
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            জরুরি সাহায্য প্রয়োজন?{' '}
            <span className="text-primary-600 font-semibold">১০৬</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
