import axios from 'axios';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Si el 401 viene de cualquier ruta que NO sea /auth/login
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/admin/login')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


// Auth services
export const authService = {
  register: {
    patient: (data) => api.post('/auth/register/patient', data),
    doctor: (data) => api.post('/auth/register/doctor', data),
  },
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  adminSecondAuth: (data, config = {}) => api.post('/auth/admin/second-auth', data, config),
};

// Patient services
export const patientService = {
  getAllDoctors: () => api.get('/patient/doctors'),
  searchDoctorsBySpecialty: (specialtyId) => api.get(`/patient/doctors/specialty/${specialtyId}`),
  getDoctorSchedule: (doctorId) => api.get(`/patient/doctors/${doctorId}/schedule`),
  getDoctorAvailability: (doctorId, date) => api.get(`/patient/doctors/${doctorId}/availability?fecha=${date}`),
  createAppointment: (data) => api.post('/patient/appointments', data),
  getActiveAppointments: () => api.get('/patient/appointments/active'),
  cancelAppointment: (appointmentId) => api.patch(`/patient/appointments/${appointmentId}/cancel`),
  getAppointmentHistory: () => api.get('/patient/appointments/history'),
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.patch('/patient/profile', data),
};

// Doctor services
export const doctorService = {
  getPendingAppointments: () => api.get('/doctor/appointments/pending'),
  attendAppointment: (appointmentId, data) => api.patch(`/doctor/appointments/${appointmentId}/attend`, data),
  cancelAppointment: (appointmentId) => api.patch(`/doctor/appointments/${appointmentId}/cancel`),
  getAppointmentHistory: () => api.get('/doctor/appointments/history'),
  setSchedule: (data) => api.post('/doctor/schedule', data),
  getSchedule: () => api.get('/doctor/schedule'),
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.patch('/doctor/profile', data),
};

// Admin services
export const adminService = {
  getPendingPatients: () => api.get('/admin/pending/patients'),
  getPendingDoctors: () => api.get('/admin/pending/doctors'),
  approvePatient: (patientId) => api.patch(`/admin/pending/patients/${patientId}/approve`),
  approveDoctor: (doctorId) => api.patch(`/admin/pending/doctors/${doctorId}/approve`),
  rejectPatient: (patientId) => api.patch(`/admin/pending/patients/${patientId}/reject`),
  rejectDoctor: (doctorId) => api.patch(`/admin/pending/doctors/${doctorId}/reject`),
  getAllPatients: () => api.get('/admin/patients'),
  getAllDoctors: () => api.get('/admin/doctors'),
  deactivatePatient: (patientId) => api.patch(`/admin/patients/${patientId}/deactivate`),
  deactivateDoctor: (doctorId) => api.patch(`/admin/doctors/${doctorId}/deactivate`),
  getDoctorsWithMostPatients: () => api.get('/admin/reports/doctors/most-patients'),
  getMostPopularSpecialties: () => api.get('/admin/reports/specialties/most-popular'),
};

// Appointment services
export const appointmentService = {
  getAppointmentById: (appointmentId) => api.get(`/appointments/${appointmentId}`),
  getAppointmentsStats: () => api.get('/appointments/stats/overview'),
};

// Utility services
export const utilityService = {
  getSpecialties: () => api.get('/specialties'),
};

export default api;