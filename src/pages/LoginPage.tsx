import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LoanApplicationJourney } from '../components/journey/LoanApplicationJourney.js';

export const LoginPage: React.FC = () => {
  const { isCustomerLoggedIn } = useAuth();

  if (isCustomerLoggedIn) {
    return <Navigate to="/dashboard?tab=home" replace />;
  }

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 flex items-center justify-center py-6 px-4">
      <LoanApplicationJourney />
    </div>
  );
};
