import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

import { getReceivedOrders, updateOrderStatus } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReceivedOrders = () => {
  // const { t } = useTranslation();
  // const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const filterOrders = useCallback(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [orders, statusFilter]);

  useEffect(() => {
    fetchReceivedOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const fetchReceivedOrders = async () => {
    try {
      setIsLoading(true);
      const response = await getReceivedOrders();
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error('Error fetching received orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        icon: ClockIcon,
        label: 'Pending Review' 
      },
      confirmed: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
        icon: CheckCircleIcon,
        label: 'Confirmed' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
        icon: XMarkIcon,
        label: 'Rejected' 
      },
      shipped: { 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', 
        icon: TruckIcon,
        label: 'Shipped' 
      },
      delivered: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircleIcon,
        label: 'Delivered' 
      },
      cancelled: { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', 
        icon: XMarkIcon,
        label: 'Cancelled' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getTotalAmount = (order) => {
    return order.quantity * (order.grain?.pricePerQuintal || order.grain?.pricePerKg || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Received Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage orders from buyers for your grain listings
            </p>
          </div>
          <Link
            to="/farmer/my-listings"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            View My Listings
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <CurrencyRupeeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-purple-100 dark:bg-purple-900/30">
                <TruckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipped</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/30">
                <XMarkIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-4 mb-8"
        >
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📨</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {orders.length === 0 ? 'No orders received yet' : 'No orders match the filter'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {orders.length === 0 
                ? "When buyers place orders for your grains, they will appear here"
                : "Try adjusting your filter to see more orders"
              }
            </p>
            {orders.length === 0 && (
              <Link
                to="/farmer/my-listings"
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View My Listings
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Received on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(order.status)}
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                            className="inline-flex items-center px-3 py-1 text-sm border border-green-600 text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'rejected')}
                            className="inline-flex items-center px-3 py-1 text-sm border border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                          className="inline-flex items-center px-3 py-1 text-sm border border-purple-600 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                        >
                          <TruckIcon className="w-4 h-4 mr-1" />
                          Mark Shipped
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Buyer Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Buyer Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Name:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{order.buyer?.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{order.buyer?.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{order.buyer?.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Grain Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/30 dark:to-yellow-900/30 rounded-lg flex items-center justify-center">
                          {order.grain?.images && order.grain.images.length > 0 ? (
                            <img 
                              src={order.grain.images[0]} 
                              alt={order.grain.title || order.grain.grainType}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-gray-400 dark:text-gray-500 text-2xl">🌾</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {order.grain?.title || order.grain?.grainType}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {order.grain?.grainType} • {order.grain?.variety || 'Standard'}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Quantity: {order.quantity} {order.grain?.pricePerQuintal ? 'quintals' : 'kg'}</span>
                            <span className="mx-2">•</span>
                            <span>Rate: ₹{order.grain?.pricePerQuintal || order.grain?.pricePerKg}/{order.grain?.pricePerQuintal ? 'quintal' : 'kg'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="text-gray-900 dark:text-white">₹{getTotalAmount(order).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                          <span className="text-gray-900 dark:text-white">₹{order.deliveryFee || 0}</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-green-600 dark:text-green-400">₹{(getTotalAmount(order) + (order.deliveryFee || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Delivery Address</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Buyer Notes</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <Link
                      to={`/farmer/orders/${order._id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReceivedOrders;
