import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { getMyOrders, cancelOrder } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyOrders = () => {
  // const { t } = useTranslation();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const iconClass = "w-5 h-5";
    switch (status) {
      case 'pending':
        return <ClockIcon className={`${iconClass} text-yellow-500`} />;
      case 'confirmed':
        return <CheckCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'shipped':
        return <TruckIcon className={`${iconClass} text-purple-500`} />;
      case 'delivered':
      case 'completed':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'cancelled':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      default:
        return <ClockIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(orderId);
        fetchMyOrders(); // Refresh orders
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">
              Track your grain orders and delivery status
            </p>
          </div>
          <Link
            to="/grains"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.key === 'all' ? orders.length : orders.filter(o => o.status === tab.key).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No orders found' : `No ${filter} orders found`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start shopping for fresh grains!"
                : `You don't have any ${filter} orders at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/grains"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order._id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{order.totalAmount?.toLocaleString() || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.quantity} {order.grain?.pricePerQuintal ? 'quintals' : 'kg'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grain Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Grain Details</h4>
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-yellow-100 rounded-md flex items-center justify-center">
                          <span className="text-2xl">🌾</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {order.grain?.title || order.grain?.name || 'Grain'}
                          </h5>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.grain?.grainType} • {order.grain?.variety || 'Standard'}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₹{order.grain?.pricePerQuintal || order.grain?.pricePerKg}/{order.grain?.pricePerQuintal ? 'quintal' : 'kg'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Farmer Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Farmer Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium text-gray-900 mr-2">
                            {order.farmer?.name || 'Farmer'}
                          </span>
                        </div>
                        {order.farmer?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {order.farmer.phone}
                          </div>
                        )}
                        {order.farmer?.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            {order.farmer.address.city}, {order.farmer.address.state}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Delivery Address</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <div className="text-sm text-gray-900">
                          <p className="font-medium">{order.deliveryAddress.name}</p>
                          <p>{order.deliveryAddress.street}</p>
                          <p>
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                          </p>
                          <p className="text-gray-600 mt-1">
                            📞 {order.deliveryAddress.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <Link
                          to={`/buyer/orders/${order._id}`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        {order.farmer?.phone && (
                          <a
                            href={`tel:${order.farmer.phone}`}
                            className="inline-flex items-center px-4 py-2 border border-green-600 rounded-md text-sm font-medium text-green-600 bg-white hover:bg-green-50"
                          >
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            Contact Farmer
                          </a>
                        )}
                      </div>
                      
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="inline-flex items-center px-4 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                        >
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
