import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AuthSelection from './components/AuthSelection';

// Import our interface entry points
import BuyerInterface from './BuyerInterface';
import SellerInterface from './SellerInterface';

// Final App component with clear, explicit routing
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-950 font-sans">
          <Routes>
            {/* Landing & Selection */}
            <Route path="/" element={<AuthSelection />} />
            <Route path="/selection" element={<AuthSelection />} />

            {/* Seller Experience - Grouped under /seller */}
            <Route path="/seller/*" element={<SellerInterface />} />
            
            {/* Direct Add Property - Let the component handle its own auth/redirect logic internally as it did before */}
            <Route path="/add-property/*" element={<SellerInterface />} />

            {/* Buyer Experience - Unified under the BuyerInterface file as requested */}
            <Route path="/viewer/*" element={<BuyerInterface />} />
            <Route path="/property/*" element={<BuyerInterface />} />
            
            {/* Redirect legacy or unknown paths to viewer for safety */}
            <Route path="/home" element={<Navigate to="/viewer" replace />} />
            <Route path="*" element={<BuyerInterface />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
