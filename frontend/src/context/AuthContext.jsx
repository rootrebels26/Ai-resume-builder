import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  verifyCompanyAccessCode,
  checkSessionStatus,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredToken());
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    targetPath: null,
    message: null,
    onSuccess: null,
  });

  // Verify stored session on initial mount
  useEffect(() => {
    let mounted = true;
    async function verifyExistingSession() {
      const token = getStoredToken();
      if (!token) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const response = await checkSessionStatus();
        if (mounted) {
          if (response && response.success) {
            setIsAuthenticated(true);
          } else {
            clearStoredToken();
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        // If server is unreachable or token is invalid
        if (mounted) {
          if (err && err.status === 401) {
            clearStoredToken();
            setIsAuthenticated(false);
          } else {
            // Optimistic keep if offline or server temporary hiccup
            setIsAuthenticated(true);
          }
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    verifyExistingSession();
    return () => {
      mounted = false;
    };
  }, []);

  const openLoginModal = (config = {}) => {
    setModalConfig({
      targetPath: config.targetPath || null,
      message: config.message || null,
      onSuccess: config.onSuccess || null,
    });
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setModalConfig({
      targetPath: null,
      message: null,
      onSuccess: null,
    });
  };

  const loginWithCode = async (code) => {
    try {
      const response = await verifyCompanyAccessCode(code);
      if (response && response.success && response.token) {
        setStoredToken(response.token);
        setIsAuthenticated(true);

        const currentConfig = { ...modalConfig };
        closeLoginModal();

        if (typeof currentConfig.onSuccess === 'function') {
          currentConfig.onSuccess();
        }

        return { success: true, message: response.message || 'Access granted' };
      } else {
        return {
          success: false,
          message: response?.message || 'Invalid access code. Please check and try again.',
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Invalid company access code. Please try again.',
      };
    }
  };

  const logout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
  };

  /**
   * Helper that executes the given action if authenticated, or pops the login modal if not.
   */
  const requireAuth = (callbackOrAction, message = null) => {
    if (isAuthenticated) {
      if (typeof callbackOrAction === 'function') {
        callbackOrAction();
      }
      return true;
    }

    openLoginModal({
      message: message || 'Please enter your company access code to continue.',
      onSuccess: typeof callbackOrAction === 'function' ? callbackOrAction : null,
    });
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isCheckingAuth,
        isLoginModalOpen,
        modalConfig,
        openLoginModal,
        closeLoginModal,
        loginWithCode,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
