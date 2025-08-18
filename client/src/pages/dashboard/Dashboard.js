import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../contexts/AuthContext';
import FarmerDashboard from '../farmer/FarmerDashboard';
import BuyerDashboard from '../buyer/BuyerDashboard';
import AdminDashboard from '../admin/AdminDashboard';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to role-specific dashboard
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.role) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Render based on user role
  switch (user.role) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'buyer':
      return <BuyerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('dashboard.invalidRole')}
            </h1>
            <p className="text-gray-600">
              {t('dashboard.contactSupport')}
            </p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
