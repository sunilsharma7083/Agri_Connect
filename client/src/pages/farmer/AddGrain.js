import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { createGrain, uploadGrainImages } from '../../services/grainService';

const AddGrain = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    grainType: '',
    variety: '',
    quantity: '',
    pricePerQuintal: '',
    qualityGrade: '',
    harvestDate: '',
    description: '',
    minimumOrder: '',
    isOrganic: false,
    certifications: [],
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const grainTypes = [
    'wheat', 'rice', 'corn', 'barley', 'millet', 'sorghum', 'oats', 'quinoa', 'other'
  ];

  const qualityGrades = [
    'A', 'B', 'C'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (!formData.grainType) {
      newErrors.grainType = 'Grain type is required';
    }
    if (!formData.variety.trim()) {
      newErrors.variety = 'Variety is required';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    } else if (formData.quantity < 0.1) {
      newErrors.quantity = 'Quantity must be at least 0.1 quintals';
    } else if (formData.quantity > 10000) {
      newErrors.quantity = 'Quantity cannot exceed 10000 quintals';
    }
    
    if (!formData.pricePerQuintal || formData.pricePerQuintal <= 0) {
      newErrors.pricePerQuintal = 'Valid price is required';
    } else if (formData.pricePerQuintal < 100) {
      newErrors.pricePerQuintal = 'Price must be at least ₹100 per quintal';
    } else if (formData.pricePerQuintal > 50000) {
      newErrors.pricePerQuintal = 'Price cannot exceed ₹50,000 per quintal';
    }
    
    if (!formData.qualityGrade) {
      newErrors.qualityGrade = 'Quality grade is required';
    }
    if (!formData.harvestDate) {
      newErrors.harvestDate = 'Harvest date is required';
    } else if (new Date(formData.harvestDate) > new Date()) {
      newErrors.harvestDate = 'Harvest date cannot be in the future';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }
    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }
    if (!formData.location.pincode.trim()) {
      newErrors['location.pincode'] = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.location.pincode)) {
      newErrors['location.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create grain
      const grainData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        availableQuantity: parseFloat(formData.quantity), // Set availableQuantity to the same as quantity initially
        pricePerQuintal: parseFloat(formData.pricePerQuintal),
        minimumOrderQuantity: formData.minimumOrder ? parseFloat(formData.minimumOrder) : 1
      };

      console.log('📤 Submitting grain data:', JSON.stringify(grainData, null, 2));
      const response = await createGrain(grainData);
      
      // Upload images if any
      if (images.length > 0 && response.data?.grain?._id) {
        const formDataImages = new FormData();
        images.forEach(image => {
          formDataImages.append('grainImages', image);
        });
        
        await uploadGrainImages(response.data.grain._id, formDataImages);
      }

      navigate('/farmer/dashboard', { 
        state: { message: 'Grain added successfully!' }
      });
      
    } catch (error) {
      console.error('Error adding grain:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      } else {
        setErrors({ 
          submit: error.response?.data?.message || 'Failed to add grain. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Add New Grain
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grain Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g., Premium Basmati Rice (min 5 characters)"
                  minLength={5}
                  maxLength={100}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grain Type *
                </label>
                <select
                  name="grainType"
                  value={formData.grainType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select grain type</option>
                  {grainTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.grainType && <p className="text-red-500 text-sm mt-1">{errors.grainType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variety *
                </label>
                <input
                  type="text"
                  name="variety"
                  value={formData.variety}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., Basmati 1121"
                />
                {errors.variety && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.variety}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality Grade *
                </label>
                <select
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select quality grade</option>
                  {qualityGrades.map(grade => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
                {errors.qualityGrade && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.qualityGrade}</p>}
              </div>
            </div>

            {/* Quantity and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Quantity (Quintals) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.1"
                  max="10000"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., 100 (0.1 - 10000)"
                />
                {errors.quantity && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price per Quintal (₹) *
                </label>
                <input
                  type="number"
                  name="pricePerQuintal"
                  value={formData.pricePerQuintal}
                  onChange={handleChange}
                  min="100"
                  max="50000"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="₹100 - ₹50,000 (e.g., 2500)"
                />
                {errors.pricePerQuintal && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.pricePerQuintal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Order (Quintals)
                </label>
                <input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            {/* Harvest Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harvest Date *
              </label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.harvestDate && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.harvestDate}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                minLength={20}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Describe your grain quality, storage conditions, etc. (min 20 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && <p className="text-red-500 dark:text-red-400 text-sm">{errors.description}</p>}
                <p className="text-gray-500 dark:text-gray-400 text-sm ml-auto">
                  {formData.description.length}/1000 characters (min 20)
                </p>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Location Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your complete address"
                  />
                  {errors['location.address'] && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors['location.address']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter city"
                  />
                  {errors['location.city'] && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors['location.city']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter state"
                  />
                  {errors['location.state'] && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors['location.state']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                  />
                  {errors['location.pincode'] && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors['location.pincode']}</p>}
                </div>
              </div>
            </div>

            {/* Organic Certification */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isOrganic"
                checked={formData.isOrganic}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                This is organically grown grain
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grain Images (Max 5)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-300"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload clear images of your grain. Maximum 5 images allowed.
              </p>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/farmer/dashboard')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding Grain...' : 'Add Grain'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddGrain;
