import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/AuthContext';
import { getGrainById, updateGrain } from '../../services/grainService';
import { toast } from 'react-toastify';

const EditGrain = () => {
  const { grainId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  
  const [formData, setFormData] = useState({
    type: '',
    variety: '',
    quantity: '',
    pricePerQuintal: '',
    harvestDate: '',
    description: '',
    qualityGrade: '',
    moistureContent: '',
    organicCertified: false,
    images: []
  });

  const [errors, setErrors] = useState({});

  const grainTypes = [
    'Wheat', 'Rice', 'Corn', 'Barley', 'Oats', 'Millet', 'Sorghum', 'Quinoa', 'Other'
  ];

  const qualityGrades = ['A+', 'A', 'B+', 'B', 'C'];

  useEffect(() => {
    fetchGrainDetails();
  }, [grainId]);

  const fetchGrainDetails = async () => {
    try {
      const response = await getGrainById(grainId);
      const grain = response.grain;
      
      // Check if current user is the owner
      if (grain.farmer._id !== user._id) {
        toast.error('You are not authorized to edit this grain');
        navigate('/farmer/my-listings');
        return;
      }
      
      // Format the date for the input field
      const harvestDate = grain.harvestDate ? 
        new Date(grain.harvestDate).toISOString().split('T')[0] : '';
      
      setFormData({
        type: grain.type || '',
        variety: grain.variety || '',
        quantity: grain.quantity || '',
        pricePerQuintal: grain.pricePerQuintal || '',
        harvestDate: harvestDate,
        description: grain.description || '',
        qualityGrade: grain.qualityGrade || '',
        moistureContent: grain.moistureContent || '',
        organicCertified: grain.organicCertified || false,
        images: grain.images || []
      });
      
      setImagePreview(grain.images || []);
    } catch (error) {
      console.error('Error fetching grain details:', error);
      toast.error('Failed to fetch grain details');
      navigate('/farmer/my-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreview.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = 'Grain type is required';
    if (!formData.variety) newErrors.variety = 'Variety is required';
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.pricePerQuintal || formData.pricePerQuintal <= 0) {
      newErrors.pricePerQuintal = 'Valid price is required';
    }
    if (!formData.harvestDate) newErrors.harvestDate = 'Harvest date is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.qualityGrade) newErrors.qualityGrade = 'Quality grade is required';
    if (formData.moistureContent && (formData.moistureContent < 0 || formData.moistureContent > 100)) {
      newErrors.moistureContent = 'Moisture content must be between 0-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          // Only append new image files
          formData.images.forEach(image => {
            if (image instanceof File) {
              submitData.append('images', image);
            }
          });
          // Append existing image URLs
          const existingImages = formData.images.filter(img => typeof img === 'string');
          if (existingImages.length > 0) {
            submitData.append('existingImages', JSON.stringify(existingImages));
          }
        } else {
          submitData.append(key, formData[key]);
        }
      });

      const response = await updateGrain(grainId, submitData);
      toast.success('Grain updated successfully!');
      navigate('/farmer/my-listings');
    } catch (error) {
      console.error('Error updating grain:', error);
      toast.error(error.response?.data?.message || 'Failed to update grain');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grain details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">Edit Grain Listing</h1>
            <p className="text-green-100 mt-1">Update your grain information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grain Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select grain type</option>
                  {grainTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variety *
                </label>
                <input
                  type="text"
                  name="variety"
                  value={formData.variety}
                  onChange={handleInputChange}
                  placeholder="e.g., Basmati, Durum, etc."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.variety ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.variety && <p className="text-red-500 text-sm mt-1">{errors.variety}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (quintals) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="0.1"
                  placeholder="Available quantity"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Quintal (₹) *
                </label>
                <input
                  type="number"
                  name="pricePerQuintal"
                  value={formData.pricePerQuintal}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Price per quintal"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.pricePerQuintal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pricePerQuintal && <p className="text-red-500 text-sm mt-1">{errors.pricePerQuintal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.harvestDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.harvestDate && <p className="text-red-500 text-sm mt-1">{errors.harvestDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade *
                </label>
                <select
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.qualityGrade ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select quality grade</option>
                  {qualityGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.qualityGrade && <p className="text-red-500 text-sm mt-1">{errors.qualityGrade}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moisture Content (%)
                </label>
                <input
                  type="number"
                  name="moistureContent"
                  value={formData.moistureContent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Optional"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.moistureContent ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.moistureContent && <p className="text-red-500 text-sm mt-1">{errors.moistureContent}</p>}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="organicCertified"
                    checked={formData.organicCertified}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Organic Certified
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide details about your grain quality, storage conditions, etc."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grain Images (Max 5)
              </label>
              
              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Grain ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagePreview.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload grain images
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 10MB each
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/farmer/my-listings')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Updating...' : 'Update Grain'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditGrain;
