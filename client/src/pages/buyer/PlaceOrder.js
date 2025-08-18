import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/AuthContext';
import { getGrainById } from '../../services/grainService';
import { createOrder } from '../../services/orderService';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const { grainId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [grain, setGrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    deliveryType: 'pickup',
    paymentMethod: 'cod',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchGrainDetails();
    if (user?.address) {
      setOrderData(prev => ({
        ...prev,
        deliveryAddress: user.address
      }));
    }
  }, [grainId, user]);

  const fetchGrainDetails = async () => {
    try {
      const response = await getGrainById(grainId);
      setGrain(response.grain);
    } catch (error) {
      console.error('Error fetching grain details:', error);
      toast.error('Failed to fetch grain details');
      navigate('/buyer/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateTotal = () => {
    if (!grain) return 0;
    const baseAmount = grain.pricePerQuintal * orderData.quantity;
    const deliveryCharge = orderData.deliveryType === 'delivery' ? 200 : 0;
    return baseAmount + deliveryCharge;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate order data
      if (orderData.quantity < 1 || orderData.quantity > grain.quantity) {
        toast.error('Please enter a valid quantity');
        setSubmitting(false);
        return;
      }

      if (orderData.deliveryType === 'delivery') {
        const { street, city, state, pincode } = orderData.deliveryAddress;
        if (!street || !city || !state || !pincode) {
          toast.error('Please fill in all delivery address fields');
          setSubmitting(false);
          return;
        }
      }

      const orderPayload = {
        grainId: grain._id,
        farmerId: grain.farmer._id,
        quantity: orderData.quantity,
        pricePerQuintal: grain.pricePerQuintal,
        totalAmount: calculateTotal(),
        deliveryType: orderData.deliveryType,
        paymentMethod: orderData.paymentMethod,
        specialInstructions: orderData.specialInstructions
      };

      if (orderData.deliveryType === 'delivery') {
        orderPayload.deliveryAddress = orderData.deliveryAddress;
      }

      const response = await createOrder(orderPayload);
      toast.success('Order placed successfully!');
      navigate(`/buyer/orders/${response.order._id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
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

  if (!grain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Grain not found</h2>
          <button
            onClick={() => navigate('/buyer/marketplace')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Marketplace
          </button>
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
            <h1 className="text-2xl font-bold">Place Order</h1>
            <p className="text-green-100 mt-1">Complete your grain purchase</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="p-6 space-y-8">
            {/* Grain Details Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="flex space-x-4">
                {grain.images && grain.images.length > 0 && (
                  <img
                    src={grain.images[0]}
                    alt={grain.type}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{grain.type}</h3>
                  <p className="text-sm text-gray-600">{grain.variety}</p>
                  <p className="text-sm text-gray-600">By: {grain.farmer.name}</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{grain.pricePerQuintal}/quintal
                  </p>
                  <p className="text-sm text-gray-500">
                    Available: {grain.quantity} quintals
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (quintals)
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('quantity', Math.max(1, orderData.quantity - 1))}
                  className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={grain.quantity}
                  value={orderData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('quantity', Math.min(grain.quantity, orderData.quantity + 1))}
                  className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300"
                >
                  +
                </button>
                <span className="text-sm text-gray-600">
                  Total: ₹{(grain.pricePerQuintal * orderData.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivery Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Delivery Option
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={orderData.deliveryType === 'pickup'}
                    onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    orderData.deliveryType === 'pickup'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <h3 className="font-medium text-gray-900">Self Pickup</h3>
                    <p className="text-sm text-gray-600">Pick up from farmer's location</p>
                    <p className="text-sm font-medium text-green-600">Free</p>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={orderData.deliveryType === 'delivery'}
                    onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    orderData.deliveryType === 'delivery'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <h3 className="font-medium text-gray-900">Home Delivery</h3>
                    <p className="text-sm text-gray-600">Delivered to your address</p>
                    <p className="text-sm font-medium text-green-600">₹200</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Address (if delivery selected) */}
            {orderData.deliveryType === 'delivery' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.street}
                      onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.city}
                      onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.state}
                      onChange={(e) => handleInputChange('deliveryAddress.state', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.pincode}
                      onChange={(e) => handleInputChange('deliveryAddress.pincode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.landmark}
                      onChange={(e) => handleInputChange('deliveryAddress.landmark', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter landmark"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={orderData.paymentMethod === 'cod'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-green-600"
                  />
                  <span className="ml-3">Cash on Delivery</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={orderData.paymentMethod === 'online'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-green-600"
                  />
                  <span className="ml-3">Online Payment</span>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={orderData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any special instructions for the farmer or delivery..."
              />
            </div>

            {/* Order Total */}
            <div className="border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Grain Cost ({orderData.quantity} quintals)</span>
                  <span>₹{(grain.pricePerQuintal * orderData.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>₹{orderData.deliveryType === 'delivery' ? '200' : '0'}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceOrder;
