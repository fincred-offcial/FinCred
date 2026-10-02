import React from 'react';
import { LoanApplicationJourney } from '../components/journey/LoanApplicationJourney.js';

export const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 flex items-center justify-center py-6 px-4">
      <LoanApplicationJourney />
    </div>
  );
};
