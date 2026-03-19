import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SellerLogin from './components/SellerLogin';
import SellerDashboard from './components/SellerDashboard';
import CompleteProfile from './components/CompleteProfile';
import AddProperty from './components/AddProperty';
import ProtectedRoute from './components/ProtectedRoute';

export default function SellerInterface() {
  const location = useLocation();
  const isAddOnly = location.pathname.startsWith('/add-property');

  return (
    <Routes>
      <Route path="login" element={<SellerLogin />} />
      <Route 
        path="complete-profile" 
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="add-property" 
        element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } 
      />
      {/* Dynamic landing for /seller or /add-property entry points */}
      <Route path="/" element={isAddOnly ? <AddProperty /> : <Navigate to="dashboard" replace />} />
    </Routes>
  );
}
