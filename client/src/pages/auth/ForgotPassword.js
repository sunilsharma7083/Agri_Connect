import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgotPassword } from '../../services/authService';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to:
            </p>
            <p className="font-medium text-gray-900 mb-6">
              {email}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Check your email and click the link to reset your password. 
              If you don't see the email, check your spam folder.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
              >
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Try Different Email
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">Kisaan</h1>
            <h2 className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-500 text-sm font-medium"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </div>
        </form>

        {/* Additional Help */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Check your spam folder</p>
                <p>Sometimes our emails end up in spam or junk folders.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Wait a few minutes</p>
                <p>It may take a few minutes for the email to arrive.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium">Check the email address</p>
                <p>Make sure you entered the correct email address.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Still having trouble?{' '}
            <a href="mailto:support@kisaan.com" className="text-green-600 hover:text-green-500 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
