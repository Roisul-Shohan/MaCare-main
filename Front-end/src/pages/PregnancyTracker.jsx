import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

const PregnancyTracker = ({ onNavigate }) => {
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [weeksRes, dashRes] = await Promise.all([api.getPregnancyWeeks(), api.getMotherDashboard()]);
        const w = weeksRes.data || [];
        setWeeks(w);
        const pw = dashRes.data?.pregnancyWeek ?? 0;
        setCurrentWeek(pw);
        const initial = pw && w.find(x => x.week === pw) ? pw : (w[0]?.week ?? 1);
        setSelectedWeek(initial);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // progress percent (assume 42 weeks)
  const percent = Math.min(100, Math.round((currentWeek / 42) * 100));

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

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="mother" onNavigate={onNavigate} />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="mother" onNavigate={onNavigate} />
      <main className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">ত্রুটি: {error}</div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="mother" onNavigate={onNavigate} />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">গর্ভাবস্থা ট্র্যাকার</h1>
            <p className="text-sm text-gray-600">সাপ্তাহিক বিবরণ ও পরামর্শ (42 সপ্তাহ)</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate && onNavigate('mother-dashboard')} className="px-4 py-2 bg-gray-100 rounded">পিছনে</button>
          </div>
        </div>

        {/* Week selector dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">সপ্তাহ নির্বাচন করুন:</label>
          <select
            value={selectedWeek || ''}
            onChange={handleSelect}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{cw.weekLabel}</h2>
                <p className="text-lg text-gray-600">
                  আকৃতি: {cw.babyLength?.mm ? `${cw.babyLength.mm} mm` : 'N/A'} •
                  ওজন: {cw.babyWeight?.grams ? `${cw.babyWeight.grams} g` : 'N/A'}
                </p>
              </div>

              {/* Baby image */}
              {cw.images && cw.images[0] && cw.images[0].url && (
                <div className="flex justify-center mb-8">
                  <img
                    src={cw.images[0].url}
                    alt={`Week ${cw.week} illustration`}
                    className="max-w-md w-full rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Development highlights */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">এই সপ্তাহে শিশুর অবস্থা</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {(cw.developmentHighlights || []).map((d, i) => <li key={i} className="text-base">{d}</li>)}
                </ul>
              </div>

              {/* Things to do this week */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-green-700 mb-4">এই সপ্তাহে করণীয়</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {(cw.doThisWeek || []).map((d, i) => <li key={i} className="text-base">{d}</li>)}
                </ul>
              </div>

              {/* Warnings */}
              {cw.warnings && cw.warnings.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-red-700 mb-4">জরুরি সতর্কতা</h3>
                  <ul className="list-disc pl-6 space-y-2 text-red-700">
                    {cw.warnings.map((w, i) => <li key={i} className="text-base">{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Source link */}
              {cw.source && (
                <div className="text-center text-sm text-gray-500 mb-6">
                  সূত্র: <a
                    className="text-primary-600 hover:underline font-medium"
                    href={cw.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {cw.source.name}
                  </a>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrev}
                  disabled={weeks.findIndex(w => w.week === selectedWeek) === 0}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ← পূর্ববর্তী সপ্তাহ
                </button>
                <span className="text-lg font-semibold text-gray-900">সপ্তাহ {cw.week}</span>
                <button
                  onClick={handleNext}
                  disabled={weeks.findIndex(w => w.week === selectedWeek) === weeks.length - 1}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  পরবর্তী সপ্তাহ →
                </button>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
};

export default PregnancyTracker;
