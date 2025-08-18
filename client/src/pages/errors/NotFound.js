import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <ExclamationTriangleIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t('errors.404.title')}
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('errors.404.message')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              {t('errors.404.goHome')}
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {t('errors.404.goBack')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
