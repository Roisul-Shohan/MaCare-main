import React, { useState } from 'react';
import api from '../utils/api';

/**
 * DoctorSearchAndAdvice Component
 * Allows doctors to search for mothers and send categorized advice
 */
const DoctorSearchAndAdvice = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMother, setSelectedMother] = useState(null);
  const [motherDetails, setMotherDetails] = useState(null);
  const [showAdviceForm, setShowAdviceForm] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [adviceForm, setAdviceForm] = useState({
    adviceType: 'general',
    priority: 'medium',
    subject: '',
    message: '',
    followupRequired: false,
    followupDate: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await api.searchMothers(searchQuery);
      setSearchResults(response.data || []);
    } catch (err) {
      alert('Error searching mothers: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMother = async (mother) => {
    try {
      setLoading(true);
      const response = await api.getMotherByEmail(mother.Email);
      setMotherDetails(response.data);
      setSelectedMother(mother);
      setShowAdviceForm(false);
    } catch (err) {
      alert('Error loading mother details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAdvice = async (e) => {
    e.preventDefault();
    
    if (!adviceForm.subject || !adviceForm.message) {
      alert('Please fill in subject and message');
      return;
    }

    try {
      setLoading(true);
      await api.sendAdviceToMother({
        motherID: selectedMother._id,
        ...adviceForm
      });
      alert('Advice sent successfully!');
      setShowAdviceForm(false);
      setAdviceForm({
        adviceType: 'general',
        priority: 'medium',
        subject: '',
        message: '',
        followupRequired: false,
        followupDate: ''
      });
      // Reload mother details to show new advice
      handleSelectMother(selectedMother);
    } catch (err) {
      alert('Error sending advice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">নাম, ইমেইল, বা ফোন দিয়ে মা খুঁজুন</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইমেইল, বা ফোন নম্বর লিখুন..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={searching}
            className="btn-primary px-6"
          >
            {searching ? 'খুঁজছি...' : 'খুঁজুন'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-gray-700">অনুসন্ধান ফলাফল ({searchResults.length})</h3>
            {searchResults.map((mother) => (
              <div
                key={mother._id}
                onClick={() => handleSelectMother(mother)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{mother.FullName}</h4>
                    <p className="text-sm text-gray-600">{mother.Email}</p>
                    <p className="text-sm text-gray-600">{mother.PhoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary-600">
                      সপ্তাহ {mother.pregnancyWeek || 'নেই'}
                    </span>
                    <p className="text-xs text-gray-500">গর্ভাবস্থা</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !searching && (
          <p className="text-gray-500 text-center py-4">কোনো মা পাওয়া যায়নি</p>
        )}
      </div>

      {/* Mother Details */}
      {motherDetails && (
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{motherDetails.FullName}</h2>
              <p className="text-gray-600">{motherDetails.Email} • {motherDetails.PhoneNumber}</p>
            </div>
            <button
              onClick={() => setShowAdviceForm(!showAdviceForm)}
              className="btn-primary"
            >
              {showAdviceForm ? 'বাতিল' : 'পরামর্শ পাঠান'}
            </button>
          </div>

          {/* Advice Form */}
          {showAdviceForm && (
            <form onSubmit={handleSendAdvice} className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-gray-900 mb-4">পরামর্শ পাঠান</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    পরামর্শের ধরন
                  </label>
                  <select
                    value={adviceForm.adviceType}
                    onChange={(e) => setAdviceForm({...adviceForm, adviceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="general">সাধারণ</option>
                    <option value="medication">ঔষধ</option>
                    <option value="diet">খাদ্য</option>
                    <option value="exercise">ব্যায়াম</option>
                    <option value="emergency">জরুরি</option>
                    <option value="followup">ফলোআপ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    গুরুত্ব
                  </label>
                  <select
                    value={adviceForm.priority}
                    onChange={(e) => setAdviceForm({...adviceForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">নিম্ন</option>
                    <option value="medium">মাঝারি</option>
                    <option value="high">উচ্চ</option>
                    <option value="urgent">জরুরি</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  বিষয়
                </label>
                <input
                  type="text"
                  value={adviceForm.subject}
                  onChange={(e) => setAdviceForm({...adviceForm, subject: e.target.value})}
                  placeholder="যেমন: আয়রন সাপ্লিমেন্টের প্রেসক্রিপশন"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  বার্তা
                </label>
                <textarea
                  value={adviceForm.message}
                  onChange={(e) => setAdviceForm({...adviceForm, message: e.target.value})}
                  placeholder="আপনার পরামর্শের বার্তা লিখুন..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={adviceForm.followupRequired}
                    onChange={(e) => setAdviceForm({...adviceForm, followupRequired: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">ফলোআপ প্রয়োজন</span>
                </label>
              </div>

              {adviceForm.followupRequired && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ফলোআপের তারিখ
                  </label>
                  <input
                    type="date"
                    value={adviceForm.followupDate}
                    onChange={(e) => setAdviceForm({...adviceForm, followupDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required={adviceForm.followupRequired}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'পাঠাচ্ছি...' : 'পরামর্শ পাঠান'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdviceForm(false)}
                  className="btn-outline flex-1"
                >
                  বাতিল
                </button>
              </div>
            </form>
          )}

          {/* Pregnancy Information */}
          {motherDetails.maternalRecord && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">গর্ভাবস্থার তথ্য</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-pink-50 p-3 rounded">
                  <p className="text-sm text-gray-600">গর্ভাবস্থার সপ্তাহ</p>
                  <p className="text-2xl font-bold text-primary-600">
                    সপ্তাহ {motherDetails.pregnancyWeek}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">শেষ মাসিকের তারিখ</p>
                  <p className="font-semibold">
                    {new Date(motherDetails.maternalRecord.pregnancy.lmpDate).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">প্রত্যাশিত প্রসবের তারিখ</p>
                  <p className="font-semibold">
                    {new Date(motherDetails.maternalRecord.pregnancy.edd).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Health Updates History */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">
              সাম্প্রতিক স্বাস্থ্য আপডেট ({motherDetails.healthUpdates?.length || 0})
            </h3>
            {motherDetails.healthUpdates && motherDetails.healthUpdates.length > 0 ? (
              <div className="space-y-2">
                {motherDetails.healthUpdates.slice(0, 3).map((update) => (
                  <div key={update._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">
                        সপ্তাহ {update.pregnancyWeek} - {new Date(update.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {update.updaterRole === 'doctor' ? 'ডাক্তার' : 'মিডওয়াইফ'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">রক্তচাপ:</span>
                        <span className="font-semibold ml-1">{update.vitalSigns?.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ওজন:</span>
                        <span className="font-semibold ml-1">{update.vitalSigns?.weight}কেজি</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ভ্রূণের হার্টবিট:</span>
                        <span className="font-semibold ml-1">{update.fetalHeartRate}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ফান্ডাল উচ্চতা:</span>
                        <span className="font-semibold ml-1">{update.fundalHeight}সেমি</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{update.findings}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">কোনো স্বাস্থ্য আপডেট রেকর্ড করা হয়নি</p>
            )}
          </div>

          {/* Previous Advice */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">
              আগের পরামর্শ ({motherDetails.doctorAdvice?.length || 0})
            </h3>
            {motherDetails.doctorAdvice && motherDetails.doctorAdvice.length > 0 ? (
              <div className="space-y-2">
                {motherDetails.doctorAdvice.slice(0, 5).map((advice) => (
                  <div key={advice._id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">{advice.subject}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        advice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        advice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        advice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {advice.priority === 'urgent' ? 'জরুরি' : advice.priority === 'high' ? 'উচ্চ' : advice.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      ডা. {advice.doctorID?.FullName} • {advice.adviceType === 'general' ? 'সাধারণ' : advice.adviceType === 'medication' ? 'ঔষধ' : advice.adviceType === 'diet' ? 'খাদ্য' : advice.adviceType === 'exercise' ? 'ব্যায়াম' : advice.adviceType === 'emergency' ? 'জরুরি' : 'ফলোআপ'}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">{advice.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(advice.createdAt).toLocaleDateString('bn-BD')} • 
                      {advice.isRead ? ' পড়া হয়েছে' : ' পড়া হয়নি'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">আগের কোনো পরামর্শ নেই</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearchAndAdvice;
