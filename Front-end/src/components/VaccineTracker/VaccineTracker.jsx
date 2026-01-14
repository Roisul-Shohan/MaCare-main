import React, { useState, useEffect } from 'react';
import { Calendar, Upload, Eye, Download, CheckCircle, Clock, AlertCircle, X, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';

/**
 * Vaccine Tracker Component
 * Displays pregnancy vaccine schedule with manual entry capability
 */
const VaccineTracker = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'complete', 'upload', 'view'
  
  // Form fields for adding vaccine
  const [vaccineName, setVaccineName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [takenDate, setTakenDate] = useState('');
  const [notes, setNotes] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const response = await api.getPregnancyVaccines();
      setVaccines(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching vaccines:', err);
      setError('টিকার তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vaccine, type) => {
    setSelectedVaccine(vaccine);
    setModalType(type);
    setShowModal(true);
    
    if (type === 'add') {
      setVaccineName('');
      setScheduledDate('');
      setNotes('');
    } else if (type === 'complete') {
      setTakenDate(vaccine.takenDate ? new Date(vaccine.takenDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setNotes(vaccine.notes || '');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVaccine(null);
    setModalType('');
    setVaccineName('');
    setScheduledDate('');
    setTakenDate('');
    setNotes('');
    setPdfFile(null);
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    
    if (!vaccineName || !scheduledDate) {
      alert('টিকার নাম এবং নির্ধারিত তারিখ প্রয়োজন।');
      return;
    }

    try {
      await api.createVaccine({
        vaccineName,
        scheduledDate,
        notes
      });
      
      await fetchVaccines();
      closeModal();
    } catch (error) {
      console.error('Error adding vaccine:', error);
      alert('টিকা যোগ করতে সমস্যা হয়েছে।');
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedVaccine) return;

    try {
      await api.markVaccineCompleted(selectedVaccine._id, {
        takenDate,
        notes
      });
      
      await fetchVaccines();
      closeModal();
    } catch (error) {
      console.error('Error marking vaccine complete:', error);
      alert('টিকা সম্পন্ন চিহ্নিত করতে সমস্যা হয়েছে।');
    }
  };

  const handleUploadPDF = async () => {
    if (!selectedVaccine || !pdfFile) {
      alert('অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন।');
      return;
    }

    // Validate file type
    if (pdfFile.type !== 'application/pdf') {
      alert('শুধুমাত্র PDF ফাইল আপলোড করা যাবে।');
      return;
    }

    // Validate file size (5MB)
    if (pdfFile.size > 5 * 1024 * 1024) {
      alert('ফাইলের আকার ৫ MB এর কম হতে হবে।');
      return;
    }

    try {
      setUploading(true);
      const response = await api.uploadVaccinePDF(selectedVaccine._id, pdfFile);
      console.log('Upload response:', response);
      await fetchVaccines();
      closeModal();
      alert('PDF সফলভাবে আপলোড হয়েছে!');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      const errorMessage = error.response?.data?.message || error.message || 'PDF আপলোড করতে সমস্যা হয়েছে।';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePDF = async (vaccine) => {
    if (!window.confirm('আপনি কি এই PDF মুছে ফেলতে চান?')) return;

    try {
      await api.deleteVaccinePDF(vaccine._id);
      await fetchVaccines();
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert('PDF মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteVaccine = async (vaccine) => {
    if (!window.confirm(`আপনি কি "${vaccine.vaccineName}" টিকাটি মুছে ফেলতে চান?`)) return;

    try {
      await api.deleteVaccine(vaccine._id);
      await fetchVaccines();
    } catch (error) {
      console.error('Error deleting vaccine:', error);
      alert('টিকা মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleResetStatus = async (vaccine) => {
    if (!window.confirm('আপনি কি এই টিকার স্ট্যাটাস রিসেট করতে চান?')) return;

    try {
      await api.resetVaccineStatus(vaccine._id);
      await fetchVaccines();
    } catch (error) {
      console.error('Error resetting vaccine status:', error);
      alert('স্ট্যাটাস রিসেট করতে সমস্যা হয়েছে।');
    }
  };

  const getStatusBadge = (vaccine) => {
    if (vaccine.status === 'Completed') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          সম্পন্ন
        </span>
      );
    }

    const scheduled = new Date(vaccine.scheduledDate);
    const today = new Date();
    
    if (scheduled < today) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-4 h-4 mr-1" />
          বিলম্বিত
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <Clock className="w-4 h-4 mr-1" />
        অপেক্ষমাণ
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">টিকার তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchVaccines}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">গর্ভাবস্থার টিকার সময়সূচী</h1>
        <button
          onClick={() => openModal(null, 'add')}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          নতুন টিকা যোগ করুন
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">টিকার গুরুত্ব</h3>
            <p className="text-blue-800 text-sm">
              গর্ভাবস্থায় টিকা নেওয়া মা এবং শিশু উভয়ের জন্য অত্যন্ত গুরুত্বপূর্ণ। নির্ধারিত সময়ে টিকা নিন এবং নিশ্চিত করুন যে সকল টিকা সম্পন্ন হয়েছে। এখানে আপনার টিকার তথ্য যোগ করুন এবং রেকর্ড রাখুন।
            </p>
          </div>
        </div>
      </div>

      {/* Vaccine Table */}
      {vaccines.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">এখনও কোনো টিকা যোগ করা হয়নি</p>
          <button
            onClick={() => openModal(null, 'add')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            প্রথম টিকা যোগ করুন
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  টিকার নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  নির্ধারিত তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  গ্রহণের তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কার্যক্রম
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaccines.map((vaccine) => (
                <tr key={vaccine._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vaccine.vaccineName}</div>
                    {vaccine.notes && (
                      <div className="text-sm text-gray-500">{vaccine.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(vaccine.scheduledDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(vaccine.takenDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vaccine)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {vaccine.status !== 'Completed' && (
                        <button
                          onClick={() => openModal(vaccine, 'complete')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="সম্পন্ন চিহ্নিত করুন"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      
                      {!vaccine.pdfUrl ? (
                        <button
                          onClick={() => openModal(vaccine, 'upload')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="PDF আপলোড করুন"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => window.open(vaccine.pdfUrl, '_blank')}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                            title="PDF দেখুন"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a
                            href={vaccine.pdfUrl}
                            download={`vaccine-${vaccine.vaccineName}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors inline-block"
                            title="PDF ডাউনলোড করুন"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDeletePDF(vaccine)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                            title="PDF মুছুন"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {vaccine.status === 'Completed' && (
                        <button
                          onClick={() => handleResetStatus(vaccine)}
                          className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 border border-gray-300 rounded transition-colors"
                          title="রিসেট করুন"
                        >
                          রিসেট
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteVaccine(vaccine)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="টিকা মুছুন"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalType === 'add' && 'নতুন টিকা যোগ করুন'}
                {modalType === 'complete' && 'টিকা সম্পন্ন চিহ্নিত করুন'}
                {modalType === 'upload' && 'PDF আপলোড করুন'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalType === 'add' && (
              <form onSubmit={handleAddVaccine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    টিকার নাম *
                  </label>
                  <input
                    type="text"
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="যেমন: TT 1st Dose, Influenza"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    নির্ধারিত তারিখ *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="অতিরিক্ত তথ্য..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    যোগ করুন
                  </button>
                </div>
              </form>
            )}

            {modalType === 'complete' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    গ্রহণের তারিখ *
                  </label>
                  <input
                    type="date"
                    value={takenDate}
                    onChange={(e) => setTakenDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="অতিরিক্ত তথ্য..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleMarkComplete}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    সম্পন্ন চিহ্নিত করুন
                  </button>
                </div>
              </div>
            )}

            {modalType === 'upload' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PDF ফাইল নির্বাচন করুন
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    সর্বোচ্চ ফাইল সাইজ: ৫ MB
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={uploading}
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleUploadPDF}
                    disabled={!pdfFile || uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineTracker;
