import api from './api';

export const getAllGrains = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  const response = await api.get(`/grains?${params}`);
  return response.data;
};

export const getGrainById = async (id) => {
  const response = await api.get(`/grains/${id}`);
  return response.data;
};

export const createGrain = async (grainData) => {
  const response = await api.post('/grains', grainData);
  return response.data;
};

export const updateGrain = async (id, grainData) => {
  const response = await api.put(`/grains/${id}`, grainData);
  return response.data;
};

export const deleteGrain = async (id) => {
  const response = await api.delete(`/grains/${id}`);
  return response.data;
};

export const getMyGrains = async () => {
  const response = await api.get('/grains/my/listings');
  return response.data;
};

export const searchGrains = async (searchQuery) => {
  const response = await api.get(`/grains/search?q=${encodeURIComponent(searchQuery)}`);
  return response.data;
};

export const getGrainsByCategory = async (category) => {
  const response = await api.get(`/grains/category/${category}`);
  return response.data;
};

export const getFeaturedGrains = async () => {
  const response = await api.get('/grains/featured');
  return response.data;
};

export const getRecentGrains = async (limit = 10) => {
  const response = await api.get(`/grains/recent?limit=${limit}`);
  return response.data;
};

export const uploadGrainImages = async (grainId, images) => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });
  const response = await api.post(`/grains/${grainId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteGrainImage = async (grainId, imageId) => {
  const response = await api.delete(`/grains/${grainId}/images/${imageId}`);
  return response.data;
};

export const updateGrainStatus = async (id, status) => {
  const response = await api.patch(`/grains/${id}/status`, { status });
  return response.data;
};
