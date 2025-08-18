import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrderById, cancelOrder } from '../../services/orderService';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await getOrderById(orderId);
      setOrder(response.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      navigate('/buyer/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusSteps = () => {
    const allSteps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = allSteps.indexOf(order?.status?.toLowerCase());
    
    return allSteps.map((step, index) => ({
      name: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const canCancelOrder = () => {
    return order && ['pending', 'confirmed'].includes(order.status?.toLowerCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order not found</h2>
          <button
            onClick={() => navigate('/buyer/my-orders')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Orders
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
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600 mt-1">Order #{order._id}</p>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₹{order.totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Progress */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Status</h2>
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => (
                  <div key={step.name} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.completed
                            ? 'bg-green-600 text-white'
                            : step.current
                            ? 'bg-green-100 text-green-600 border-2 border-green-600'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <span className={`mt-2 text-xs ${step.completed || step.current ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.name}
                      </span>
                    </div>
                    {index < getStatusSteps().length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-green-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
                <div className="border rounded-lg p-4">
                  <div className="flex space-x-4">
                    {order.grain?.images && order.grain.images.length > 0 && (
                      <img
                        src={order.grain.images[0]}
                        alt={order.grain.type}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{order.grain?.type}</h3>
                      <p className="text-sm text-gray-600">{order.grain?.variety}</p>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity} quintals</p>
                      <p className="text-sm text-gray-600">Price: ₹{order.pricePerQuintal}/quintal</p>
                      <p className="text-lg font-semibold text-green-600 mt-2">
                        ₹{(order.quantity * order.pricePerQuintal).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Farmer Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{order.farmer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{order.farmer?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{order.farmer?.address?.city}, {order.farmer?.address?.state}</span>
                  </div>
                  {order.farmer?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{order.farmer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Special Instructions</h2>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {order.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{(order.quantity * order.pricePerQuintal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span>₹{order.deliveryType === 'delivery' ? '200' : '0'}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{order.deliveryType}</span>
                  </div>
                  {order.deliveryType === 'delivery' && order.deliveryAddress && (
                    <div className="space-y-2">
                      <span className="text-gray-600 block">Address:</span>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">{order.deliveryAddress.street}</p>
                        <p className="text-sm">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </p>
                        {order.deliveryAddress.landmark && (
                          <p className="text-sm text-gray-600">Near: {order.deliveryAddress.landmark}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium uppercase">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {canCancelOrder() && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/buyer/my-orders')}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Orders
                </button>
                
                <button
                  onClick={() => navigate('/buyer/marketplace')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;
