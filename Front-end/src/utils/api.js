// API Configuration and Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function to get user data from localStorage
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to set auth data
export const setAuthData = (accessToken, refreshToken, userData) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userData', JSON.stringify(userData));
};

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
};

// Base fetch wrapper with authentication
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 && token) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the original request
          return apiFetch(endpoint, options);
        } else {
          clearAuthData();
          window.location.href = '/login';
        }
      }
      throw new Error(data.Message || data.message || 'API request failed');
    }

    // Normalize backend response format (Success/success, Message/message)
    return {
      success: data.Success ?? data.success,
      data: data.data,
      message: data.Message ?? data.message
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Refresh access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/users/renewaccestoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ RefreshToken: refreshToken }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.AccessToken);
      localStorage.setItem('refreshToken', data.data.RefreshToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// API Methods
export const api = {
  // Auth APIs
  register: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        body: formData, // FormData for file upload
      });
      const data = await response.json();
      
      // Backend uses 'Success' (capital S), normalize to lowercase
      const success = data.Success ?? data.success;
      
      if (response.ok || success) {
        return { success: true, data: data.data, message: data.Message || data.message };
      }
      
      return { success: false, message: data.Message || data.message || 'Registration failed' };
    } catch (error) {
      console.error('Register API Error:', error);
      return { success: false, message: error.message || 'Network error' };
    }
  },

  login: (credentials) => 
    apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () => 
    apiFetch('/users/logout', {
      method: 'POST',
    }),

  // Mother APIs
  getMotherDashboard: () => 
    apiFetch('/mother/dashboard'),

  getMotherProfile: () => 
    apiFetch('/mother/profile'),

  getMaternalRecord: () => 
    apiFetch('/mother/maternal-record'),

  createMaternalRecord: (data) => 
    apiFetch('/mother/maternal-record', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteMaternalRecord: () => 
    apiFetch('/mother/maternal-record', {
      method: 'DELETE',
    }),

  getMotherAppointments: () => 
    apiFetch('/mother/appointments'),

  getMotherMessages: () => 
    apiFetch('/mother/messages'),

  markMessageRead: (messageId) => 
    apiFetch(`/mother/messages/${messageId}/read`, {
      method: 'PATCH',
    }),

  registerChild: (childData) => 
    apiFetch('/mother/child/register', {
      method: 'POST',
      body: JSON.stringify(childData),
    }),

  deleteChild: (childId) => 
    apiFetch(`/mother/child/${childId}`, {
      method: 'DELETE',
    }),

  getVaccineSchedule: (childId) => 
    apiFetch(`/mother/child/${childId}/vaccines`),

  // Mother - Doctor Advice & Health Updates
  getAllDoctorAdvice: () => 
    apiFetch('/mother/doctor-advice'),

  markAdviceAsRead: (adviceId) => 
    apiFetch(`/mother/doctor-advice/${adviceId}/read`, {
      method: 'PATCH',
    }),

  getAllHealthUpdates: () => 
    apiFetch('/mother/health-updates'),

  getMyCheckups: () => 
    apiFetch('/mother/checkups'),

  // Health Articles
  getHealthArticles: () =>
    apiFetch('/mother/health-articles'),

  getHealthArticle: (slug) =>
    apiFetch(`/mother/health-articles/${slug}`),

  // Pregnancy weeks data
  getPregnancyWeeks: () =>
    apiFetch('/mother/pregnancy/weeks'),
  
  // Nutrition weeks data
  getNutritionWeeks: () =>
    apiFetch('/mother/nutrition/weeks'),
  
  // Pregnancy Vaccine Tracker
  createVaccine: (data) => 
    apiFetch('/mother/vaccines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPregnancyVaccines: () => 
    apiFetch('/mother/vaccines'),

  deleteVaccine: (vaccineId) => 
    apiFetch(`/mother/vaccines/${vaccineId}`, {
      method: 'DELETE',
    }),

  markVaccineCompleted: (vaccineId, data) => 
    apiFetch(`/mother/vaccines/${vaccineId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  resetVaccineStatus: (vaccineId) => 
    apiFetch(`/mother/vaccines/${vaccineId}/reset`, {
      method: 'PATCH',
    }),

  uploadVaccinePDF: (vaccineId, pdfFile) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    
    return fetch(`${API_BASE_URL}/mother/vaccines/${vaccineId}/upload-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PDF upload failed');
      }
      return response.json();
    });
  },

  deleteVaccinePDF: (vaccineId) => 
    apiFetch(`/mother/vaccines/${vaccineId}/delete-pdf`, {
      method: 'DELETE',
    }),

  // Doctor APIs
  getDoctorDashboard: () => 
    apiFetch('/doctor/dashboard'),

  getDoctorPatients: () => 
    apiFetch('/doctor/patients'),

  getPatientDetails: (patientId) => 
    apiFetch(`/doctor/patients/${patientId}`),

  assignPatient: (patientId) => 
    apiFetch('/doctor/patients/assign', {
      method: 'POST',
      body: JSON.stringify({ patientId }),
    }),

  addPatientVisit: (patientId, visitData) => 
    apiFetch(`/doctor/patients/${patientId}/visit`, {
      method: 'POST',
      body: JSON.stringify(visitData),
    }),

  updateRiskFlags: (patientId, riskFlags) => 
    apiFetch(`/doctor/patients/${patientId}/risk-flags`, {
      method: 'PATCH',
      body: JSON.stringify({ riskFlags }),
    }),

  getDoctorAppointments: (date) => 
    apiFetch(`/doctor/appointments${date ? `?date=${date}` : ''}`),

  createAppointment: (appointmentData) => 
    apiFetch('/doctor/appointments/create', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),

  updateAppointmentStatus: (appointmentId, status, notes) => 
    apiFetch(`/doctor/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  sendMessage: (receiverID, message, messageType) => 
    apiFetch('/doctor/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiverID, message, messageType }),
    }),

  // Doctor - New Features
  searchMothers: (query) => 
    apiFetch(`/doctor/search-mothers?query=${encodeURIComponent(query)}`),

  getMotherByEmail: (email) => 
    apiFetch(`/doctor/mother/email/${encodeURIComponent(email)}`),

  sendAdviceToMother: (adviceData) => 
    apiFetch('/doctor/advice/send', {
      method: 'POST',
      body: JSON.stringify(adviceData),
    }),

  getDoctorAdviceHistory: () => 
    apiFetch('/doctor/advice/history'),

  // Midwife APIs
  getMidwifeDashboard: () => 
    apiFetch('/midwife/dashboard'),

  getAssignedMothers: () => 
    apiFetch('/midwife/mothers'),

  getMotherDetailsByID: (motherID) => 
    apiFetch(`/midwife/mothers/${motherID}`),

  addHealthRecordUpdate: (motherID, healthData) => 
    apiFetch(`/midwife/mothers/${motherID}/health-update`, {
      method: 'POST',
      body: JSON.stringify(healthData),
    }),

  scheduleCheckup: (motherID, checkupData) => 
    apiFetch(`/midwife/mothers/${motherID}/schedule-checkup`, {
      method: 'POST',
      body: JSON.stringify(checkupData),
    }),

  getPendingCheckups: () => 
    apiFetch('/midwife/checkups/pending'),

  completeCheckup: (checkupID, notes) => 
    apiFetch(`/midwife/checkups/${checkupID}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  assignMotherToMidwife: (motherID) => 
    apiFetch('/midwife/assign-mother', {
      method: 'POST',
      body: JSON.stringify({ motherID }),
    }),
};

export default api;
