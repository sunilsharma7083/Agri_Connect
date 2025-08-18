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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
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
    
    // Clear error when user starts typing
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
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation - matching backend requirements
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

    // Phone validation - matching backend requirements
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Indian phone number starting with 6-9';
    }

    // Address validations
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }

    if (!formData.address.pincode.trim()) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode starting with 1-9';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrev = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
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
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{t('auth.register.step1')}</span>
              <span>{t('auth.register.step2')}</span>
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
              <form className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.name')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.email')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.password')}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.password')}
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
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                  
                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength() ? strengthColors[passwordStrength() - 1] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {strengthLabels[passwordStrength() - 1] || strengthLabels[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.confirmPassword')}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.confirmPassword')}
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
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.role')}
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="farmer"
                        name="role"
                        type="radio"
                        value="farmer"
                        checked={formData.role === 'farmer'}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                      />
                      <label htmlFor="farmer" className="ml-3 block text-sm font-medium text-gray-700">
                        Farmer (Sell grains)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="buyer"
                        name="role"
                        type="radio"
                        value="buyer"
                        checked={formData.role === 'buyer'}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                      />
                      <label htmlFor="buyer" className="ml-3 block text-sm font-medium text-gray-700">
                        Buyer (Buy grains)
                      </label>
                    </div>
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {t('auth.register.next')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Contact & Location */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.phone')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Address fields */}
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.street')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      required
                      value={formData.address.street}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.street')}
                    />
                  </div>
                  {errors['address.street'] && (
                    <p className="mt-2 text-sm text-red-600">{errors['address.street']}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      {t('auth.fields.city')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="address.city"
                        name="address.city"
                        type="text"
                        required
                        value={formData.address.city}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder={t('auth.placeholders.city')}
                      />
                    </div>
                    {errors['address.city'] && (
                      <p className="mt-2 text-sm text-red-600">{errors['address.city']}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                      {t('auth.fields.state')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="address.state"
                        name="address.state"
                        type="text"
                        required
                        value={formData.address.state}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                        } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder={t('auth.placeholders.state')}
                      />
                    </div>
                    {errors['address.state'] && (
                      <p className="mt-2 text-sm text-red-600">{errors['address.state']}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                    {t('auth.fields.pincode')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.pincode"
                      name="address.pincode"
                      type="text"
                      required
                      value={formData.address.pincode}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors['address.pincode'] ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      placeholder={t('auth.placeholders.pincode')}
                    />
                  </div>
                  {errors['address.pincode'] && (
                    <p className="mt-2 text-sm text-red-600">{errors['address.pincode']}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {t('auth.register.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : t('auth.register.submit')}
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
