import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  updateAccount, 
  updateNotificationSettings, 
  updatePrivacySettings, 
  updateLanguageSettings, 
  deleteAccount 
} from '../../services/authService';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  
  // Account Settings
  const [accountData, setAccountData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    marketingEmails: false,
    priceAlerts: true,
    newListings: false
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showPhoneNumber: true,
    showEmail: false,
    allowContactFromBuyers: true,
    dataCollection: true
  });

  // Language & Region Settings
  const [languageSettings, setLanguageSettings] = useState({
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY'
  });

  useEffect(() => {
    if (user) {
      setAccountData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (accountData.newPassword) {
        if (accountData.newPassword !== accountData.confirmPassword) {
          toast.error('New passwords do not match');
          setLoading(false);
          return;
        }
        if (accountData.newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
      }

      const updateData = {
        email: accountData.email
      };

      if (accountData.newPassword) {
        updateData.currentPassword = accountData.currentPassword;
        updateData.newPassword = accountData.newPassword;
      }

      const response = await updateAccount(updateData);
      setUser(response.user);
      toast.success('Account updated successfully');
      
      setAccountData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await updateNotificationSettings(notificationSettings);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      await updatePrivacySettings(privacySettings);
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageUpdate = async () => {
    setLoading(true);
    try {
      await updateLanguageSettings(languageSettings);
      toast.success('Language settings updated');
    } catch (error) {
      toast.error('Failed to update language settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        toast.success('Account deleted successfully');
        // Redirect to home or login
        window.location.href = '/';
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'language', label: 'Language & Region', icon: '🌐' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-green-100 mt-1">Manage your account preferences and settings</p>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r">
              <nav className="p-4 space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
                  
                  <form onSubmit={handleAccountUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={accountData.email}
                        onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={accountData.currentPassword}
                            onChange={(e) => setAccountData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={accountData.newPassword}
                            onChange={(e) => setAccountData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={accountData.confirmPassword}
                            onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Account'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h3 className="font-medium text-gray-800 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'smsNotifications' && 'Receive notifications via SMS'}
                            {key === 'orderUpdates' && 'Get notified about order status changes'}
                            {key === 'marketingEmails' && 'Receive promotional emails and offers'}
                            {key === 'priceAlerts' && 'Get alerts when grain prices change'}
                            {key === 'newListings' && 'Notifications for new grain listings'}
                          </p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-green-600' : 'bg-gray-200'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="public">Public - Anyone can view</option>
                        <option value="registered">Registered Users Only</option>
                        <option value="private">Private - Only you</option>
                      </select>
                    </div>

                    {Object.entries(privacySettings).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b">
                        <div>
                          <h3 className="font-medium text-gray-800 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'showPhoneNumber' && 'Display your phone number on your profile'}
                            {key === 'showEmail' && 'Display your email address on your profile'}
                            {key === 'allowContactFromBuyers' && 'Allow buyers to contact you directly'}
                            {key === 'dataCollection' && 'Allow data collection for improving services'}
                          </p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPrivacySettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-green-600' : 'bg-gray-200'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>
                    ))}
                    
                    <button
                      onClick={handlePrivacyUpdate}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Language & Region Settings */}
              {activeTab === 'language' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800">Language & Region</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={languageSettings.language}
                        onChange={(e) => setLanguageSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                        <option value="mr">Marathi (मराठी)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={languageSettings.currency}
                        onChange={(e) => setLanguageSettings(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={languageSettings.timezone}
                        onChange={(e) => setLanguageSettings(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                        <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={languageSettings.dateFormat}
                        onChange={(e) => setLanguageSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLanguageUpdate}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Save Language Settings'}
                  </button>
                </motion.div>
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
                  
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Delete Account</h3>
                    <p className="text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                      All your listings, orders, and data will be permanently removed.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
