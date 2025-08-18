import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../contexts/AuthContext';
import { getAllGrains } from '../../services/grainService';
import { getMyOrders } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BuyerDashboard = () => {
  // const { t } = useTranslation();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [recentGrains, setRecentGrains] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
            const [grainsResponse, ordersResponse] = await Promise.all([
        getAllGrains(),
        getMyOrders()
      ]);

      // Calculate stats
      const orders = ordersResponse.data?.orders || [];
      const pendingOrders = orders.filter(order => ['pending', 'confirmed'].includes(order.status)).length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const totalSpent = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalSpent
      });

      setRecentGrains(grainsResponse.data?.grains || []);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Browse Grains',
      description: 'Find quality grains from verified farmers',
      href: '/grains',
      icon: MagnifyingGlassIcon,
      color: 'bg-green-500'
    },
    {
      title: 'My Orders',
      description: 'Track your current and past orders',
      href: '/buyer/orders',
      icon: ShoppingCartIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Order History',
      description: 'View detailed order history and receipts',
      href: '/buyer/order-history',
      icon: TruckIcon,
      color: 'bg-purple-500'
    }
  ];

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircleIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Spent',
      value: `₹${stats.totalSpent.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Confirmed' },
      shipped: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Delivered' },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover fresh grains directly from farmers across India
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6 hover:shadow-md dark:hover:shadow-gray-600/50 transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-md ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900">{action.title}</h3>
                </div>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Grains */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Fresh Grains Available</h2>
              <Link to="/grains" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {recentGrains.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No grains available at the moment</p>
            ) : (
              <div className="space-y-4">
                {recentGrains.map((grain) => (
                  <div key={grain._id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-yellow-100 rounded-md flex items-center justify-center">
                      <span className="text-lg">🌾</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{grain.title || grain.name}</h4>
                      <p className="text-sm text-gray-500">{grain.grainType} • {grain.farmer?.address?.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">₹{grain.pricePerQuintal || grain.pricePerKg}/kg</p>
                      <p className="text-xs text-gray-500">{grain.quantity} kg available</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/buyer/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link
                  to="/grains"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</p>
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
