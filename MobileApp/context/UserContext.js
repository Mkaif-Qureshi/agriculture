import { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';   
import { BACKEND_URL } from '../backendConfig';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const signup = async userData => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: 'Signup Successful!' };
      } else {
        return { success: false, message: data.error || data.message };
      }
    } catch (err) { 
      return { success: false, message: 'Error occurred while signing up.' };
    } finally {
      setLoading(false);
    }
  };
  

  const loginWithEmailPassword = async loginData => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/login-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: 'Login Successful!' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Error logging in with email and password' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhonePassword = async loginData => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/login-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: 'Login Successful!' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Error logging in with phone and password' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        await AsyncStorage.removeItem('user');
        return { success: true, message: 'Logout Successful!' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Error occurred while logging out.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        signup,
        loginWithEmailPassword,
        loginWithPhonePassword,
        logout,
        setUser,
      }}>
      {children}
    </UserContext.Provider>
  );
};
