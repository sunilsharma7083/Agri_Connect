import React, { Suspense, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthContext } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));

const Grains = React.lazy(() => import('./pages/grains/Grains'));
const GrainDetails = React.lazy(() => import('./pages/grains/GrainDetails'));

const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Profile = React.lazy(() => import('./pages/profile/Profile'));

// Farmer pages
const FarmerDashboard = React.lazy(() => import('./pages/farmer/FarmerDashboard'));
const MyListings = React.lazy(() => import('./pages/farmer/MyListings'));
const AddGrain = React.lazy(() => import('./pages/farmer/AddGrain'));
const EditGrain = React.lazy(() => import('./pages/farmer/EditGrain'));
const ReceivedOrders = React.lazy(() => import('./pages/farmer/ReceivedOrders'));

// Buyer pages
const BuyerDashboard = React.lazy(() => import('./pages/buyer/BuyerDashboard'));
const MyOrders = React.lazy(() => import('./pages/buyer/MyOrders'));
const OrderDetails = React.lazy(() => import('./pages/buyer/OrderDetails'));
const PlaceOrder = React.lazy(() => import('./pages/buyer/PlaceOrder'));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = React.lazy(() => import('./pages/admin/ManageUsers'));
const ManageGrains = React.lazy(() => import('./pages/admin/ManageGrains'));
const ManageOrders = React.lazy(() => import('./pages/admin/ManageOrders'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));

// Error pages
const NotFound = React.lazy(() => import('./pages/errors/NotFound'));
const Unauthorized = React.lazy(() => import('./pages/errors/Unauthorized'));

// Page animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Helmet>
        <title>AgriConnect - Digital Grain Marketplace</title>
        <meta name="description" content="Connect farmers with buyers for fresh, quality grains" />
      </Helmet>

      <Navbar />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="large" />
            </div>
          }>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Home />
                </motion.div>
              } />
              
              <Route path="/grains" element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Grains />
                </motion.div>
              } />
              
              <Route path="/grains/:id" element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <GrainDetails />
                </motion.div>
              } />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Farmer routes */}
              <Route path="/farmer/dashboard" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/farmer/my-listings" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <MyListings />
                </ProtectedRoute>
              } />
              
              <Route path="/farmer/add-grain" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <AddGrain />
                </ProtectedRoute>
              } />
              
              <Route path="/farmer/edit-grain/:id" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <EditGrain />
                </ProtectedRoute>
              } />
              
              <Route path="/farmer/received-orders" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ReceivedOrders />
                </ProtectedRoute>
              } />

              {/* Buyer routes */}
              <Route path="/buyer/dashboard" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/my-orders" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <MyOrders />
                </ProtectedRoute>
              } />
              
              <Route path="/buyer/orders/:id" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <OrderDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/order/:grainId" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <PlaceOrder />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/grains" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageGrains />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageOrders />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              } />

              {/* Error routes */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
