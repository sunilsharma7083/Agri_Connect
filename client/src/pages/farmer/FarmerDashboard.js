import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  RectangleStackIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../contexts/AuthContext';
import { getMyGrains } from '../../services/grainService';
import { getReceivedOrders } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FarmerDashboard = () => {
  // const { t } = useTranslation();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    totalRevenue: 0
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
        getMyGrains(),
        getReceivedOrders()
      ]);

      // Calculate stats
      const grains = grainsResponse.data.grains || [];
      const orders = ordersResponse.data.orders || [];
      
      const activeListings = grains.filter(grain => grain.status === 'active').length;
      const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalListings: grains.length,
        activeListings,
        totalOrders: orders.length,
        totalRevenue
      });

      setRecentGrains(grains.slice(0, 5));
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Grain',
      description: 'List your grains for sale',
      href: '/farmer/add-grain',
      icon: PlusIcon,
      color: 'bg-green-500'
    },
    {
      title: 'View Listings',
      description: 'Manage your grain listings',
      href: '/farmer/my-listings',
      icon: RectangleStackIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'View Orders',
      description: 'Check received orders',
      href: '/farmer/received-orders',
      icon: TruckIcon,
      color: 'bg-purple-500'
    }
  ];

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: RectangleStackIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: ChartBarIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: TruckIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'Farmer'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your grain listings and track your sales performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50 p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50 hover:shadow-md dark:hover:shadow-gray-600/50 transition-shadow duration-200 p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${action.color} p-2 rounded-lg text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Grains */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Listings
                </h3>
                <Link
                  to="/farmer/my-listings"
                  className="text-green-600 hover:text-green-500 dark:text-green-400 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentGrains.length > 0 ? (
                <div className="space-y-4">
                  {recentGrains.map((grain) => (
                    <div key={grain._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{grain.grainType}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {grain.quantity} quintals • ₹{grain.pricePerQuintal}/quintal
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/grains/${grain._id}`}
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/farmer/edit-grain/${grain._id}`}
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <RectangleStackIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No listings yet</p>
                  <Link
                    to="/farmer/add-grain"
                    className="text-green-600 hover:text-green-500 dark:text-green-400 text-sm font-medium"
                  >
                    Add your first grain
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Orders
                </h3>
                <Link
                  to="/farmer/received-orders"
                  className="text-green-600 hover:text-green-500 dark:text-green-400 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.grain?.grainType}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.quantity} quintals • {order.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{order.totalAmount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <TruckIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No orders received yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
