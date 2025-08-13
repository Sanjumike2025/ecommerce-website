import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      setToken(tokenFromUrl);
      // Clean the URL
      urlParams.delete('token');
      window.history.replaceState({}, document.title, `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user details or invalid token", error);
          logout();
        }
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'client') {
        navigate('/client');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw error; // Re-throw to be handled by LoginPage
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
