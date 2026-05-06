import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (email, username, password, full_name) =>
  api.post('/auth/signup', { email, username, password, full_name });

// Datasets
export const uploadDataset = (file, name) => {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  return api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getDatasets = () => api.get('/datasets/');
export const getDataset = (id) => api.get(`/datasets/${id}`);
export const deleteDataset = (id) => api.delete(`/datasets/${id}`);
export const getDatasetPreview = (id, rows = 50) => api.get(`/datasets/${id}/preview?rows=${rows}`);

// Workflows
export const createWorkflow = (dataset_id, prompt) =>
  api.post('/workflows/create', { dataset_id, prompt });
export const getWorkflows = (dataset_id) =>
  api.get('/workflows/', { params: dataset_id ? { dataset_id } : {} });
export const getWorkflow = (id) => api.get(`/workflows/${id}`);
export const getWorkflowStatus = (id) => api.get(`/workflows/${id}/status`);

// Chat
export const sendChatMessage = (message, session_id, dataset_id) =>
  api.post('/chat/send', { message, session_id, dataset_id });
export const getChatSessions = (dataset_id) =>
  api.get('/chat/sessions', { params: dataset_id ? { dataset_id } : {} });
export const getChatMessages = (session_id) =>
  api.get(`/chat/sessions/${session_id}/messages`);

// Reports
export const generateReport = (workflow_id, report_type, title) =>
  api.post('/reports/generate', { workflow_id, report_type, title });
export const getReports = () => api.get('/reports/');
export const getReport = (id) => api.get(`/reports/${id}`);

// Config
export const getAppConfig = () => api.get('/config');
export const healthCheck = () => api.get('/health');

export default api;
