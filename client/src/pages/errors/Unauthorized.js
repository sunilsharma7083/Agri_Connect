import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon, HomeIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <ShieldExclamationIcon className="h-24 w-24 text-red-400 mx-auto mb-6" />
          
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">403</h1>
          
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Access Denied
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            
            {user && (
              <Link
                to={`/${user.role}/dashboard`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Unauthorized;
