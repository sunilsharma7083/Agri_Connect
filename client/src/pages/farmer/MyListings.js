import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { getMyGrains, deleteGrain, updateGrainStatus } from '../../services/grainService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const MyListings = () => {
  // const { t } = useTranslation();
  const { user } = useAuth();
  const [grains, setGrains] = useState([]);
  const [filteredGrains, setFilteredGrains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyGrains();
  }, []);

  useEffect(() => {
    filterGrains();
  }, [grains, statusFilter]);

  const fetchMyGrains = async () => {
    try {
      setIsLoading(true);
      const response = await getMyGrains();
      setGrains(response.data?.grains || []);
    } catch (error) {
      console.error('Error fetching grains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterGrains = () => {
    if (statusFilter === 'all') {
      setFilteredGrains(grains);
    } else {
      setFilteredGrains(grains.filter(grain => grain.status === statusFilter));
    }
  };

  const handleDeleteGrain = async (grainId) => {
    if (window.confirm('Are you sure you want to delete this grain listing?')) {
      try {
        await deleteGrain(grainId);
        setGrains(grains.filter(grain => grain._id !== grainId));
      } catch (error) {
        console.error('Error deleting grain:', error);
        alert('Failed to delete grain. Please try again.');
      }
    }
  };

  const handleStatusChange = async (grainId, newStatus) => {
    try {
      await updateGrainStatus(grainId, newStatus);
      setGrains(grains.map(grain => 
        grain._id === grainId ? { ...grain, status: newStatus } : grain
      ));
    } catch (error) {
      console.error('Error updating grain status:', error);
      alert('Failed to update grain status. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircleIcon,
        label: 'Active' 
      },
      inactive: { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', 
        icon: XCircleIcon,
        label: 'Inactive' 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        icon: ClockIcon,
        label: 'Pending' 
      },
      sold: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
        icon: CheckCircleIcon,
        label: 'Sold Out' 
      }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Grain Listings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your grain listings and track their performance
            </p>
          </div>
          <Link
            to="/farmer/add-grain"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Grain
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Listings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{grains.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {grains.filter(g => g.status === 'active').length}
                </p>
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
                  {grains.filter(g => g.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-purple-100 dark:bg-purple-900/30">
                <CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sold Out</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {grains.filter(g => g.status === 'sold').length}
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
              <option value="all">All Listings</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold Out</option>
            </select>
          </div>
        </motion.div>

        {/* Grains Grid */}
        {filteredGrains.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🌾</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {grains.length === 0 ? 'No grain listings yet' : 'No grains match the filter'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {grains.length === 0 
                ? "Start by adding your first grain listing to reach buyers across India"
                : "Try adjusting your filter to see more listings"
              }
            </p>
            {grains.length === 0 && (
              <Link
                to="/farmer/add-grain"
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Your First Grain
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredGrains.map((grain, index) => (
              <motion.div
                key={grain._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 hover:shadow-md dark:hover:shadow-gray-600/50 transition-shadow overflow-hidden"
              >
                {/* Grain Image */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                  {grain.images && grain.images.length > 0 ? (
                    <img 
                      src={grain.images[0]} 
                      alt={grain.title || grain.grainType}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🌾</div>
                  )}
                </div>

                {/* Grain Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {grain.title || grain.grainType}
                    </h3>
                    {getStatusBadge(grain.status || 'pending')}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                    {grain.grainType} • {grain.variety || 'Standard'}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{grain.pricePerQuintal || grain.pricePerKg}/{grain.pricePerQuintal ? 'quintal' : 'kg'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {grain.quantity} {grain.pricePerQuintal ? 'quintals' : 'kg'} available
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    📅 Listed: {new Date(grain.createdAt).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/grains/${grain._id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    <Link
                      to={`/farmer/edit-grain/${grain._id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-green-600 text-green-600 dark:text-green-400 rounded-md text-sm hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteGrain(grain._id)}
                      className="px-3 py-2 border border-red-600 text-red-600 dark:text-red-400 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Toggle */}
                  {grain.status !== 'sold' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <select
                        value={grain.status || 'pending'}
                        onChange={(e) => handleStatusChange(grain._id, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="active">Mark as Active</option>
                        <option value="inactive">Mark as Inactive</option>
                        <option value="pending">Mark as Pending</option>
                        <option value="sold">Mark as Sold Out</option>
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
