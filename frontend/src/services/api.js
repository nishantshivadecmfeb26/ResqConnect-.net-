import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
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

// Auth endpoints
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  getNGOsPublic: async () => {
    const response = await api.get('/auth/ngos');
    return response.data;
  },
};

// Users endpoints (Admin only, except NGOs list which is also for Gov Officers)
export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getNGOs: async () => {
    const response = await api.get('/users/ngos');
    return response.data;
  },
};

// Disasters endpoints
export const disasterService = {
  getAll: async (params = {}) => {
    const queryParams = typeof params === 'boolean' ? { activeOnly: params } : params;
    const response = await api.get('/disasters', { params: queryParams });
    if (response.data && response.data.items !== undefined) {
      if (queryParams.pageNumber || queryParams.pageSize) {
        return response.data;
      }
      return response.data.items;
    }
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/disasters/stats');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/disasters/${id}`);
    return response.data;
  },
  create: async (disasterData) => {
    const response = await api.post('/disasters', disasterData);
    return response.data;
  },
  update: async (id, disasterData) => {
    const response = await api.put(`/disasters/${id}`, disasterData);
    return response.data;
  },
  close: async (id) => {
    const response = await api.put(`/disasters/${id}/close`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/disasters/${id}`);
    return response.data;
  },
};

// SOS Requests endpoints
export const sosService = {
  getAll: async (disasterId = null) => {
    const url = disasterId ? `/sos?disasterId=${disasterId}` : '/sos';
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/sos/${id}`);
    return response.data;
  },
  raise: async (sosData) => {
    const response = await api.post('/sos', sosData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/sos/${id}/status`, { status });
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.put(`/sos/${id}/cancel`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/sos/${id}`);
    return response.data;
  },
  // Government Officer Workflow
  getGovSos: async () => {
    const response = await api.get('/gov/sos');
    return response.data;
  },
  assignNgo: async (id, ngoId) => {
    const response = await api.put(`/gov/sos/${id}/assign-ngo`, { ngoId });
    return response.data;
  },
  rejectSos: async (id) => {
    const response = await api.put(`/gov/sos/${id}/reject`);
    return response.data;
  },
  resolveSos: async (id) => {
    const response = await api.put(`/gov/sos/${id}/resolve`);
    return response.data;
  },
  // NGO Workflow
  getNgoSos: async () => {
    const response = await api.get('/ngo/sos');
    return response.data;
  },
  assignVolunteer: async (id, volunteerId) => {
    const response = await api.put(`/ngo/sos/${id}/assign-volunteer`, { volunteerId });
    return response.data;
  },
  verifySosCompletion: async (id) => {
    const response = await api.put(`/ngo/sos/${id}/verify`);
    return response.data;
  },
  // Volunteer Workflow
  getVolunteerTasks: async () => {
    const response = await api.get('/volunteer/tasks');
    return response.data;
  },
  updateVolunteerTaskStatus: async (id, status) => {
    const response = await api.put(`/volunteer/tasks/${id}/status`, { status });
    return response.data;
  },
  uploadVolunteerTaskProof: async (id, proofData) => {
    const response = await api.post(`/volunteer/tasks/${id}/proof`, proofData);
    return response.data;
  },
};

// Camps endpoints
export const campService = {
  getAll: async (disasterId = null) => {
    const url = disasterId ? `/camps?disasterId=${disasterId}` : '/camps';
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/camps/${id}`);
    return response.data;
  },
  create: async (campData) => {
    const response = await api.post('/camps', campData);
    return response.data;
  },
  update: async (id, campData) => {
    const response = await api.put(`/camps/${id}`, campData);
    return response.data;
  },
  close: async (id) => {
    const response = await api.delete(`/camps/${id}`);
    return response.data;
  },
  register: async (id) => {
    const response = await api.post(`/camps/${id}/register`);
    return response.data;
  },
  leave: async () => {
    const response = await api.post('/camps/leave');
    return response.data;
  },
};

// Resources endpoints
export const resourceService = {
  getByCamp: async (campId) => {
    const response = await api.get(`/resources?campId=${campId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  add: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },
  updateQuantity: async (id, quantity) => {
    const response = await api.put(`/resources/${id}`, quantity, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};

// Volunteers endpoints
export const volunteerService = {
  getAll: async () => {
    const response = await api.get('/volunteers');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/volunteers/${id}`);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/volunteers/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/volunteers/profile', profileData);
    return response.data;
  },
  verify: async (id, verificationData) => {
    const response = await api.put(`/volunteers/${id}/verify`, verificationData);
    return response.data;
  },
};

// Tasks endpoints
export const taskService = {
  getAll: async (campId = null) => {
    const url = campId ? `/tasks?campId=${campId}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  update: async (id, status, volunteerId = null) => {
    const response = await api.put(`/tasks/${id}`, { status, volunteerId });
    return response.data;
  },
};

// Missing Persons endpoints
export const missingPersonService = {
  getAll: async () => {
    const response = await api.get('/missing-persons');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/missing-persons/${id}`);
    return response.data;
  },
  report: async (personData) => {
    const response = await api.post('/missing-persons', personData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/missing-persons/${id}/status`, { status });
    return response.data;
  },
};

// Hazard Reports endpoints (crowd-sourced road/bridge blockage markers)
export const hazardReportService = {
  getAll: async () => {
    const response = await api.get('/hazard-reports');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/hazard-reports/${id}`);
    return response.data;
  },
  create: async (hazardData) => {
    const response = await api.post('/hazard-reports', hazardData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/hazard-reports/${id}`);
    return response.data;
  },
};

// Notifications endpoints
export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  broadcast: async (broadcastData, roleId = null) => {
    const url = roleId ? `/notifications/broadcast?roleId=${roleId}` : '/notifications/broadcast';
    const response = await api.post(url, broadcastData);
    return response.data;
  },
};

// Forecast endpoints
export const forecastService = {
  getAll: async () => {
    const response = await api.get('/forecast');
    return response.data;
  },
  create: async (forecastData) => {
    const response = await api.post('/forecast', forecastData);
    return response.data;
  },
  triggerDisaster: async (id) => {
    const response = await api.post(`/forecast/trigger-disaster/${id}`);
    return response.data;
  },
};

// Contact endpoints
export const contactService = {
  send: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },
};

export default api;
