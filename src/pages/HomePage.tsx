import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LoanApplicationJourney } from '../components/journey/LoanApplicationJourney.js';

export const HomePage: React.FC = () => {
  const { isCustomerLoggedIn } = useAuth();

  // If customer is already logged in, do NOT show the mobile number entry screen on refresh/visit.
  // Directly navigate to the customer Home dashboard that shows after sign-up!
  if (isCustomerLoggedIn) {
    return <Navigate to="/dashboard?tab=home" replace />;
  }

  return (
    <main className="w-full">
      <LoanApplicationJourney />
    </main>
  );
};
