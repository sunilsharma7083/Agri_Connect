import api from './api';

export const login = async (email, password) => {
  console.log('🌐 AuthService login call:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });
  const response = await api.post('/auth/login', { email, password });
  console.log('🌐 AuthService login response:', response.data);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

export const validateResetToken = async (token) => {
  const response = await api.get(`/auth/validate-reset-token/${token}`);
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

export const updateAccount = async (accountData) => {
  const response = await api.put('/auth/account', accountData);
  return response.data;
};

export const updateNotificationSettings = async (settings) => {
  const response = await api.put('/auth/notification-settings', settings);
  return response.data;
};

export const updatePrivacySettings = async (settings) => {
  const response = await api.put('/auth/privacy-settings', settings);
  return response.data;
};

export const updateLanguageSettings = async (settings) => {
  const response = await api.put('/auth/language-settings', settings);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/auth/account');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
