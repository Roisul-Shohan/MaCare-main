import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const HealthArticles = ({ onBack }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [articleDetail, setArticleDetail] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await api.getHealthArticles();
      setArticles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch articles', err);
      setError('নথি লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const openArticle = async (slug) => {
    setSelected(slug);
    setArticleDetail(null);
    try {
      const res = await api.getHealthArticle(slug);
      setArticleDetail(res.data || null);
    } catch (err) {
      console.error('Failed to fetch article', err);
      setArticleDetail(null);
      setError('আর্টিকেল লোড করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="flex">
      <aside className="w-80 p-4 bg-white border-r">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">স্বাস্থ্য সমস্যা</h2>
          {onBack && (
            <button onClick={() => onBack('dashboard')} className="text-sm text-primary-600">ফিরে যান</button>
          )}
        </div>

        {loading && <p className="text-sm text-gray-600">লোড হচ্ছে...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <ul className="space-y-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <button
                onClick={() => openArticle(a.slug)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center gap-3 ${selected === a.slug ? 'bg-primary-50' : ''}`}
              >
                <div className="w-14 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {/* show thumbnail if article has image; otherwise show simple icon */}
                  {a.image ? (
                    <img src={a.image} alt={a.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-yellow-600">🩺</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <p className="text-xs text-gray-500">{a.overview?.slice(0, 80)}{a.overview && a.overview.length > 80 ? '...' : ''}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {!loading && articles.length === 0 && <p className="text-sm text-gray-500">কোনো আর্টিকেল পাওয়া যায়নি</p>}
      </aside>

      <section className="flex-1 p-6">
        {!articleDetail && (
          <div className="text-center text-gray-500">
            <p>পাঠ্য আর্টিকেল দেখুন — একটি বিষয় নির্বাচন করুন</p>
          </div>
        )}

        {articleDetail && (
          <div className="prose max-w-none">
            {/* Hero image */}
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-50">
              {articleDetail.image ? (
                <img src={articleDetail.image} alt={articleDetail.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-pink-50 to-yellow-50 flex items-center justify-center text-5xl">🤱</div>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2">{articleDetail.title}</h1>
            {articleDetail.lastUpdated && <p className="text-xs text-gray-400 mb-4">আপডেট: {articleDetail.lastUpdated}</p>}

            {articleDetail.overview && <p className="mb-4">{articleDetail.overview}</p>}

            {articleDetail.commonCauses && (
              <div>
                <h3 className="font-semibold">প্রধান কারণ</h3>
                <ul className="list-disc ml-6 mb-4">
                  {articleDetail.commonCauses.map((c, idx) => (
                    <li key={idx}><strong>{c.cause}:</strong> {c.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {articleDetail.homeCareTips && (
              <div>
                <h3 className="font-semibold">স্বাস্থ্য-পরামর্শ (বাড়িতে)</h3>
                <ul className="list-disc ml-6 mb-4">
                  {articleDetail.homeCareTips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            {articleDetail.warningSigns && (
              <div>
                <h3 className="font-semibold text-red-600">সতর্কতার লক্ষণ</h3>
                <ul className="list-disc ml-6 mb-4">
                  {articleDetail.warningSigns.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {articleDetail.consultDoctor && (
              <div className="mt-4">
                <h3 className="font-semibold">কখন ডাক্তারের কাছে যাবেন</h3>
                <p>{articleDetail.consultDoctor}</p>
              </div>
            )}

            {articleDetail.sources && (
              <div className="mt-6">
                <h4 className="font-semibold">উৎস</h4>
                <ul className="text-sm text-gray-600">
                  {articleDetail.sources.map((s, i) => (
                    <li key={i}><a className="text-primary-600" href={s.url} target="_blank" rel="noreferrer">{s.name}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HealthArticles;
