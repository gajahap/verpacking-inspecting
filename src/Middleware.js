import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';

const Middleware = ({ children }) => {
  const token = localStorage.getItem('token'); // Pastikan token disimpan di localStorage saat login.

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Jika tidak ada token, redirect ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children; // Render komponen anak jika token valid
};

export default Middleware;
