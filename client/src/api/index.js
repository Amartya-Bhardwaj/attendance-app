import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
};

// Students API
export const studentsAPI = {
    getAll: () => api.get('/students'),
    getOne: (id) => api.get(`/students/${id}`),
    create: (formData) => api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/students/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/students/${id}`),
};

// Attendance API
export const attendanceAPI = {
    getByDate: (date) => api.get(`/attendance/date/${date}`),
    getByStudent: (id) => api.get(`/attendance/student/${id}`),
    mark: (studentId, date, present) => api.post('/attendance/mark', { studentId, date, present }),
    markBulk: (date, records) => api.post('/attendance/bulk', { date, records }),
};

export default api;
