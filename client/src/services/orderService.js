import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my/orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};

export const getReceivedOrders = async () => {
  const response = await api.get('/orders/received');
  return response.data;
};

export const getOrdersByStatus = async (status) => {
  const response = await api.get(`/orders/status/${status}`);
  return response.data;
};

export const getOrderHistory = async (userId) => {
  const response = await api.get(`/orders/history/${userId}`);
  return response.data;
};

export const getOrderStatistics = async () => {
  const response = await api.get('/orders/statistics');
  return response.data;
};

export const updateDeliveryAddress = async (orderId, address) => {
  const response = await api.put(`/orders/${orderId}/delivery-address`, { address });
  return response.data;
};

export const addOrderNote = async (orderId, note) => {
  const response = await api.post(`/orders/${orderId}/notes`, { note });
  return response.data;
};

export const getOrderNotes = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/notes`);
  return response.data;
};

export const markOrderAsDelivered = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/delivered`);
  return response.data;
};

export const requestRefund = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/refund`, { reason });
  return response.data;
};
