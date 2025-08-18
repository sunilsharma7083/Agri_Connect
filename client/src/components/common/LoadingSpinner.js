import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-green-600',
    secondary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600 dark:border-gray-400'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-2 border-t-transparent rounded-full
        `}
      />
    </div>
  );
};

export default LoadingSpinner;
