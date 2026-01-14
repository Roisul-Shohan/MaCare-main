import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const NutritionTracker = ({ standalone = false, onNavigate }) => {
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [weeksRes, dashRes] = await Promise.all([
          api.getNutritionWeeks(), 
          api.getMotherDashboard()
        ]);
        const w = weeksRes.data || [];
        setWeeks(w);
        const pw = dashRes.data?.pregnancyWeek ?? 0;
        setCurrentWeek(pw);
        const initial = pw && w.find(x => x.week === pw) ? pw : (w[0]?.week ?? 1);
        setSelectedWeek(initial);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch nutrition data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // helpers for navigation
  const handlePrev = () => {
    if (!weeks || weeks.length === 0 || selectedWeek == null) return;
    const idx = weeks.findIndex(w => w.week === selectedWeek);
    if (idx > 0) setSelectedWeek(weeks[idx - 1].week);
  };
  const handleNext = () => {
    if (!weeks || weeks.length === 0 || selectedWeek == null) return;
    const idx = weeks.findIndex(w => w.week === selectedWeek);
    if (idx < weeks.length - 1) setSelectedWeek(weeks[idx + 1].week);
  };
  const handleSelect = (e) => {
    const val = Number(e.target.value);
    setSelectedWeek(val);
  };

  // Content component (reusable)
  const TrackerContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );

    if (error) return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        ত্রুটি: {error}
      </div>
    );

    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-800">পুষ্টি পরামর্শ</h1>
            <p className="text-sm text-gray-600">সাপ্তাহিক পুষ্টি নির্দেশনা (42 সপ্তাহ)</p>
          </div>
        </div>

        {/* Week selector dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">সপ্তাহ নির্বাচন করুন:</label>
          <select
            value={selectedWeek || ''}
            onChange={handleSelect}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {weeks.map(wk => (
              <option key={wk.week} value={wk.week}>{`সপ্তাহ ${wk.week}`}</option>
            ))}
          </select>
        </div>

        {/* Selected week display */}
        {weeks && weeks.length > 0 && selectedWeek != null && (() => {
          const cw = weeks.find(w => w.week === selectedWeek) || weeks[0];
          return (
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Week title */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-green-800 mb-2">{cw.weekLabel}</h2>
              </div>

              {/* Overview */}
              {cw.overview && (
                <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <p className="text-gray-800 text-lg leading-relaxed">{cw.overview}</p>
                </div>
              )}

              {/* Key Nutrients */}
              {cw.keyNutrients && cw.keyNutrients.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">🥗</span>
                    গুরুত্বপূর্ণ পুষ্টি উপাদান
                  </h3>
                  <div className="grid gap-4">
                    {cw.keyNutrients.map((nutrient, i) => (
                      <div key={i} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-5 border border-green-200">
                        <h4 className="text-lg font-bold text-green-900 mb-2">{nutrient.name}</h4>
                        <p className="text-gray-700 mb-3 text-base">{nutrient.importance}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-semibold text-gray-600">খাদ্য উৎস:</span>
                          {nutrient.sources.map((source, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white border border-green-300 text-green-800 font-medium">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Food Guideline */}
              {cw.dailyFoodGuideline && cw.dailyFoodGuideline.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">📋</span>
                    দৈনিক খাদ্য নির্দেশিকা
                  </h3>
                  <ul className="space-y-3">
                    {cw.dailyFoodGuideline.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <span className="text-blue-600 font-bold text-lg mt-1">✓</span>
                        <span className="text-gray-800 text-base flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avoid Foods */}
              {cw.avoidFoods && cw.avoidFoods.length > 0 && (
                <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">⚠️</span>
                    এড়িয়ে চলুন
                  </h3>
                  <ul className="space-y-2">
                    {cw.avoidFoods.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-orange-600 font-bold text-lg mt-1">✗</span>
                        <span className="text-gray-800 text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {cw.warnings && cw.warnings.length > 0 && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <span className="text-3xl">🚨</span>
                    জরুরি সতর্কতা
                  </h3>
                  <p className="text-gray-700 mb-3 font-semibold">নিচের লক্ষণগুলো দেখা দিলে দ্রুত চিকিৎসকের পরামর্শ নিন:</p>
                  <ul className="space-y-2">
                    {cw.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-red-600 font-bold text-lg mt-1">•</span>
                        <span className="text-red-800 text-base">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note */}
              {cw.note && (
                <div className="mb-8 bg-yellow-50 border border-yellow-300 rounded-lg p-5">
                  <p className="text-gray-800 text-base italic flex items-start gap-2">
                    <span className="text-yellow-600 text-2xl">💡</span>
                    <span className="flex-1">{cw.note}</span>
                  </p>
                </div>
              )}

              {/* Source links */}
              {cw.source && cw.source.length > 0 && (
                <div className="mb-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">তথ্যসূত্র:</h4>
                  <div className="space-y-2">
                    {cw.source.map((src, i) => (
                      <div key={i}>
                        <a
                          className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm"
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {src.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrev}
                  disabled={weeks.findIndex(w => w.week === selectedWeek) === 0}
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  ← পূর্ববর্তী সপ্তাহ
                </button>
                <span className="text-lg font-semibold text-gray-900">সপ্তাহ {cw.week}</span>
                <button
                  onClick={handleNext}
                  disabled={weeks.findIndex(w => w.week === selectedWeek) === weeks.length - 1}
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  পরবর্তী সপ্তাহ →
                </button>
              </div>
            </div>
          );
        })()}
      </>
    );
  };

  // Return just content when not standalone (embedded in MotherDashboard)
  return <TrackerContent />;
};

export default NutritionTracker;
