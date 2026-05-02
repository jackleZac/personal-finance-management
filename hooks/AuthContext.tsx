import React, { createContext, useContext, useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { storeData, retrieveData, removeData } from './DataEncryption';

type AuthContextType = {
  token: string | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  name: string | null;
};

interface AuthData {
  authToken: string;
  userId: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  AUTH_DATA: 'secure_auth_data',
} as const;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token on app start
    const loadToken = async () => {
      try {
        console.log('Loading stored auth data...');
        const authData = await retrieveData<AuthData>(STORAGE_KEYS.AUTH_DATA);
        
        if (authData && authData.authToken && authData.userId) {
          setToken(authData.authToken);
          setUserId(authData.userId);
          setName(authData.name || null);
          console.log('Auth data loaded successfully');
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        console.log('Auth data loading complete');
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const saveAuthData = async (authToken: string, userIdValue: string, userName: string) => {
    try {
      await storeData(STORAGE_KEYS.AUTH_DATA, {
        authToken,
        userId: userIdValue,
        name: userName,
      });
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const apiCoreUrl = Constants.expoConfig?.extra?.apiCoreUrl;
      const response = await fetch(`${apiCoreUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      const { token: authToken, user_id, name: userName } = result;
      if (!authToken || user_id === undefined || user_id === null) {
        throw new Error('Invalid login response: token or user_id missing');
      }

      const userIdString = String(user_id);

      // Update state
      setToken(authToken);
      setUserId(userIdString);
      setName(userName);

      // Save to encrypted storage
      await saveAuthData(authToken, userIdString, userName);

    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (googleToken: string) => {
    try {
      const apiCoreUrl = Constants.expoConfig?.extra?.apiCoreUrl;
      const response = await fetch(`${apiCoreUrl}/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Google login failed');
      }
      
      const { token: authToken, user_id, name: userName } = result;
      if (!authToken || user_id === undefined || user_id === null) {
        throw new Error('Invalid login response');
      }
      
      const userIdString = String(user_id);

      // Update state
      setToken(authToken);
      setUserId(userIdString);
      setName(userName || null);

      // Save to encrypted storage
      await saveAuthData(authToken, userIdString, userName || '');

    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const apiCoreUrl = Constants.expoConfig?.extra?.apiCoreUrl;
      const response = await fetch(`${apiCoreUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Sign up failed');
      }

      // For email signup, user needs to verify email first
      // So we DON'T store token/userId until they verify and login
      // The signup is successful but they're not logged in yet
      console.log('Signup successful, awaiting email verification');

    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state
      setToken(null);
      setUserId(null);
      setName(null);

      // Remove from encrypted storage
      await removeData(STORAGE_KEYS.AUTH_DATA);
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear state even if storage removal fails
      setToken(null);
      setUserId(null);
      setName(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, googleLogin, logout, signup, isLoading, name }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};