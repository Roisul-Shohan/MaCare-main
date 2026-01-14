import React, { useState, useEffect } from 'react';
import api from '../utils/api';

/**
 * HealthUpdatesList Component
 * Displays health updates recorded by midwife or doctor
 */
const HealthUpdatesList = ({ limit = null }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    fetchHealthUpdates();
  }, []);

  const fetchHealthUpdates = async () => {
    try {
      setLoading(true);
      const response = await api.getAllHealthUpdates();
      const allUpdates = response.data || [];
      setUpdates(limit ? allUpdates.slice(0, limit) : allUpdates);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching health updates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading health updates...</p>
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

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        <p>No health updates yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {updates.map((update) => (
          <div 
            key={update._id} 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
            onClick={() => setSelectedUpdate(update)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Health Update - Week {update.pregnancyWeek || 'N/A'}
                </h3>
                <p className="text-sm text-gray-600">
                  By: {update.updatedBy?.FullName} ({update.updaterRole})
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {new Date(update.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {update.vitalSigns?.bloodPressure && (
                <div className="bg-blue-50 p-2 rounded">
                  <span className="text-gray-600">BP:</span>
                  <span className="font-semibold ml-1">{update.vitalSigns.bloodPressure}</span>
                </div>
              )}
              {update.vitalSigns?.weight && (
                <div className="bg-purple-50 p-2 rounded">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-semibold ml-1">{update.vitalSigns.weight} kg</span>
                </div>
              )}
              {update.fetalHeartRate && (
                <div className="bg-pink-50 p-2 rounded">
                  <span className="text-gray-600">FHR:</span>
                  <span className="font-semibold ml-1">{update.fetalHeartRate} bpm</span>
                </div>
              )}
              {update.fundalHeight && (
                <div className="bg-yellow-50 p-2 rounded">
                  <span className="text-gray-600">Fundal Height:</span>
                  <span className="font-semibold ml-1">{update.fundalHeight} cm</span>
                </div>
              )}
            </div>

            {update.findings && (
              <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                <strong>Findings:</strong> {update.findings}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Health Update - Week {selectedUpdate.pregnancyWeek}
                </h2>
                <p className="text-sm text-gray-600">
                  Recorded by {selectedUpdate.updatedBy?.FullName} ({selectedUpdate.updaterRole})
                </p>
              </div>
              <button 
                onClick={() => setSelectedUpdate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-600">
                {new Date(selectedUpdate.createdAt).toLocaleDateString()} at {new Date(selectedUpdate.createdAt).toLocaleTimeString()}
              </div>

              {/* Vital Signs */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Vital Signs</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedUpdate.vitalSigns?.bloodPressure && (
                    <div>
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                      <p className="font-semibold">{selectedUpdate.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {selectedUpdate.vitalSigns?.weight && (
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold">{selectedUpdate.vitalSigns.weight} kg</p>
                    </div>
                  )}
                  {selectedUpdate.vitalSigns?.temperature && (
                    <div>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="font-semibold">{selectedUpdate.vitalSigns.temperature}°C</p>
                    </div>
                  )}
                  {selectedUpdate.vitalSigns?.pulse && (
                    <div>
                      <p className="text-sm text-gray-600">Pulse</p>
                      <p className="font-semibold">{selectedUpdate.vitalSigns.pulse} bpm</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pregnancy Tracking */}
              <div className="bg-pink-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Pregnancy Tracking</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Week</p>
                    <p className="font-semibold">{selectedUpdate.pregnancyWeek}</p>
                  </div>
                  {selectedUpdate.fetalHeartRate && (
                    <div>
                      <p className="text-sm text-gray-600">Fetal Heart Rate</p>
                      <p className="font-semibold">{selectedUpdate.fetalHeartRate} bpm</p>
                    </div>
                  )}
                  {selectedUpdate.fundalHeight && (
                    <div>
                      <p className="text-sm text-gray-600">Fundal Height</p>
                      <p className="font-semibold">{selectedUpdate.fundalHeight} cm</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              {selectedUpdate.symptoms && selectedUpdate.symptoms.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Reported Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUpdate.symptoms.map((symptom, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              {selectedUpdate.findings && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Medical Findings</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedUpdate.findings}</p>
                </div>
              )}

              {/* Notes */}
              {selectedUpdate.notes && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedUpdate.notes}</p>
                </div>
              )}

              {/* Healthcare Provider Info */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Recorded By</h3>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {selectedUpdate.updatedBy?.FullName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Role:</strong> {selectedUpdate.updaterRole}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedUpdate.updatedBy?.Email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {selectedUpdate.updatedBy?.PhoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthUpdatesList;
