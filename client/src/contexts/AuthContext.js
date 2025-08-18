import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { 
  login as authLogin, 
  register as authRegister, 
  updateProfile, 
  changePassword,
  getCurrentUser
} from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAIL: 'AUTH_FAIL',
  AUTH_LOADING: 'AUTH_LOADING',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_FAIL:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.AUTH_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Export AuthContext
export { AuthContext };

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in axios defaults and localStorage
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

    // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await getCurrentUser();
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      dispatch({ type: AUTH_ACTIONS.AUTH_LOADING, payload: false });
    };

    checkAuth();
  }, []);

  // Login function
  const loginUser = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      const response = await authLogin(email, password);
      console.log('🔐 Login response:', response);
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.token,
        },
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('🔐 Login error:', error);
      console.error('🔐 Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAIL, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const registerUser = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      const response = await authRegister(userData);
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.token,
        },
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAIL, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const response = await updateProfile(profileData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
      });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changeUserPassword = async (passwordData) => {
    try {
      await changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login: loginUser,
    register: registerUser,
    logout,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
