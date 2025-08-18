import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { getGrainById } from '../../services/grainService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GrainDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { t } = useTranslation();
  const { user } = useAuth();
  
  const [grain, setGrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchGrainDetails();
    }
  }, [id]);

  const fetchGrainDetails = async () => {
    try {
      setLoading(true);
      const response = await getGrainById(id);
      setGrain(response.data?.grain || response.data);
    } catch (error) {
      console.error('Error fetching grain details:', error);
      setError('Failed to load grain details');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (!user) {
      navigate('/login', { state: { from: `/grains/${id}` } });
      return;
    }
    
    if (user.role !== 'buyer') {
      alert('Only buyers can place orders');
      return;
    }

    // Navigate to order placement page with grain details
    navigate('/buyer/place-order', { 
      state: { 
        grain: grain,
        quantity: orderQuantity 
      } 
    });
  };

  const handleContactFarmer = () => {
    if (!user) {
      navigate('/login', { state: { from: `/grains/${id}` } });
      return;
    }
    
    // You can implement a contact modal or redirect to a messaging system
    alert('Contact feature will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !grain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Grain Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The grain you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/grains')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Grains
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = (grain.pricePerQuintal || grain.pricePerKg) * orderQuantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg overflow-hidden">
              {grain.images && grain.images.length > 0 ? (
                <img 
                  src={grain.images[0]} 
                  alt={grain.title || grain.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <span className="text-8xl">🌾</span>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {grain.images && grain.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {grain.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-md overflow-hidden">
                    <img src={image} alt={`${grain.title} ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Grain Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {grain.title || grain.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-bold text-green-600">
                  ₹{grain.pricePerQuintal || grain.pricePerKg}/{grain.pricePerQuintal ? 'quintal' : 'kg'}
                </span>
                {grain.isOrganic && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    Organic
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {grain.farmer?.address?.city}, {grain.farmer?.address?.state}
                </span>
                {grain.harvestDate && (
                  <span className="flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    Harvested: {new Date(grain.harvestDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Grain Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grain Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{grain.grainType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Variety:</span>
                  <span className="ml-2 font-medium">{grain.variety || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Available:</span>
                  <span className="ml-2 font-medium">{grain.quantity} {grain.pricePerQuintal ? 'quintals' : 'kg'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Quality:</span>
                  <span className="ml-2 font-medium">{grain.qualityGrade || 'Standard'}</span>
                </div>
                {grain.minimumOrder && (
                  <div>
                    <span className="text-gray-500">Min Order:</span>
                    <span className="ml-2 font-medium">{grain.minimumOrder} {grain.pricePerQuintal ? 'quintals' : 'kg'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {grain.description && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{grain.description}</p>
              </div>
            )}

            {/* Farmer Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Information</h3>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-600">
                    {grain.farmer?.name?.charAt(0) || 'F'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{grain.farmer?.name || 'Farmer'}</h4>
                  <p className="text-sm text-gray-600">
                    {grain.farmer?.address?.city}, {grain.farmer?.address?.state}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    {grain.farmer?.phone && (
                      <span className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {grain.farmer.phone}
                      </span>
                    )}
                    {grain.farmer?.email && (
                      <span className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        {grain.farmer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Section */}
            {user?.role === 'buyer' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity ({grain.pricePerQuintal ? 'quintals' : 'kg'}):
                  </label>
                  <input
                    type="number"
                    min={grain.minimumOrder || 1}
                    max={grain.quantity}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseFloat(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-900">
                    Total: ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleOrder}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
                  >
                    Place Order
                  </button>
                  <button
                    onClick={handleContactFarmer}
                    className="px-6 py-3 border border-green-600 text-green-600 rounded-md hover:bg-green-50 font-medium"
                  >
                    Contact Farmer
                  </button>
                </div>
              </div>
            )}

            {/* Login CTA for non-logged users */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Order?</h3>
                <p className="text-blue-700 mb-4">Login or register to place orders and contact farmers directly.</p>
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 font-medium"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GrainDetails;
