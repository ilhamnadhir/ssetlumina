import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me')
};

// Faculty API
export const facultyAPI = {
    getAll: (params) => api.get('/faculty', { params }),
    getById: (id) => api.get(`/faculty/${id}`),
    create: (data) => api.post('/faculty', data),
    update: (id, data) => api.put(`/faculty/${id}`, data),
    delete: (id) => api.delete(`/faculty/${id}`)
};

// Publications API
export const publicationsAPI = {
    getAll: (params) => api.get('/publications', { params }),
    getById: (id) => api.get(`/publications/${id}`),
    getByFaculty: (facultyId, params) => api.get(`/publications/faculty/${facultyId}`, { params }),
    create: (data) => api.post('/publications', data),
    update: (id, data) => api.put(`/publications/${id}`, data),
    delete: (id) => api.delete(`/publications/${id}`)
};

// Departments API
export const departmentsAPI = {
    getAll: () => api.get('/departments'),
    getById: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`)
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
};

export default api;
