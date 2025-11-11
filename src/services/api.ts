import axios from 'axios';

// Use environment variable or default to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log(`🔗 [API Config] Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Handle errors with better logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION')) {
      console.error(`❌ [API Error] Cannot connect to backend server at ${API_BASE_URL}`);
      console.error(`   Please ensure the backend is running on port 8000`);
      console.error(`   Start backend with: cd applytomation-backend && ./run.sh`);
      error.userMessage = `Cannot connect to server. Please ensure the backend is running at ${API_BASE_URL}`;
    } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error(`⏱️ [API Error] Request timeout - server may be slow or unresponsive`);
      error.userMessage = 'Request timed out. Please try again.';
    } else if (error.response) {
      // Server responded with error status
      console.error(`❌ [API Error] ${error.config.method?.toUpperCase()} ${error.config.url} - ${error.response.status}`);
      console.error(`   Response:`, error.response.data);
    } else {
      console.error(`❌ [API Error]`, error.message);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Resumes API
export const resumesApi = {
  getAll: (params?: { user_id?: number }) => api.get('/resumes/', { params }),
  getById: (id: number) => api.get(`/resumes/${id}`),
  upload: (file: File, userId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    const userIdToUse = userId || parseInt(localStorage.getItem('userId') || '1');
    return api.post(`/resumes/upload?user_id=${userIdToUse}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id: number) => api.delete(`/resumes/${id}`),
};

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string; otp_code?: string }) =>
    api.post('/auth/login', credentials),
  register: (user: { email: string; password: string }) =>
    api.post('/auth/register', user),
};

// Applications API
export const applicationsApi = {
  getAll: (params?: { user_id?: number; status?: string }) => 
    api.get('/applications/', { params }),
  getById: (id: number) => api.get(`/applications/${id}`),
  create: (data: any) => api.post('/applications/', data),
  update: (id: number, data: any) => api.put(`/applications/${id}`, data),
  delete: (id: number) => api.delete(`/applications/${id}`),
  getInsights: (userId: number) => api.get(`/applications/insights/${userId}`),
};

// Career Portals API (enhanced)
export const careerPortalsApi = {
  getAll: (params?: { industry?: string; country?: string; state?: string; city?: string; company_size?: string; tier?: number }) =>
    api.get('/masters/', { params }),
  getById: (id: number) => api.get(`/masters/${id}`),
  create: (data: any) => api.post('/masters/', data),
  update: (id: number, data: any) => api.put(`/masters/${id}`, data),
  delete: (id: number) => api.delete(`/masters/${id}`),
  discoverIndia: (maxResults?: number) => api.post(`/masters/discover-india?max_results=${maxResults || 50}`),
};

// Master Data API
export const mastersDataApi = {
  getCountries: () => api.get('/masters-data/countries'),
  getStates: (countryId?: number) => api.get('/masters-data/states', { params: { country_id: countryId } }),
  getCities: (countryId?: number, stateId?: number) =>
    api.get('/masters-data/cities', { params: { country_id: countryId, state_id: stateId } }),
  getIndustries: () => api.get('/masters-data/industries'),
  createIndustry: (data: { name: string }) => api.post('/masters-data/industries', data),
  updateIndustry: (id: number, data: { name?: string }) => api.put(`/masters-data/industries/${id}`, data),
  deleteIndustry: (id: number) => api.delete(`/masters-data/industries/${id}`),
  createCountry: (data: { name: string }) => api.post('/masters-data/countries', data),
  updateCountry: (id: number, data: { name?: string; code?: string }) => api.put(`/masters-data/countries/${id}`, data),
  deleteCountry: (id: number) => api.delete(`/masters-data/countries/${id}`),
  createState: (data: { name: string; country_id: number }) => api.post('/masters-data/states', data),
  updateState: (id: number, data: { name?: string; country_id?: number }) => api.put(`/masters-data/states/${id}`, data),
  deleteState: (id: number) => api.delete(`/masters-data/states/${id}`),
  createCity: (data: { name: string; country_id?: number; state_id?: number }) => api.post('/masters-data/cities', data),
  updateCity: (id: number, data: { name?: string; country_id?: number; state_id?: number }) => api.put(`/masters-data/cities/${id}`, data),
  deleteCity: (id: number) => api.delete(`/masters-data/cities/${id}`),
};

// User API
export const userApi = {
  getProfile: (userId: number) => api.get(`/users/${userId}`),
  updateProfile: (userId: number, data: any) => api.put(`/users/${userId}`, data),
};

// Jobs API
export const jobsApi = {
  search: (params?: { keywords?: string; location?: string; country?: string; page?: number }) =>
    api.get('/jobs/search', { params }),
};

// Notifications API
export const notificationsApi = {
  getAll: (userId: number, params?: { read?: boolean; skip?: number; limit?: number }) =>
    api.get(`/notifications/`, { params: { user_id: userId, ...params } }),
  getById: (id: number) => api.get(`/notifications/${id}`),
  create: (data: any) => api.post('/notifications/', data),
  update: (id: number, data: any) => api.put(`/notifications/${id}`, data),
  markAllRead: (userId: number) => api.post(`/notifications/${userId}/mark-all-read`),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};

// Job Matches API
export const jobMatchesApi = {
  getRecommendations: (userId: number, resumeId?: number, limit?: number) =>
    api.get(`/job-matches/recommendations/${userId}`, { params: { resume_id: resumeId, limit } }),
  applyToJob: (userId: number, data: { career_portal_id: number; resume_id?: number; job_title?: string; notes?: string }) =>
    api.post(`/job-matches/apply/${userId}`, null, { params: data }),
  getMatches: (userId: number, params?: { resume_id?: number; skip?: number; limit?: number }) =>
    api.get(`/job-matches/matches/${userId}`, { params }),
  createMatch: (data: any) => api.post('/job-matches/match', data),
  // Auto-apply to relevant jobs based on resume keywords
  autoApply: (userId: number, params?: { resume_id?: number; min_match_score?: number; max_applications?: number; auto_send_email?: boolean }) =>
    api.post(`/job-matches/auto-apply/${userId}`, null, { params }),
};

// Job Scraper API
export const jobScraperApi = {
  // Scrape jobs from career pages
  scrape: (data: { job_title: string; location: string; min_salary?: number; min_exp?: number }) =>
    api.post('/job-scraper/scrape', data),
  // GET version of scrape
  scrapeGet: (params: { job_title: string; location: string; min_salary?: number; min_exp?: number }) =>
    api.get('/job-scraper/scrape', { params }),
};

// OTP API
export const otpApi = {
  request: (data: { email: string }) => api.post('/otp/request', data),
  verify: (data: { email: string; otp_code: string }) => api.post('/otp/verify', data),
};

// Health check API
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;

