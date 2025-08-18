import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer', // Default to farmer
    
    // Step 2: Contact & Location
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleBasedRedirect = {
        farmer: '/farmer/dashboard',
        buyer: '/buyer/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(roleBasedRedirect[user.role] || '/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    
    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.pincode) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrev = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result?.success) {
        // Navigation will be handled by useEffect when user state updates
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-300">
                <div className={`h-full transition-all duration-500 ${
                  currentStep >= 2 ? 'bg-green-600 w-full' : 'bg-gray-300 w-0'
                }`}></div>
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Basic Info</span>
              <span>Contact & Location</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-6" onSubmit={handleNext}>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded ${
                              index < passwordStrength()
                                ? strengthColors[passwordStrength() - 1]
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Strength: {strengthLabels[passwordStrength() - 1] || 'Too Short'}
                      </p>
                    </div>
                  )}
                  
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    I am a
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border ${
                        errors.role ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    >
                      <option value="farmer">Farmer - I want to sell grains</option>
                      <option value="buyer">Buyer - I want to purchase grains</option>
                    </select>
                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Contact & Location Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.phone ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your 10-digit mobile number"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Street Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      value={formData.address.street}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors['address.street'] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your street address"
                    />
                    {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
                  </div>
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <div className="mt-1">
                      <input
                        id="address.city"
                        name="address.city"
                        type="text"
                        value={formData.address.city}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors['address.city'] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="City"
                      />
                      {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </label>
                    <div className="mt-1">
                      <input
                        id="address.state"
                        name="address.state"
                        type="text"
                        value={formData.address.state}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors['address.state'] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="State"
                      />
                      {errors['address.state'] && <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>}
                    </div>
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pincode
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.pincode"
                      name="address.pincode"
                      type="text"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors['address.pincode'] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter 6-digit pincode"
                    />
                    {errors['address.pincode'] && <p className="mt-1 text-sm text-red-600">{errors['address.pincode']}</p>}
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="text-center">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
