import React, { useState, useEffect } from 'react';
import api from '../utils/api';

/**
 * DoctorAdviceList Component
 * Displays all doctor advice for a mother with priority indicators
 */
const DoctorAdviceList = ({ limit = null }) => {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdvice, setSelectedAdvice] = useState(null);

  useEffect(() => {
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    try {
      setLoading(true);
      const response = await api.getAllDoctorAdvice();
      const allAdvice = response.data || [];
      setAdvice(limit ? allAdvice.slice(0, limit) : allAdvice);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching advice:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (adviceId) => {
    try {
      await api.markAdviceAsRead(adviceId);
      fetchAdvice();
    } catch (err) {
      console.error('Error marking advice as read:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getAdviceTypeIcon = (type) => {
    switch (type) {
      case 'medication':
        return '💊';
      case 'diet':
        return '🥗';
      case 'exercise':
        return '🏃';
      case 'emergency':
        return '🚨';
      case 'followup':
        return '📅';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading advice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (advice.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p>No doctor advice yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {advice.map((item) => (
          <div 
            key={item._id} 
            className={`border-l-4 pl-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
              item.isRead ? 'border-gray-300 bg-white' : 'border-primary-500 bg-blue-50'
            }`}
            onClick={() => setSelectedAdvice(item)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{getAdviceTypeIcon(item.adviceType)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {item.subject}
                    {!item.isRead && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">New</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dr. {item.doctorID?.FullName || 'Unknown'}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(item.priority)}`}>
                {item.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{item.message}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
              </p>
              {item.followupRequired && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Follow-up: {new Date(item.followupDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAdvice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getAdviceTypeIcon(selectedAdvice.adviceType)}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedAdvice.subject}</h2>
                  <p className="text-sm text-gray-600">
                    Dr. {selectedAdvice.doctorID?.FullName} • {selectedAdvice.adviceType}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAdvice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm px-3 py-1 rounded border ${getPriorityColor(selectedAdvice.priority)}`}>
                  Priority: {selectedAdvice.priority.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedAdvice.createdAt).toLocaleDateString()} at {new Date(selectedAdvice.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Advice:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAdvice.message}</p>
              </div>

              {selectedAdvice.followupRequired && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-purple-900 mb-1">Follow-up Required</h3>
                  <p className="text-purple-700">
                    Scheduled for: {new Date(selectedAdvice.followupDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Doctor Information</h3>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> Dr. {selectedAdvice.doctorID?.FullName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedAdvice.doctorID?.Email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {selectedAdvice.doctorID?.PhoneNumber}
                </p>
              </div>

              {!selectedAdvice.isRead && (
                <div className="mt-6">
                  <button 
                    onClick={() => {
                      markAsRead(selectedAdvice._id);
                      setSelectedAdvice(null);
                    }}
                    className="btn-primary w-full"
                  >
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAdviceList;
