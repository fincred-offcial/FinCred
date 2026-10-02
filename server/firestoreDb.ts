import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { serverDb } from './firebase.js';
import { Customer, LoanApplication, Banner, AdminSettings, AdminStats, ApplicationStatus, ActivityLog, LoanOption, PartnerPlatform, PartnerLender, ApplicationDocument, CustomerNotification, CibilOrder, ReferralProfile, AppReward, AppRewardStatus, LoanReferral, Payout, EarnSettings, PayoutAuditLog } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'central_db.json');

function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => (item && typeof item === 'object' && !(item instanceof Date) ? cleanForFirestore(item) : item)) as any;
  }
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result[key] = value
          .filter(item => item !== undefined)
          .map(item => (item && typeof item === 'object' && !(item instanceof Date) ? cleanForFirestore(item) : item));
      } else if (value && typeof value === 'object' && !(value instanceof Date)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

const DEFAULT_SETTINGS: AdminSettings = {
  choiceConnectPersonalLoanUrl: 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
  personalBusinessLoanUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
  instantLoanUrl: 'https://truebalance.onelink.me/bMoN/dlfim5uk',
  allTypeLoanUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
  safeUpiUrl: 'https://r.navi.com/t3HqoB',
  updatedAt: new Date().toISOString()
};

const INITIAL_BANNERS: Banner[] = [
  {
    bannerId: 'banner-01',
    title: 'Personal Loan – Instant Loans for All Your Personal Needs',
    description: 'Quick digital sanction, zero collateral, and customized repayment tenure with top RBI-registered lenders.',
    buttonText: 'Apply Now',
    destinationUrl: 'https://dukaan.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    imageUrl: '/banners/banner-personal-loan.jpg',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-09-14T22:00:00.000Z'
  },
  {
    bannerId: 'banner-02',
    title: 'Navi UPI – Real-Time Payment Security',
    description: 'Ultra-safe UPI payments with Navi Secure 24x7 intelligent fraud defense, zero transaction fee, and instant rewards.',
    buttonText: 'Download Navi App',
    destinationUrl: 'https://r.navi.com/t3HqoB',
    imageUrl: '/banners/banner-navi-upi.jpg',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-09-14T22:00:00.000Z'
  },
  {
    bannerId: 'banner-03',
    title: 'Personal Loan Scams in India – How to Avoid Them',
    description: 'Stay alert against unauthorized loan apps. FinCred never charges upfront processing fees. Verified safety guide.',
    buttonText: 'Read Safety Guide',
    destinationUrl: '/disclaimer',
    imageUrl: '/banners/banner-scam-safety.jpg',
    isActive: true,
    displayOrder: 3,
    createdAt: '2026-09-14T22:00:00.000Z'
  }
];

const INITIAL_LOAN_OPTIONS: LoanOption[] = [
  {
    optionId: 'opt-choice-personal',
    name: 'Choice Connect Personal Loan',
    category: 'Personal Loan',
    partnerName: 'Choice Connect Financial Network',
    applicationUrl: 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
    loanAmountRange: '₹50,000 – ₹10,00,000',
    tenureRange: '12 to 60 Months',
    interestRate: 'From 10.49% p.a.',
    description: 'Instant paperless evaluation for salaried and self-employed professionals across top Indian private banks.',
    eligibilityInfo: [
      'Age: 21 to 58 years',
      'Salaried or Self-Employed with minimum monthly income ₹15,000+',
      'Indian Citizen with active PAN & Aadhaar',
      'Active bank account with net banking / statement'
    ],
    requiredDocuments: [
      'PAN Card',
      'Aadhaar Card',
      'Last 3 Months Bank Statement',
      'Salary Slip / Income Proof / ITR'
    ],
    processingInfo: 'Digital application appraisal with real-time status updates',
    importantTerms: 'Final loan sanction, interest rate, and tenure are strictly determined by lending partner policies. FinCred charges no upfront fee.',
    badge: 'Most Popular',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    optionId: 'opt-werize-pl',
    name: 'WeRize Personal Loan (PL)',
    category: 'Personal Loan',
    partnerName: 'WeRize Financial Partner',
    applicationUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    loanAmountRange: 'Up to ₹15,00,000',
    tenureRange: '12 to 48 Months',
    interestRate: 'From 11.99% p.a.',
    description: 'Fast digital personal loan from RBI-registered NBFC partner WeRize for medical, wedding, education, or travel needs.',
    eligibilityInfo: [
      'Age: 21 years and above',
      'Indian Resident with stable monthly earnings',
      'Valid KYC documents'
    ],
    requiredDocuments: [
      'PAN Card',
      'Aadhaar Card',
      'Recent Bank Statement'
    ],
    processingInfo: 'Direct partner referral and digital onboarding',
    importantTerms: 'Subject to lender verification and credit criteria. Transparent charges with zero hidden penalties.',
    badge: 'Quick Referral',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    optionId: 'opt-werize-business',
    name: 'WeRize Business Loan',
    category: 'Business Loan',
    partnerName: 'WeRize Financial Partner',
    applicationUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    loanAmountRange: '₹1,00,000 – ₹15,00,000',
    tenureRange: '12 to 36 Months',
    interestRate: 'From 13.5% p.a.',
    description: 'Collateral-free working capital and business expansion loan for small enterprises, traders, shopkeepers, and services.',
    eligibilityInfo: [
      'Business operational for 1+ year',
      'Indian Citizen, Age 21 to 65 years',
      'Active commercial or savings banking account'
    ],
    requiredDocuments: [
      'PAN & Aadhaar of Business Owner',
      'Business Registration / Udyam Certificate / GST (if available)',
      'Last 6 Months Bank Statement'
    ],
    processingInfo: 'Streamlined appraisal with minimal documentation',
    importantTerms: 'Collateral-free facility. Final sanction depends on partner credit evaluation and turnover.',
    badge: 'MSME Friendly',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    optionId: 'opt-ruloans-business',
    name: 'RuLoans Business Lending',
    category: 'Business Loan',
    partnerName: 'RuLoans Lending Network',
    applicationUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
    loanAmountRange: '₹2,00,000 – ₹50,00,000',
    tenureRange: '12 to 60 Months',
    interestRate: 'From 12.5% p.a.',
    description: 'Multi-bank comparison network connecting business owners to leading national banks and NBFCs across India.',
    eligibilityInfo: [
      'Registered firm with active turnover',
      'Business vintage 2+ years',
      'Satisfactory credit track record'
    ],
    requiredDocuments: [
      'Business Proof & KYC',
      'ITR of last 2 years with computation',
      'Last 6 Months Bank Statement'
    ],
    processingInfo: 'Multi-lender match based on business profile',
    importantTerms: 'Sanction and terms governed strictly by participating institutions.',
    badge: 'Multi-Bank Access',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    optionId: 'opt-truebalance-instant',
    name: 'TrueBalance Instant Digital Loan',
    category: 'Instant Loan',
    partnerName: 'TrueBalance App Partner',
    applicationUrl: 'https://truebalance.onelink.me/bMoN/dlfim5uk',
    loanAmountRange: '₹5,000 – ₹1,00,000',
    tenureRange: '3 to 12 Months',
    interestRate: 'As low as 2.4% per month',
    description: '100% paperless smartphone app-based credit line for emergency cash and urgent digital financial needs.',
    eligibilityInfo: [
      'Indian Resident, Age 21+',
      'Smartphone with active mobile number linked to Aadhaar',
      'Valid PAN Card'
    ],
    requiredDocuments: [
      'PAN Card Number',
      'Aadhaar (paperless OTP e-KYC)'
    ],
    processingInfo: 'Immediate paperless digital onboarding via mobile app',
    importantTerms: '24x7 digital application. Sanction strictly depends on TrueBalance RBI-registered NBFC partner credit evaluation.',
    badge: 'Instant Paperless',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    optionId: 'opt-ruloans-other',
    name: 'RuLoans Multi-Category Loan Network',
    category: 'Other',
    partnerName: 'RuLoans Lending Network',
    applicationUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
    loanAmountRange: 'Flexible as per product',
    tenureRange: 'Flexible up to 240 Months',
    interestRate: 'Bank-specific competitive rates',
    description: 'Comprehensive financial advisory & referral for Home Loans, Loan Against Property, and Education Loans.',
    eligibilityInfo: [
      'Salaried or Self-Employed Indian Citizen',
      'Property / Asset documents for secured loans',
      'Clean credit and banking history'
    ],
    requiredDocuments: [
      'KYC (PAN & Aadhaar)',
      'Income Proof / ITR',
      'Property Documents (if applicable)'
    ],
    processingInfo: 'Personalized referral & institutional appraisal',
    importantTerms: 'Final rates and sanction decided by participating banking partners.',
    badge: 'All Categories',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  }
];

export const INITIAL_PARTNER_PLATFORMS: PartnerPlatform[] = [
  {
    platformId: 'werize',
    name: 'WeRize',
    logoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=200&q=80',
    description: 'Full-stack financial services platform providing tailored credit solutions in partnership with RBI-registered NBFCs across 1000+ Indian cities.',
    partnerNetworkSummary: 'Partner Banks & NBFCs',
    verifiedPartnerCount: 'RBI-Registered NBFC Partners',
    isCompleteLenderListAvailable: false,
    lenderNetworkDisclaimer: 'Multiple bank and NBFC partners are available through this platform. The specific lender applicable to an application is determined according to the platform\'s eligibility and underwriting process.',
    personalLoanUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    businessLoanUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    supportedCategories: ['Personal Loan', 'Business Loan', 'Personal / Business Loan'],
    loanAmountRange: '₹30,000 – ₹5,00,000',
    tenureRange: '12 to 36 Months',
    interestRate: 'From 1.25% per month',
    badge: 'Quick Digital Approval',
    displayOrder: 1,
    isActive: true,
    sourceReference: 'Official WeRize Regulatory Disclosures & RBI Register',
    lastVerifiedDate: '2026-09-20',
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    lenders: [
      {
        lenderId: 'wrz-l-1',
        partnerPlatformId: 'werize',
        lenderName: 'Worthewealth Technocrafts Private Limited / WeRize',
        lenderType: 'Financial Institution',
        loanCategory: 'Personal / Business Loan',
        productType: 'Personal & MSME Credit',
        isActive: true,
        sourceVerification: 'WeRize Platform Disclosures',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 1
      },
      {
        lenderId: 'wrz-l-2',
        partnerPlatformId: 'werize',
        lenderName: 'Northern Arc Capital Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Personal Credit Facility',
        isActive: true,
        sourceVerification: 'RBI NBFC Registry / Partner Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 2
      },
      {
        lenderId: 'wrz-l-3',
        partnerPlatformId: 'werize',
        lenderName: 'Vivriti Capital Limited',
        lenderType: 'NBFC',
        loanCategory: 'Business Loan',
        productType: 'Enterprise & Term Credit',
        isActive: true,
        sourceVerification: 'RBI NBFC Registry / Partner Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 3
      }
    ]
  },
  {
    platformId: 'ruloans',
    name: 'Ruloans',
    logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=200&q=80',
    description: 'India\'s premier loan distribution network partnering with 275+ leading banks and NBFCs for Personal and Business Loans.',
    partnerNetworkSummary: '275+ Partner Banks & NBFCs*',
    verifiedPartnerCount: '275+ Banks & NBFCs*',
    isCompleteLenderListAvailable: false,
    lenderNetworkDisclaimer: 'Ruloans provides access to a large network of banks and NBFCs. The specific lender offered to an applicant depends on eligibility and the platform\'s internal matching/underwriting process.',
    personalLoanUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
    businessLoanUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=business_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
    supportedCategories: ['Personal Loan', 'Business Loan', 'All Type Loan'],
    loanAmountRange: '₹50,000 – ₹50,00,000',
    tenureRange: '12 to 84 Months',
    interestRate: 'Competitive Rates from 10.49% p.a.',
    badge: '275+ Banks & NBFCs*',
    displayOrder: 2,
    isActive: true,
    sourceReference: 'Ruloans Official Partner Network & Published Institutional Alliances',
    lastVerifiedDate: '2026-09-20',
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    lenders: [
      {
        lenderId: 'rul-l-1',
        partnerPlatformId: 'ruloans',
        lenderName: 'HDFC Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Express Loan & Overdraft',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 1
      },
      {
        lenderId: 'rul-l-2',
        partnerPlatformId: 'ruloans',
        lenderName: 'ICICI Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Digital Instant Sanction',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 2
      },
      {
        lenderId: 'rul-l-3',
        partnerPlatformId: 'ruloans',
        lenderName: 'Axis Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Retail & Commercial Credit',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 3
      },
      {
        lenderId: 'rul-l-4',
        partnerPlatformId: 'ruloans',
        lenderName: 'Kotak Mahindra Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Retail & SME Loans',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 4
      },
      {
        lenderId: 'rul-l-5',
        partnerPlatformId: 'ruloans',
        lenderName: 'Bajaj Finance Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal & Business Loan',
        productType: 'Flexi Loan & Term Credit',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 5
      },
      {
        lenderId: 'rul-l-6',
        partnerPlatformId: 'ruloans',
        lenderName: 'Tata Capital Financial Services Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal & Business Loan',
        productType: 'Unsecured Business & PL',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 6
      },
      {
        lenderId: 'rul-l-7',
        partnerPlatformId: 'ruloans',
        lenderName: 'Aditya Birla Finance Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal & Business Loan',
        productType: 'Business Growth Credit',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 7
      },
      {
        lenderId: 'rul-l-8',
        partnerPlatformId: 'ruloans',
        lenderName: 'Poonawalla Fincorp Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal & Business Loan',
        productType: 'Instant Business Loan',
        isActive: true,
        sourceVerification: 'Ruloans Institutional Tie-ups',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 8
      }
    ]
  },
  {
    platformId: 'choice_connect',
    name: 'Choice Connect',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
    description: 'Tech-driven financial distribution ecosystem connecting customers to leading commercial banks and NBFCs for instant loan evaluations.',
    partnerNetworkSummary: 'Partner Banks & NBFCs',
    verifiedPartnerCount: 'Partner Banks & NBFCs',
    isCompleteLenderListAvailable: false,
    lenderNetworkDisclaimer: 'Multiple bank and NBFC partners are available through this platform. The specific lender applicable to an application is determined according to the platform\'s eligibility and underwriting process.',
    personalLoanUrl: 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
    businessLoanUrl: 'https://choiceconnect.in/referral/loan/business-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
    supportedCategories: ['Personal Loan', 'Business Loan'],
    loanAmountRange: '₹50,000 – ₹25,00,000',
    tenureRange: '12 to 48 Months',
    interestRate: 'Attractive Partner Pricing',
    badge: 'Fast Paperless Verification',
    displayOrder: 3,
    isActive: true,
    sourceReference: 'Choice International Limited Public Financial Network Data',
    lastVerifiedDate: '2026-09-20',
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    lenders: [
      {
        lenderId: 'cc-l-1',
        partnerPlatformId: 'choice_connect',
        lenderName: 'HDFC Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Paperless Digital Loan',
        isActive: true,
        sourceVerification: 'Choice Connect Partner Portal',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 1
      },
      {
        lenderId: 'cc-l-2',
        partnerPlatformId: 'choice_connect',
        lenderName: 'ICICI Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Digital Instant PL',
        isActive: true,
        sourceVerification: 'Choice Connect Partner Portal',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 2
      },
      {
        lenderId: 'cc-l-3',
        partnerPlatformId: 'choice_connect',
        lenderName: 'Federal Bank Limited',
        lenderType: 'Bank',
        loanCategory: 'Personal & Business Loan',
        productType: 'Digital Express Loan',
        isActive: true,
        sourceVerification: 'Choice Connect Partner Portal',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 3
      },
      {
        lenderId: 'cc-l-4',
        partnerPlatformId: 'choice_connect',
        lenderName: 'Bajaj Finance Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal & Business Loan',
        productType: 'Personal & Business Line',
        isActive: true,
        sourceVerification: 'Choice Connect Partner Portal',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 4
      },
      {
        lenderId: 'cc-l-5',
        partnerPlatformId: 'choice_connect',
        lenderName: 'InCred Financial Services Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Personal Loan',
        isActive: true,
        sourceVerification: 'Choice Connect Partner Portal',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 5
      },
      {
        lenderId: 'cc-l-6',
        partnerPlatformId: 'choice_connect',
        lenderName: 'Tata Capital Financial Services',
        lenderType: 'NBFC',
        loanCategory: 'Personal & Business Loan',
        productType: 'Working Capital & PL',
        isActive: true,
        sourceVerification: 'Choice Connect Partner Portal',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 6
      }
    ]
  },
  {
    platformId: 'true_balance',
    name: 'True Balance',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80',
    description: '100% digital app-based credit platform offering urgent personal loans and credit lines powered by RBI-registered NBFC partners.',
    partnerNetworkSummary: 'RBI-Registered NBFC Partners',
    verifiedPartnerCount: '6 Verified NBFC Partners',
    isCompleteLenderListAvailable: true,
    lenderNetworkDisclaimer: 'True Balance partners with RBI-registered NBFCs to facilitate credit to eligible customers. Final terms, interest rate, and limits depend on partner underwriting.',
    personalLoanUrl: 'https://truebalance.onelink.me/bMoN/dlfim5uk',
    businessLoanUrl: '',
    supportedCategories: ['Personal Loan', 'Instant Loan'],
    loanAmountRange: '₹5,000 – ₹1,25,000',
    tenureRange: '3 to 12 Months',
    interestRate: 'Low Monthly APR & Flexible Repayment',
    badge: '100% Paperless App',
    displayOrder: 4,
    isActive: true,
    sourceReference: 'True Balance (Balancehero India) Official RBI Lending Partners Disclosure',
    lastVerifiedDate: '2026-09-20',
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    lenders: [
      {
        lenderId: 'tb-l-1',
        partnerPlatformId: 'true_balance',
        lenderName: 'True Credits Private Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Instant Cash Loan / Credit Line',
        isActive: true,
        sourceVerification: 'RBI NBFC Registration / Official Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 1
      },
      {
        lenderId: 'tb-l-2',
        partnerPlatformId: 'true_balance',
        lenderName: 'Grow Money Capital Private Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Digital Personal Loan',
        isActive: true,
        sourceVerification: 'RBI NBFC Registration / Official Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 2
      },
      {
        lenderId: 'tb-l-3',
        partnerPlatformId: 'true_balance',
        lenderName: 'InCred Financial Services Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Personal Term Loan',
        isActive: true,
        sourceVerification: 'RBI NBFC Registration / Official Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 3
      },
      {
        lenderId: 'tb-l-4',
        partnerPlatformId: 'true_balance',
        lenderName: 'Vivriti Capital Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Credit Facility',
        isActive: true,
        sourceVerification: 'RBI NBFC Registration / Official Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 4
      },
      {
        lenderId: 'tb-l-5',
        partnerPlatformId: 'true_balance',
        lenderName: 'Northern ARC Capital Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Digital Credit Line',
        isActive: true,
        sourceVerification: 'RBI NBFC Registration / Official Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 5
      },
      {
        lenderId: 'tb-l-6',
        partnerPlatformId: 'true_balance',
        lenderName: 'OXYZO Financial Services Limited',
        lenderType: 'NBFC',
        loanCategory: 'Personal Loan',
        productType: 'Digital Credit Line',
        isActive: true,
        sourceVerification: 'RBI NBFC Registration / Official Disclosure',
        lastVerifiedDate: '2026-09-20',
        displayOrder: 6
      }
    ]
  }
];

class FirestoreCentralDatabase {
  // In-memory OTP storage with automatic expiry
  private otps: Record<string, { otp: string; expiresAt: number; attempts: number }> = {};
  private migrationCompleted = false;

  constructor() {
    this.migrateInitialDataToFirestore().catch(err => {
      console.error('Initial migration to Firestore encountered error:', err);
    });
  }

  /**
   * Safe migration: copies existing data from central_db.json or defaults into Firestore
   * without overwriting any records that already exist in Firestore.
   */
  async migrateInitialDataToFirestore(): Promise<void> {
    if (this.migrationCompleted) return;

    try {
      console.log('Initiating safe data migration to Firestore single source of truth...');

      // 1. Settings
      const settingsRef = doc(serverDb, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        let initialSettings = DEFAULT_SETTINGS;
        if (fs.existsSync(DB_FILE)) {
          try {
            const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
            if (raw.settings) initialSettings = { ...DEFAULT_SETTINGS, ...raw.settings };
          } catch {}
        }
        await setDoc(settingsRef, initialSettings);
        console.log('Migrated default settings to Firestore.');
      }

      // 2. Banners
      const bannersCol = collection(serverDb, 'banners');
      const bannersSnap = await getDocs(bannersCol);
      if (bannersSnap.empty) {
        let sourceBanners = INITIAL_BANNERS;
        if (fs.existsSync(DB_FILE)) {
          try {
            const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
            if (Array.isArray(raw.banners) && raw.banners.length > 0) sourceBanners = raw.banners;
          } catch {}
        }
        for (const b of sourceBanners) {
          await setDoc(doc(serverDb, 'banners', b.bannerId), b);
        }
        console.log(`Migrated ${sourceBanners.length} banners to Firestore.`);
      }

      // 3. Customers
      if (fs.existsSync(DB_FILE)) {
        try {
          const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
          if (Array.isArray(raw.customers)) {
            for (const c of raw.customers) {
              const custRef = doc(serverDb, 'customers', c.customerId);
              const custSnap = await getDoc(custRef);
              if (!custSnap.exists()) {
                await setDoc(custRef, c);
                console.log(`Migrated customer ${c.fullName} (${c.customerId}) to Firestore.`);
              }
            }
          }
          if (Array.isArray(raw.applications)) {
            for (const a of raw.applications) {
              const appRef = doc(serverDb, 'applications', a.applicationId);
              const appSnap = await getDoc(appRef);
              if (!appSnap.exists()) {
                await setDoc(appRef, a);
                console.log(`Migrated application ${a.applicationId} to Firestore.`);
              }
            }
          }
        } catch (fileErr) {
          console.error('Error reading central_db.json during migration:', fileErr);
        }
      }

      // 4. Partner Platforms
      const partnersCol = collection(serverDb, 'partner_platforms');
      const partnersSnap = await getDocs(partnersCol);
      if (partnersSnap.empty) {
        for (const p of INITIAL_PARTNER_PLATFORMS) {
          await setDoc(doc(serverDb, 'partner_platforms', p.platformId), cleanForFirestore(p));
        }
        console.log(`Migrated ${INITIAL_PARTNER_PLATFORMS.length} verified partner platforms to Firestore.`);
      }

      this.migrationCompleted = true;
      console.log('Safe migration to Firestore completed successfully.');
    } catch (err) {
      console.error('Firestore migration error:', err);
    }
  }

  // ==========================================
  // OTP METHODS
  // ==========================================
  setOtp(mobile: string, otp: string, durationMs = 5 * 60 * 1000) {
    this.otps[mobile] = {
      otp,
      expiresAt: Date.now() + durationMs,
      attempts: 0
    };
  }

  verifyOtp(mobile: string, userOtp: string): boolean {
    const record = this.otps[mobile];
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      delete this.otps[mobile];
      return false;
    }
    record.attempts += 1;
    if (record.attempts > 5) {
      delete this.otps[mobile];
      return false;
    }
    if (record.otp === userOtp.trim()) {
      delete this.otps[mobile];
      return true;
    }
    return false;
  }

  // ==========================================
  // CUSTOMER OPERATIONS (FIRESTORE)
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    try {
      const customersCol = collection(serverDb, 'customers');
      const snap = await getDocs(customersCol);
      const list: Customer[] = [];
      const mobileSet = new Set<string>();

      snap.forEach(d => {
        const data = d.data() as Customer;
        const custId = data.customerId || d.id;
        list.push({ ...data, customerId: custId });
        if (data.mobileNumber) mobileSet.add(data.mobileNumber.trim());
      });

      // Ensure all historical and new applicants from applications are present in Customers collection too
      const apps = await this.getApplications();
      for (const app of apps) {
        const cleanMobile = app.mobileNumber ? app.mobileNumber.trim() : '';
        if (cleanMobile && !mobileSet.has(cleanMobile)) {
          const autoCust: Customer = {
            customerId: app.customerId || `cust-${cleanMobile}`,
            fullName: app.fullName || 'Valued Customer',
            mobileNumber: cleanMobile,
            email: app.email,
            loanCategory: app.loanCategory,
            amountRequested: app.amountRequested,
            mobileVerified: true,
            status: 'Verified',
            source: (app.source === 'mobile_app' ? 'mobile_app' : 'web') as 'web' | 'mobile_app',
            createdAt: app.submittedAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString()
          };
          try {
            await setDoc(doc(serverDb, 'customers', autoCust.customerId), cleanForFirestore(autoCust), { merge: true });
            list.push(autoCust);
            mobileSet.add(cleanMobile);
          } catch (e) {
            console.warn('Auto-sync customer write notice:', e);
          }
        }
      }

      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return list;
    } catch (e) {
      console.error('Error in getCustomers from Firestore:', e);
      return [];
    }
  }

  async getCustomerByMobile(mobile: string): Promise<Customer | undefined> {
    try {
      const clean = String(mobile).trim();
      const customersCol = collection(serverDb, 'customers');
      const q = query(customersCol, where('mobileNumber', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { ...docSnap.data(), customerId: docSnap.data().customerId || docSnap.id } as Customer;
      }
      return undefined;
    } catch (e) {
      console.error('Error in getCustomerByMobile:', e);
      return undefined;
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    try {
      if (!email) return undefined;
      const lower = email.trim().toLowerCase();
      const customersCol = collection(serverDb, 'customers');
      const q = query(customersCol, where('email', '==', lower));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { ...docSnap.data(), customerId: docSnap.data().customerId || docSnap.id } as Customer;
      }
      return undefined;
    } catch (e) {
      console.error('Error in getCustomerByEmail:', e);
      return undefined;
    }
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const custRef = doc(serverDb, 'customers', id);
      const snap = await getDoc(custRef);
      if (snap.exists()) {
        return { ...snap.data(), customerId: snap.data().customerId || snap.id } as Customer;
      }
      const col = collection(serverDb, 'customers');
      const q = query(col, where('customerId', '==', id));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const docSnap = qSnap.docs[0];
        return { ...docSnap.data(), customerId: docSnap.data().customerId || docSnap.id } as Customer;
      }
      return undefined;
    } catch (e) {
      console.error('Error in getCustomerById:', e);
      return undefined;
    }
  }

  async registerAppCustomer(params: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<Customer> {
    const cleanMobile = params.mobileNumber.trim();
    const cleanEmail = params.email ? params.email.trim().toLowerCase() : undefined;
    const now = new Date().toISOString();

    const existing = await this.getCustomerByMobile(cleanMobile);
    if (existing) {
      const updated: Customer = {
        ...existing,
        fullName: params.fullName.trim(),
        email: cleanEmail || existing.email,
        passwordHash: params.passwordHash,
        passwordSalt: params.passwordSalt,
        mobileVerified: true,
        source: 'mobile_app',
        updatedAt: now
      };
      await setDoc(doc(serverDb, 'customers', existing.customerId), cleanForFirestore(updated), { merge: true });
      return updated;
    }

    const customerId = `cust-${crypto.randomBytes(4).toString('hex')}`;
    const newCustomer: Customer = {
      customerId,
      fullName: params.fullName.trim(),
      mobileNumber: cleanMobile,
      email: cleanEmail,
      passwordHash: params.passwordHash,
      passwordSalt: params.passwordSalt,
      source: 'mobile_app',
      mobileVerified: true,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'customers', customerId), cleanForFirestore(newCustomer));
    return newCustomer;
  }

  async upsertCustomer(mobile: string, fullName: string, email?: string): Promise<Customer> {
    const cleanMobile = String(mobile).trim();
    const now = new Date().toISOString();
    const existing = await this.getCustomerByMobile(cleanMobile);

    if (existing) {
      const updated: Customer = {
        ...existing,
        fullName: fullName && fullName.trim() ? fullName.trim() : existing.fullName,
        email: email ? email.trim().toLowerCase() : existing.email,
        mobileVerified: true,
        updatedAt: now
      };
      await setDoc(doc(serverDb, 'customers', existing.customerId), cleanForFirestore(updated), { merge: true });
      return updated;
    }

    const customerId = `cust-${crypto.randomBytes(4).toString('hex')}`;
    const newCustomer: Customer = {
      customerId,
      fullName: fullName && fullName.trim() ? fullName.trim() : 'Valued Customer',
      mobileNumber: cleanMobile,
      email: email ? email.trim().toLowerCase() : undefined,
      mobileVerified: true,
      source: 'web',
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'customers', customerId), cleanForFirestore(newCustomer));
    return newCustomer;
  }

  async updateCustomerProfile(customerId: string, fullName: string, email?: string): Promise<Customer | null> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return null;

    const now = new Date().toISOString();
    const updated: Customer = {
      ...customer,
      fullName: fullName.trim(),
      email: email ? email.trim().toLowerCase() : customer.email,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'customers', customer.customerId), cleanForFirestore(updated), { merge: true });
    return updated;
  }

  async saveCustomerRecord(customer: Partial<Customer>): Promise<Customer> {
    const customerId = customer.customerId || `cust-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const cleanMobile = customer.mobileNumber ? String(customer.mobileNumber).trim() : '';

    const devicesUsed = Array.isArray(customer.devicesUsed) ? [...customer.devicesUsed] : [];
    if (customer.deviceSummary && !devicesUsed.includes(customer.deviceSummary)) {
      devicesUsed.push(customer.deviceSummary);
    }

    const locationsUsed = Array.isArray(customer.locationsUsed) ? [...customer.locationsUsed] : [];
    if (customer.location && !locationsUsed.includes(customer.location)) {
      locationsUsed.push(customer.location);
    } else if (customer.city && !locationsUsed.includes(customer.city)) {
      locationsUsed.push(customer.city);
    }
    
    const record: Customer = {
      customerId,
      fullName: String(customer.fullName || 'Valued Customer').trim(),
      mobileNumber: cleanMobile,
      email: customer.email ? String(customer.email).trim().toLowerCase() : undefined,
      dob: customer.dob || customer.dateOfBirth,
      dateOfBirth: customer.dateOfBirth || customer.dob,
      panNumber: customer.panNumber,
      panMasked: customer.panMasked || (customer.panNumber ? `${customer.panNumber.slice(0, 5)}****${customer.panNumber.slice(-1)}` : undefined),
      pincode: customer.pincode,
      mobileVerified: customer.mobileVerified !== false,
      source: customer.source || 'web',
      loanCategory: customer.loanCategory,
      amountRequested: customer.amountRequested || customer.requiredLoanAmount,
      requiredLoanAmount: customer.requiredLoanAmount || customer.amountRequested,
      employmentType: customer.employmentType,
      monthlyIncome: customer.monthlyIncome,
      city: customer.city,
      status: customer.status || 'Verified',
      // Device & Location tracking
      deviceSummary: customer.deviceSummary,
      deviceType: customer.deviceType,
      os: customer.os,
      browser: customer.browser,
      ipAddress: customer.ipAddress,
      location: customer.location || customer.city,
      timezone: customer.timezone,
      lastActiveAt: customer.lastActiveAt || now,
      lastAction: customer.lastAction,
      devicesUsed,
      locationsUsed,
      createdAt: customer.createdAt || now,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'customers', customerId), cleanForFirestore(record), { merge: true });
    return record;
  }

  async updateCustomerRecord(customerId: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return null;

    const now = new Date().toISOString();
    const devicesUsed = Array.isArray(customer.devicesUsed) ? [...customer.devicesUsed] : [];
    if (updates.deviceSummary && !devicesUsed.includes(updates.deviceSummary)) {
      devicesUsed.push(updates.deviceSummary);
    }

    const locationsUsed = Array.isArray(customer.locationsUsed) ? [...customer.locationsUsed] : [];
    if (updates.location && !locationsUsed.includes(updates.location)) {
      locationsUsed.push(updates.location);
    } else if (updates.city && !locationsUsed.includes(updates.city)) {
      locationsUsed.push(updates.city);
    }

    const merged: Customer = {
      ...customer,
      ...updates,
      customerId: customer.customerId,
      devicesUsed,
      locationsUsed,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'customers', customer.customerId), cleanForFirestore(merged), { merge: true });
    return merged;
  }

  async updateCustomerPassword(customerId: string, passwordHash: string, passwordSalt: string): Promise<boolean> {
    try {
      const custRef = doc(serverDb, 'customers', customerId);
      const snap = await getDoc(custRef);
      if (!snap.exists()) return false;

      await updateDoc(custRef, cleanForFirestore({
        passwordHash,
        passwordSalt,
        updatedAt: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('Error updating customer password in Firestore:', e);
      return false;
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      let targetDocId = customerId;
      let mobile = '';

      const custRef = doc(serverDb, 'customers', customerId);
      const snap = await getDoc(custRef);
      if (snap.exists()) {
        targetDocId = snap.id;
        mobile = snap.data().mobileNumber || '';
      } else {
        const col = collection(serverDb, 'customers');
        const q = query(col, where('customerId', '==', customerId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          targetDocId = qSnap.docs[0].id;
          mobile = qSnap.docs[0].data().mobileNumber || '';
        } else {
          return false;
        }
      }

      // 1. Delete customer document permanently from Firestore
      await deleteDoc(doc(serverDb, 'customers', targetDocId));

      // 2. Cascade delete all linked applications permanently from Firestore
      const appsCol = collection(serverDb, 'applications');
      const appsSnap = await getDocs(appsCol);
      for (const d of appsSnap.docs) {
        const appData = d.data() as LoanApplication;
        if (appData.customerId === customerId || (mobile && appData.mobileNumber === mobile)) {
          await deleteDoc(doc(serverDb, 'applications', d.id));
        }
      }

      return true;
    } catch (e) {
      console.error('Error deleting customer from Firestore:', e);
      return false;
    }
  }

  // ==========================================
  // APPLICATION OPERATIONS (FIRESTORE)
  // ==========================================
  async getApplications(): Promise<LoanApplication[]> {
    try {
      const appsCol = collection(serverDb, 'applications');
      const snap = await getDocs(appsCol);
      const list: LoanApplication[] = [];
      snap.forEach(d => {
        const data = d.data() as LoanApplication;
        list.push({ ...data, applicationId: data.applicationId || d.id });
      });
      list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
      return list;
    } catch (e) {
      console.error('Error in getApplications from Firestore:', e);
      return [];
    }
  }

  async getApplicationsByCustomer(customerId?: string, mobile?: string): Promise<LoanApplication[]> {
    const all = await this.getApplications();
    return all.filter(a => {
      if (customerId && a.customerId === customerId) return true;
      if (mobile && a.mobileNumber === mobile.trim()) return true;
      return false;
    });
  }

  async getApplicationById(applicationId: string): Promise<LoanApplication | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'applications', applicationId));
      if (snap.exists()) {
        const data = snap.data() as LoanApplication;
        return { ...data, applicationId: data.applicationId || snap.id };
      }
      const col = collection(serverDb, 'applications');
      const q = query(col, where('applicationId', '==', applicationId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const data = qSnap.docs[0].data() as LoanApplication;
        return { ...data, applicationId: data.applicationId || qSnap.docs[0].id };
      }
      return null;
    } catch (e) {
      console.error('Error fetching application by ID:', e);
      return null;
    }
  }

  async createApplication(params: Omit<LoanApplication, 'applicationId' | 'submittedAt' | 'updatedAt' | 'status'> & { status?: ApplicationStatus }): Promise<{ application: LoanApplication; isDuplicate: boolean }> {
    const now = new Date();
    const nowIso = now.toISOString();

    // Unique Lead ID in format FC-YYYYMMDD-XXXXX (e.g. FC-20260924-00001)
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `FC-${yyyy}${mm}${dd}-${randomSuffix}`;

    // Duplicate detection: check if same mobile number already submitted for this loan category/option
    const allApps = await this.getApplications();
    const cleanMobile = params.mobileNumber ? String(params.mobileNumber).trim() : '';
    const existingDuplicates = allApps.filter(a => 
      a.mobileNumber === cleanMobile && 
      (a.loanCategory === params.loanCategory || (params.selectedOptionId && a.selectedOptionId === params.selectedOptionId))
    );

    const isDuplicate = existingDuplicates.length > 0;
    const duplicateCount = isDuplicate ? existingDuplicates.length + 1 : 0;

    const application: LoanApplication = {
      ...params,
      applicationId,
      leadId: applicationId,
      status: params.status || 'FORM SUBMITTED',
      isDuplicate,
      duplicateCount,
      externalApplicationStatus: params.externalApplicationStatus || 'Pending Partner Selection',
      applyNowClicked: params.applyNowClicked ?? false,
      lastActivityAt: nowIso,
      submittedAt: nowIso,
      updatedAt: nowIso
    };

    await setDoc(doc(serverDb, 'applications', applicationId), cleanForFirestore(application));
    return { application, isDuplicate };
  }

  async trackApplication(applicationId: string, mobileNumber: string): Promise<any | null> {
    try {
      const cleanAppId = (applicationId || '').trim().toUpperCase();
      const cleanMobile = (mobileNumber || '').replace(/\D/g, '').slice(-10);

      if (!cleanAppId || !cleanMobile) return null;

      const allApps = await this.getApplications();
      const matched = allApps.find(a => {
        const aId = (a.applicationId || a.leadId || '').trim().toUpperCase();
        const aMob = (a.mobileNumber || '').replace(/\D/g, '').slice(-10);
        return aId === cleanAppId && aMob === cleanMobile;
      });

      if (!matched) return null;

      // Mask customer name safely for public tracking (e.g. "R**** V****")
      const nameParts = (matched.fullName || matched.applicantName || '').split(' ');
      const maskedName = nameParts.map(p => p ? `${p[0]}${'*'.repeat(Math.max(2, p.length - 1))}` : '').join(' ');

      // Build truthful progression timeline as required in Section 15:
      // 1. Application Submitted
      // 2. Options Available
      // 3. Partner Selected
      // 4. Application Started
      // 5. Partner Processing
      // 6. Final Lender Decision
      const status = (matched.status || 'FORM SUBMITTED').toUpperCase();
      const isPartnerChosen = Boolean(matched.partnerName || matched.partnerPlatformId || ['PARTNER SELECTED', 'APPLICATION STARTED', 'REDIRECTED', 'IN PROGRESS', 'UNDER REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CLOSED'].includes(status));
      const isAppStarted = Boolean(matched.applyNowClicked || ['APPLICATION STARTED', 'REDIRECTED', 'IN PROGRESS', 'UNDER REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CLOSED'].includes(status));
      const isProcessing = ['IN PROGRESS', 'UNDER REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CLOSED', 'Under External Review'].includes(matched.status as any);
      const isFinalDecision = ['APPROVED', 'REJECTED', 'COMPLETED', 'CLOSED'].includes(status);

      const timeline = [
        { title: 'Application Submitted', date: matched.submittedAt, completed: true },
        { title: 'Options Available', date: matched.submittedAt, completed: true },
        { 
          title: 'Partner Selected', 
          date: matched.submittedAt, 
          completed: isPartnerChosen 
        },
        { 
          title: 'Application Started', 
          date: matched.lastActivityAt || matched.submittedAt, 
          completed: isAppStarted 
        },
        { 
          title: 'Partner Processing', 
          date: matched.updatedAt, 
          completed: isProcessing 
        },
        { 
          title: status === 'APPROVED' ? 'Approved (Admin Verified)' : (status === 'REJECTED' ? 'Lender Review Completed' : 'Final Lender Decision'), 
          date: matched.updatedAt, 
          completed: isFinalDecision 
        }
      ];

      return {
        applicationId: matched.applicationId,
        customerName: maskedName,
        loanCategory: matched.loanCategory,
        selectedOptionName: matched.selectedOptionName || matched.partnerName,
        partnerName: matched.partnerName,
        submittedAt: matched.submittedAt,
        updatedAt: matched.updatedAt,
        status: matched.status,
        amountRequested: matched.amountRequested,
        externalApplicationStatus: matched.externalApplicationStatus,
        adminUpdated: matched.adminUpdated,
        timeline
      };
    } catch (e) {
      console.error('Error tracking application in Firestore:', e);
      return null;
    }
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, adminNotes?: string): Promise<LoanApplication | null> {
    try {
      const appRef = doc(serverDb, 'applications', applicationId);
      const snap = await getDoc(appRef);
      let targetDocId = applicationId;
      let existingData: any = {};

      if (snap.exists()) {
        existingData = snap.data();
      } else {
        const col = collection(serverDb, 'applications');
        const q = query(col, where('applicationId', '==', applicationId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          targetDocId = qSnap.docs[0].id;
          existingData = qSnap.docs[0].data();
        } else {
          return null;
        }
      }

      const now = new Date().toISOString();
      const updatePayload: any = {
        status,
        adminUpdated: true,
        updatedAt: now
      };
      if (adminNotes !== undefined) {
        updatePayload.adminNotes = adminNotes;
      }

      await updateDoc(doc(serverDb, 'applications', targetDocId), cleanForFirestore(updatePayload));

      return {
        ...existingData,
        ...updatePayload
      } as LoanApplication;
    } catch (e) {
      console.error('Error updating application status in Firestore:', e);
      return null;
    }
  }

  async deleteApplication(applicationId: string): Promise<boolean> {
    try {
      const appRef = doc(serverDb, 'applications', applicationId);
      const snap = await getDoc(appRef);
      if (snap.exists()) {
        await deleteDoc(appRef);
        return true;
      }
      const col = collection(serverDb, 'applications');
      const q = query(col, where('applicationId', '==', applicationId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        for (const d of qSnap.docs) {
          await deleteDoc(doc(serverDb, 'applications', d.id));
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error deleting application from Firestore:', e);
      return false;
    }
  }

  // ==========================================
  // CUSTOMER REGISTRATION & DOCUMENT MANAGEMENT
  // ==========================================
  async registerNewCustomer(params: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    dob?: string;
    panNumber?: string;
    pincode?: string;
    employmentType?: string;
    monthlyIncome?: number;
    requiredLoanAmount?: number;
    loanCategory?: string;
    source?: string;
    deviceMeta?: any;
  }): Promise<{ customer: Customer; application: LoanApplication }> {
    const cleanMobile = params.mobileNumber.trim();
    const cleanPan = params.panNumber ? params.panNumber.trim().toUpperCase() : undefined;
    const cleanEmail = params.email ? params.email.trim().toLowerCase() : undefined;
    const amount = Number(params.requiredLoanAmount) || 200000;
    const category = params.loanCategory || 'Personal Loan';
    const now = new Date().toISOString();

    // 1. Create or update customer
    let existing = await this.getCustomerByMobile(cleanMobile);
    const customerId = existing?.customerId || `cust-${crypto.randomBytes(4).toString('hex')}`;

    const customerRecord: Customer = {
      customerId,
      fullName: params.fullName.trim(),
      mobileNumber: cleanMobile,
      email: cleanEmail || existing?.email,
      dob: params.dob || existing?.dob,
      dateOfBirth: params.dob || existing?.dateOfBirth,
      panNumber: cleanPan || existing?.panNumber,
      panMasked: cleanPan ? `${cleanPan.slice(0, 5)}****${cleanPan.slice(-1)}` : existing?.panMasked,
      pincode: params.pincode || existing?.pincode,
      employmentType: params.employmentType || existing?.employmentType || 'Salaried',
      monthlyIncome: params.monthlyIncome ? Number(params.monthlyIncome) : (existing?.monthlyIncome || 35000),
      requiredLoanAmount: amount,
      amountRequested: amount,
      loanCategory: category,
      source: (params.source as any) || existing?.source || 'web',
      mobileVerified: true,
      status: 'Verified',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      ...(params.deviceMeta || {})
    };

    await setDoc(doc(serverDb, 'customers', customerId), cleanForFirestore(customerRecord), { merge: true });

    // 2. Prepare default documents checklist for this customer application
    const defaultDocuments: ApplicationDocument[] = [
      {
        id: `doc-pan-${Date.now()}`,
        name: 'PAN Card',
        docType: 'PAN',
        fileName: '',
        fileUrl: '',
        status: 'PENDING'
      },
      {
        id: `doc-aadhaar-${Date.now()}`,
        name: 'Aadhaar Card (Front & Back)',
        docType: 'AADHAAR',
        fileName: '',
        fileUrl: '',
        status: 'PENDING'
      },
      {
        id: `doc-statement-${Date.now()}`,
        name: 'Bank Statement (Last 3 Months)',
        docType: 'BANK_STATEMENT',
        fileName: '',
        fileUrl: '',
        status: 'PENDING'
      }
    ];

    // Check if customer already has an active application
    const existingApps = await this.getApplicationsByCustomer(customerId, cleanMobile);
    let application: LoanApplication;

    if (existingApps.length > 0) {
      // Update the latest application
      const latest = existingApps[0];
      const updatedApp: LoanApplication = {
        ...latest,
        fullName: params.fullName.trim(),
        email: cleanEmail || latest.email,
        dob: params.dob || latest.dob,
        panNumber: cleanPan || latest.panNumber,
        panMasked: cleanPan ? `${cleanPan.slice(0, 5)}****${cleanPan.slice(-1)}` : latest.panMasked,
        pincode: params.pincode || latest.pincode,
        employmentType: params.employmentType || latest.employmentType,
        monthlyIncome: params.monthlyIncome ? Number(params.monthlyIncome) : latest.monthlyIncome,
        amountRequested: amount,
        loanCategory: category,
        documents: latest.documents && latest.documents.length > 0 ? latest.documents : defaultDocuments,
        updatedAt: now,
        lastActivityAt: now
      };
      await setDoc(doc(serverDb, 'applications', latest.applicationId), cleanForFirestore(updatedApp), { merge: true });
      application = updatedApp;
    } else {
      // Create new application in DETAILS SUBMITTED state
      const created = await this.createApplication({
        fullName: params.fullName.trim(),
        mobileNumber: cleanMobile,
        email: cleanEmail,
        dob: params.dob,
        panNumber: cleanPan,
        panMasked: cleanPan ? `${cleanPan.slice(0, 5)}****${cleanPan.slice(-1)}` : undefined,
        pincode: params.pincode,
        customerId,
        loanCategory: category,
        amountRequested: amount,
        employmentType: params.employmentType || 'Salaried',
        monthlyIncome: params.monthlyIncome ? Number(params.monthlyIncome) : 35000,
        destinationUrl: 'https://fincred.ai.studio',
        partnerName: 'FinCred Central Partner Network',
        status: 'DETAILS SUBMITTED',
        externalApplicationStatus: 'Profile Completed - Details Submitted',
        documents: defaultDocuments
      });
      application = created.application;
    }

    return { customer: customerRecord, application };
  }

  async uploadApplicationDocument(params: {
    applicationId: string;
    docType: string;
    name: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
  }): Promise<{ application: LoanApplication; document: ApplicationDocument } | null> {
    const appRef = doc(serverDb, 'applications', params.applicationId);
    const snap = await getDoc(appRef);
    let targetDocId = params.applicationId;
    let app: any = {};

    if (snap.exists()) {
      app = snap.data();
    } else {
      const col = collection(serverDb, 'applications');
      const q = query(col, where('applicationId', '==', params.applicationId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetDocId = qSnap.docs[0].id;
        app = qSnap.docs[0].data();
      } else {
        return null;
      }
    }

    const now = new Date().toISOString();
    let currentDocs: ApplicationDocument[] = Array.isArray(app.documents) ? [...app.documents] : [];

    const existingIndex = currentDocs.findIndex(d => d.docType === params.docType || d.name?.toLowerCase() === params.name?.toLowerCase());
    let docRecord: ApplicationDocument;

    if (existingIndex >= 0) {
      docRecord = {
        ...currentDocs[existingIndex],
        name: params.name || currentDocs[existingIndex].name,
        docType: params.docType || currentDocs[existingIndex].docType,
        fileName: params.fileName,
        fileUrl: params.fileUrl,
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        status: 'UPLOADED',
        uploadedAt: now
      };
      delete (docRecord as any).adminRemark;
      currentDocs[existingIndex] = docRecord;
    } else {
      docRecord = {
        id: `doc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        name: params.name,
        docType: params.docType as any,
        fileName: params.fileName,
        fileUrl: params.fileUrl,
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        status: 'UPLOADED',
        uploadedAt: now
      };
      currentDocs.push(docRecord);
    }

    const hasUploadedDocs = currentDocs.some(d => d.status === 'UPLOADED' || d.status === 'VERIFIED');
    const newStatus = app.status === 'APPLICATION STARTED' || app.status === 'DETAILS SUBMITTED' || app.status === 'NEW' || app.status === 'FORM SUBMITTED'
      ? (hasUploadedDocs ? 'DOCUMENTS SUBMITTED' : app.status)
      : app.status;

    const updatedApp: LoanApplication = {
      ...app,
      documents: currentDocs,
      status: newStatus as any,
      updatedAt: now,
      lastActivityAt: now
    };

    await setDoc(doc(serverDb, 'applications', targetDocId), cleanForFirestore(updatedApp), { merge: true });
    return { application: updatedApp, document: docRecord };
  }

  async updateDocumentVerification(
    applicationId: string,
    docId: string,
    status: 'VERIFIED' | 'RE_UPLOAD_REQUESTED' | 'REJECTED' | 'UPLOADED' | 'PENDING',
    adminRemark?: string
  ): Promise<{ application: LoanApplication; document: ApplicationDocument } | null> {
    const appRef = doc(serverDb, 'applications', applicationId);
    const snap = await getDoc(appRef);
    let targetDocId = applicationId;
    let app: any = {};

    if (snap.exists()) {
      app = snap.data();
    } else {
      const col = collection(serverDb, 'applications');
      const q = query(col, where('applicationId', '==', applicationId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetDocId = qSnap.docs[0].id;
        app = qSnap.docs[0].data();
      } else {
        return null;
      }
    }

    if (!app.documents) return null;

    const now = new Date().toISOString();
    const currentDocs = [...app.documents];
    const index = currentDocs.findIndex(d => d.id === docId || d.docType === docId);
    if (index === -1) return null;

    currentDocs[index] = {
      ...currentDocs[index],
      status,
      verifiedAt: status === 'VERIFIED' ? now : currentDocs[index].verifiedAt,
      adminRemark: adminRemark !== undefined ? adminRemark : currentDocs[index].adminRemark
    };

    const allVerified = currentDocs.length > 0 && currentDocs.every(d => d.status === 'VERIFIED');
    let appStatus = app.status;
    if (allVerified && (app.status === 'DOCUMENTS SUBMITTED' || app.status === 'VERIFICATION')) {
      appStatus = 'UNDER REVIEW';
    } else if (status === 'VERIFIED' && app.status === 'DOCUMENTS SUBMITTED') {
      appStatus = 'VERIFICATION';
    }

    const updatedApp: LoanApplication = {
      ...app,
      documents: currentDocs,
      status: appStatus as any,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'applications', targetDocId), cleanForFirestore(updatedApp), { merge: true });
    return { application: updatedApp, document: currentDocs[index] };
  }

  async getCustomerNotifications(customerId: string, mobileNumber?: string): Promise<CustomerNotification[]> {
    const notifications: CustomerNotification[] = [];

    // 1. Fetch broadcast & targeted notifications from 'notifications' Firestore collection
    try {
      const notifsSnap = await getDocs(collection(serverDb, 'notifications'));
      notifsSnap.forEach(docSnap => {
        const data = docSnap.data() as CustomerNotification;
        const notif: CustomerNotification = {
          id: docSnap.id,
          customerId: data.customerId || 'ALL',
          target: data.target || 'ALL',
          title: data.title || 'FINCRED Alert',
          message: data.message || '',
          type: data.type || 'info',
          timestamp: data.timestamp || new Date().toISOString(),
          isRead: false,
          link: data.link || data.actionUrl || '',
          actionUrl: data.actionUrl || data.link || '',
          sentBy: data.sentBy || 'Admin'
        };
        // Include if target is ALL or matches customerId or mobileNumber
        if (
          !notif.target ||
          notif.target === 'ALL' ||
          notif.target === customerId ||
          (mobileNumber && notif.target === mobileNumber)
        ) {
          notifications.push(notif);
        }
      });
    } catch (e) {
      console.warn('Could not query notifications collection:', e);
    }

    // 2. Add customer-specific application status notifications
    const apps = await this.getApplicationsByCustomer(customerId, mobileNumber);

    if (apps.length === 0 && notifications.length === 0) {
      notifications.push({
        id: 'notif-welcome',
        customerId,
        target: customerId,
        title: 'Welcome to FINCRED!',
        message: 'Your FINCRED loan account has been created. Check available loan offers or start an application.',
        type: 'info',
        timestamp: new Date().toISOString(),
        isRead: false
      });
    }

    if (apps.length > 0) {
      const latestApp = apps[0];
      notifications.push({
        id: `notif-app-${latestApp.applicationId}`,
        customerId,
        target: customerId,
        title: `Loan Application ${latestApp.applicationId}`,
        message: `Current Status: ${latestApp.status}. Amount: ₹${(latestApp.amountRequested || 0).toLocaleString('en-IN')}`,
        type: latestApp.status === 'APPROVED' ? 'success' : latestApp.status === 'REJECTED' ? 'warning' : 'info',
        timestamp: latestApp.updatedAt || latestApp.submittedAt,
        isRead: false,
        actionUrl: '/dashboard?tab=applications'
      });

      if (latestApp.documents) {
        for (const d of latestApp.documents) {
          if (d.status === 'RE_UPLOAD_REQUESTED') {
            notifications.push({
              id: `notif-doc-reupload-${d.id}`,
              customerId,
              target: customerId,
              title: `Document Update Needed: ${d.name}`,
              message: d.adminRemark ? `Admin note: ${d.adminRemark}. Please re-upload a clear copy.` : 'Please re-upload a clear copy of this document.',
              type: 'warning',
              timestamp: d.uploadedAt || new Date().toISOString(),
              isRead: false,
              actionUrl: '/dashboard?tab=documents'
            });
          } else if (d.status === 'VERIFIED') {
            notifications.push({
              id: `notif-doc-verified-${d.id}`,
              customerId,
              target: customerId,
              title: `Document Verified: ${d.name}`,
              message: `${d.name} has been verified successfully by our verification team.`,
              type: 'success',
              timestamp: d.verifiedAt || d.uploadedAt || new Date().toISOString(),
              isRead: true,
              actionUrl: '/dashboard?tab=documents'
            });
          }
        }
      }
    }

    // Sort newest first
    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // ==========================================
  // ADMIN BROADCAST & PUSH NOTIFICATIONS
  // ==========================================
  async createBroadcastNotification(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'status_change' | 'offer' | 'alert';
    target?: string;
    actionUrl?: string;
    sentBy?: string;
  }): Promise<CustomerNotification> {
    const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newNotif: CustomerNotification = {
      id: notifId,
      customerId: data.target || 'ALL',
      target: data.target || 'ALL',
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type || 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: data.actionUrl || '',
      actionUrl: data.actionUrl || '',
      sentBy: data.sentBy || 'Admin'
    };

    try {
      await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore(newNotif));
    } catch (e) {
      console.warn('Error saving notification to Firestore:', e);
    }

    return newNotif;
  }

  async getAllBroadcastNotifications(): Promise<CustomerNotification[]> {
    try {
      const snap = await getDocs(collection(serverDb, 'notifications'));
      const list: CustomerNotification[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as CustomerNotification);
      });
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.warn('Error fetching all notifications:', e);
      return [];
    }
  }

  async deleteBroadcastNotification(notifId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(serverDb, 'notifications', notifId));
      return true;
    } catch (e) {
      console.warn('Error deleting notification:', e);
      return false;
    }
  }

  // ==========================================
  // BANNER OPERATIONS (FIRESTORE)
  // ==========================================
  async getBanners(activeOnly = false): Promise<Banner[]> {
    try {
      const bannersCol = collection(serverDb, 'banners');
      const snap = await getDocs(bannersCol);
      let list: Banner[] = [];
      snap.forEach(d => {
        const data = d.data() as Banner;
        list.push({ ...data, bannerId: data.bannerId || d.id });
      });

      if (list.length === 0) {
        list = INITIAL_BANNERS;
      }

      if (activeOnly) {
        list = list.filter(b => b.isActive);
      }

      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return list;
    } catch (e) {
      console.error('Error in getBanners from Firestore:', e);
      return activeOnly ? INITIAL_BANNERS.filter(b => b.isActive) : INITIAL_BANNERS;
    }
  }

  async createBanner(banner: Omit<Banner, 'bannerId' | 'createdAt'>): Promise<Banner> {
    const bannerId = `banner-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newBanner: Banner = {
      ...banner,
      bannerId,
      createdAt: now
    };

    await setDoc(doc(serverDb, 'banners', bannerId), cleanForFirestore(newBanner));
    return newBanner;
  }

  async updateBanner(bannerId: string, updates: Partial<Banner>): Promise<Banner | null> {
    try {
      const bannerRef = doc(serverDb, 'banners', bannerId);
      const snap = await getDoc(bannerRef);
      if (!snap.exists()) return null;

      const merged = { ...snap.data(), ...updates } as Banner;
      await setDoc(bannerRef, cleanForFirestore(merged), { merge: true });
      return merged;
    } catch (e) {
      console.error('Error updating banner in Firestore:', e);
      return null;
    }
  }

  async deleteBanner(bannerId: string): Promise<boolean> {
    try {
      const bannerRef = doc(serverDb, 'banners', bannerId);
      const snap = await getDoc(bannerRef);
      if (!snap.exists()) return false;

      await deleteDoc(bannerRef);
      return true;
    } catch (e) {
      console.error('Error deleting banner from Firestore:', e);
      return false;
    }
  }

  // ==========================================
  // SETTINGS OPERATIONS (FIRESTORE)
  // ==========================================
  async getSettings(): Promise<AdminSettings> {
    try {
      const settingsRef = doc(serverDb, 'settings', 'global');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        return { ...DEFAULT_SETTINGS, ...snap.data() } as AdminSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error reading settings from Firestore:', e);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
    const now = new Date().toISOString();
    const current = await this.getSettings();
    const updated: AdminSettings = {
      ...current,
      ...settings,
      updatedAt: now
    };

    const settingsRef = doc(serverDb, 'settings', 'global');
    await setDoc(settingsRef, cleanForFirestore(updated), { merge: true });
    return updated;
  }

  // ==========================================
  // ACTIVITY LOGS (FIRESTORE)
  // ==========================================
  async recordActivity(logData: Omit<ActivityLog, 'id'>): Promise<ActivityLog> {
    try {
      const logId = `act-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
      const timestamp = logData.timestamp || new Date().toISOString();
      
      const record: ActivityLog = {
        ...logData,
        id: logId,
        timestamp
      };

      await setDoc(doc(serverDb, 'activity_logs', logId), cleanForFirestore(record));

      // If tied to a customer, update customer's last active info & device history
      if (logData.customerId || logData.mobileNumber) {
        let cust: Customer | undefined;
        if (logData.customerId) {
          cust = await this.getCustomerById(logData.customerId);
        }
        if (!cust && logData.mobileNumber) {
          cust = await this.getCustomerByMobile(logData.mobileNumber);
        }

        if (cust) {
          const devicesUsed = Array.isArray(cust.devicesUsed) ? [...cust.devicesUsed] : [];
          if (logData.deviceSummary && !devicesUsed.includes(logData.deviceSummary)) {
            devicesUsed.push(logData.deviceSummary);
          }
          const locationsUsed = Array.isArray(cust.locationsUsed) ? [...cust.locationsUsed] : [];
          const locStr = logData.location || logData.city;
          if (locStr && !locationsUsed.includes(locStr)) {
            locationsUsed.push(locStr);
          }

          await setDoc(doc(serverDb, 'customers', cust.customerId), cleanForFirestore({
            lastActiveAt: timestamp,
            lastAction: logData.action,
            deviceSummary: logData.deviceSummary || cust.deviceSummary,
            deviceType: logData.deviceType || cust.deviceType,
            browser: logData.browser || cust.browser,
            os: logData.os || cust.os,
            ipAddress: logData.ipAddress || cust.ipAddress,
            location: locStr || cust.location,
            devicesUsed,
            locationsUsed,
            updatedAt: timestamp
          }), { merge: true });
        }
      }

      return record;
    } catch (e) {
      console.error('Error saving activity log to Firestore:', e);
      return {
        ...logData,
        id: `local-${Date.now()}`,
        timestamp: logData.timestamp || new Date().toISOString()
      };
    }
  }

  async getActivityLogs(limitCount = 100): Promise<ActivityLog[]> {
    try {
      const logsCol = collection(serverDb, 'activity_logs');
      const snap = await getDocs(logsCol);
      const list: ActivityLog[] = [];
      snap.forEach(d => {
        const data = d.data() as ActivityLog;
        list.push({ ...data, id: data.id || d.id });
      });
      list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      return list.slice(0, limitCount);
    } catch (e) {
      console.error('Error fetching activity logs from Firestore:', e);
      return [];
    }
  }

  async clearActivityLogs(): Promise<boolean> {
    try {
      const logsCol = collection(serverDb, 'activity_logs');
      const snap = await getDocs(logsCol);
      for (const d of snap.docs) {
        await deleteDoc(doc(serverDb, 'activity_logs', d.id));
      }
      return true;
    } catch (e) {
      console.error('Error clearing activity logs:', e);
      return false;
    }
  }

  // ==========================================
  // LOAN OPTIONS OPERATIONS (FIRESTORE)
  // ==========================================
  async getLoanOptions(categoryFilter?: string): Promise<LoanOption[]> {
    try {
      const optionsCol = collection(serverDb, 'loan_options');
      const snap = await getDocs(optionsCol);
      let list: LoanOption[] = [];

      if (snap.empty) {
        // Seed default initial options into Firestore
        for (const opt of INITIAL_LOAN_OPTIONS) {
          try {
            await setDoc(doc(serverDb, 'loan_options', opt.optionId), cleanForFirestore(opt));
          } catch (e) {
            console.warn('Loan option seed write notice:', opt.optionId, e);
          }
        }
        list = [...INITIAL_LOAN_OPTIONS];
      } else {
        snap.forEach(d => {
          const data = d.data() as LoanOption;
          list.push({ ...data, optionId: data.optionId || d.id });
        });
      }

      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      if (categoryFilter && categoryFilter !== 'ALL') {
        const norm = categoryFilter.toLowerCase().trim();
        return list.filter(o => {
          const catNorm = (o.category || '').toLowerCase().trim();
          if (norm === 'personal loan' || norm === 'personal') {
            return catNorm.includes('personal');
          }
          if (norm === 'business loan' || norm === 'business') {
            return catNorm.includes('business');
          }
          if (norm === 'instant loan' || norm === 'instant') {
            return catNorm.includes('instant');
          }
          if (norm === 'other' || norm === 'all type loan') {
            return catNorm.includes('other') || catNorm.includes('all');
          }
          return catNorm === norm;
        });
      }

      return list;
    } catch (e) {
      console.error('Error fetching loan options from Firestore:', e);
      return INITIAL_LOAN_OPTIONS;
    }
  }

  async getLoanOptionById(optionId: string): Promise<LoanOption | null> {
    try {
      const optRef = doc(serverDb, 'loan_options', optionId);
      const snap = await getDoc(optRef);
      if (snap.exists()) {
        const data = snap.data() as LoanOption;
        return { ...data, optionId: data.optionId || snap.id };
      }
      return null;
    } catch (e) {
      console.error('Error getting loan option by ID:', e);
      return null;
    }
  }

  async saveLoanOption(option: Partial<LoanOption>): Promise<LoanOption> {
    const optionId = option.optionId || `opt-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const record: LoanOption = {
      optionId,
      name: String(option.name || 'Loan Option').trim(),
      category: option.category || 'Personal Loan',
      partnerName: String(option.partnerName || 'Financial Partner').trim(),
      applicationUrl: String(option.applicationUrl || '').trim(),
      loanAmountRange: option.loanAmountRange || undefined,
      tenureRange: option.tenureRange || undefined,
      interestRate: option.interestRate || undefined,
      description: String(option.description || '').trim(),
      eligibilityInfo: Array.isArray(option.eligibilityInfo) ? option.eligibilityInfo : [],
      requiredDocuments: Array.isArray(option.requiredDocuments) ? option.requiredDocuments : [],
      processingInfo: option.processingInfo || undefined,
      importantTerms: option.importantTerms || undefined,
      badge: option.badge || undefined,
      isActive: option.isActive !== false,
      displayOrder: typeof option.displayOrder === 'number' ? option.displayOrder : 99,
      createdAt: option.createdAt || now,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'loan_options', optionId), cleanForFirestore(record), { merge: true });
    return record;
  }

  async deleteLoanOption(optionId: string): Promise<boolean> {
    try {
      const optRef = doc(serverDb, 'loan_options', optionId);
      await deleteDoc(optRef);
      return true;
    } catch (e) {
      console.error('Error deleting loan option from Firestore:', e);
      return false;
    }
  }

  // ==========================================
  // PARTNER PLATFORMS & VERIFIED LENDERS (FIRESTORE)
  // ==========================================
  async getPartnerPlatforms(categoryFilter?: string): Promise<PartnerPlatform[]> {
    try {
      const col = collection(serverDb, 'partner_platforms');
      const snap = await getDocs(col);
      let list: PartnerPlatform[] = [];

      if (snap.empty) {
        // Seed initial platforms into Firestore
        for (const p of INITIAL_PARTNER_PLATFORMS) {
          try {
            await setDoc(doc(serverDb, 'partner_platforms', p.platformId), cleanForFirestore(p));
          } catch (e) {
            console.warn('Partner platform seed write error:', p.platformId, e);
          }
        }
        list = [...INITIAL_PARTNER_PLATFORMS];
      } else {
        snap.forEach(d => {
          const data = d.data() as PartnerPlatform;
          list.push({ ...data, platformId: data.platformId || d.id });
        });
      }

      // If category filter is provided
      if (categoryFilter) {
        const norm = categoryFilter.toLowerCase().trim();
        const isPersonal = norm.includes('personal');
        const isBusiness = norm.includes('business');

        if (isPersonal) {
          // Rule for Personal Loan:
          // Configured options order: WeRize (1), Ruloans (2), Choice Connect (3), True Balance (4)
          const plOrder: Record<string, number> = {
            werize: 1,
            ruloans: 2,
            choice_connect: 3,
            true_balance: 4
          };
          list = list
            .filter(p => p.isActive && (p.supportedCategories?.some(c => c.toLowerCase().includes('personal')) || p.personalLoanUrl))
            .sort((a, b) => {
              const orderA = plOrder[a.platformId] ?? a.displayOrder ?? 99;
              const orderB = plOrder[b.platformId] ?? b.displayOrder ?? 99;
              return orderA - orderB;
            });
          return list;
        }

        if (isBusiness) {
          // Rule for Business Loan:
          // Business Loan options: Ruloans (1), Choice Connect (2), WeRize (3), any other
          // True Balance is excluded for business loan applications
          const blOrder: Record<string, number> = {
            ruloans: 1,
            choice_connect: 2,
            werize: 3
          };
          list = list
            .filter(p => p.isActive && p.platformId !== 'true_balance' && (p.supportedCategories?.some(c => c.toLowerCase().includes('business')) || p.businessLoanUrl))
            .sort((a, b) => {
              const orderA = blOrder[a.platformId] ?? a.displayOrder ?? 99;
              const orderB = blOrder[b.platformId] ?? b.displayOrder ?? 99;
              return orderA - orderB;
            });
          return list;
        }
      }

      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return list;
    } catch (e) {
      console.error('Error getting partner platforms from Firestore:', e);
      return INITIAL_PARTNER_PLATFORMS;
    }
  }

  async getPartnerPlatformById(platformId: string): Promise<PartnerPlatform | null> {
    try {
      const pRef = doc(serverDb, 'partner_platforms', platformId);
      const snap = await getDoc(pRef);
      if (snap.exists()) {
        const data = snap.data() as PartnerPlatform;
        return { ...data, platformId: data.platformId || snap.id };
      }
      const found = INITIAL_PARTNER_PLATFORMS.find(p => p.platformId === platformId);
      return found || null;
    } catch (e) {
      console.error('Error getting partner platform by id:', e);
      return null;
    }
  }

  async savePartnerPlatform(platform: Partial<PartnerPlatform>): Promise<PartnerPlatform> {
    const platformId = platform.platformId || `partner-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const existing = await this.getPartnerPlatformById(platformId);

    const record: PartnerPlatform = {
      platformId,
      name: String(platform.name || existing?.name || 'Partner Platform').trim(),
      logoUrl: platform.logoUrl !== undefined ? platform.logoUrl : existing?.logoUrl,
      description: String(platform.description || existing?.description || '').trim(),
      partnerNetworkSummary: String(platform.partnerNetworkSummary || existing?.partnerNetworkSummary || 'Partner Banks & NBFCs').trim(),
      verifiedPartnerCount: platform.verifiedPartnerCount !== undefined ? platform.verifiedPartnerCount : existing?.verifiedPartnerCount,
      isCompleteLenderListAvailable: platform.isCompleteLenderListAvailable !== undefined ? platform.isCompleteLenderListAvailable : (existing?.isCompleteLenderListAvailable ?? false),
      lenderNetworkDisclaimer: platform.lenderNetworkDisclaimer !== undefined ? platform.lenderNetworkDisclaimer : existing?.lenderNetworkDisclaimer,
      personalLoanUrl: String(platform.personalLoanUrl || existing?.personalLoanUrl || '').trim(),
      businessLoanUrl: platform.businessLoanUrl !== undefined ? String(platform.businessLoanUrl).trim() : (existing?.businessLoanUrl || ''),
      supportedCategories: Array.isArray(platform.supportedCategories) ? platform.supportedCategories : (existing?.supportedCategories || ['Personal Loan']),
      loanAmountRange: platform.loanAmountRange || existing?.loanAmountRange,
      tenureRange: platform.tenureRange || existing?.tenureRange,
      interestRate: platform.interestRate || existing?.interestRate,
      badge: platform.badge !== undefined ? platform.badge : existing?.badge,
      displayOrder: platform.displayOrder !== undefined ? Number(platform.displayOrder) : (existing?.displayOrder ?? 1),
      isActive: platform.isActive !== undefined ? Boolean(platform.isActive) : (existing?.isActive ?? true),
      lenders: Array.isArray(platform.lenders) ? platform.lenders : (existing?.lenders || []),
      lastVerifiedDate: platform.lastVerifiedDate || existing?.lastVerifiedDate || now.split('T')[0],
      sourceReference: platform.sourceReference || existing?.sourceReference || 'Verified Institutional Disclosures',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'partner_platforms', platformId), cleanForFirestore(record));
    return record;
  }

  async deletePartnerPlatform(platformId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(serverDb, 'partner_platforms', platformId));
      return true;
    } catch (e) {
      console.error('Error deleting partner platform:', e);
      return false;
    }
  }

  async recordPartnerSelection(
    applicationId: string,
    partnerId: string,
    partnerName: string,
    loanCategory: string,
    referralUrl: string,
    lenderName?: string,
    lenderId?: string
  ): Promise<{ success: boolean; application: LoanApplication; referralUrl: string }> {
    const app = await this.getApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application ${applicationId} not found in database`);
    }

    const now = new Date().toISOString();
    const updatedApp: LoanApplication = {
      ...app,
      partnerName: partnerName || app.partnerName,
      partnerPlatformId: partnerId || app.partnerPlatformId,
      partnerSelected: true,
      destinationUrl: referralUrl || app.destinationUrl,
      redirectUrl: referralUrl || app.redirectUrl || app.destinationUrl,
      selectedOptionName: partnerName || app.selectedOptionName,
      selectedLenderName: lenderName || app.selectedLenderName,
      selectedLenderId: lenderId || app.selectedLenderId,
      applyNowClicked: true,
      applyNowClickedAt: now,
      status: 'APPLICATION STARTED',
      externalApplicationStatus: `Application Started with ${partnerName}${lenderName ? ` (${lenderName})` : ''}`,
      lastActivityAt: now,
      updatedAt: now
    };

    await setDoc(doc(serverDb, 'applications', applicationId), cleanForFirestore(updatedApp), { merge: true });

    // Track in activity logs
    await this.recordActivity({
      customerId: app.customerId,
      customerName: app.fullName,
      mobileNumber: app.mobileNumber,
      action: `Partner Selected: ${partnerName}`,
      details: `Lead ID: ${applicationId} | Loan Category: ${loanCategory} | Lender: ${lenderName || 'Standard Partner'} | Apply Now Clicked = YES`,
      category: 'partner_click',
      timestamp: now,
      metadata: {
        applicationId,
        partnerId,
        partnerName,
        loanCategory,
        lenderName,
        lenderId,
        applyNowClicked: true,
        applicationStarted: true
      }
    });

    return {
      success: true,
      application: updatedApp,
      referralUrl
    };
  }

  // ==========================================
  // ADMIN STATS (FIRESTORE)
  // ==========================================
  async getAdminStats(): Promise<AdminStats> {
    const customers = await this.getCustomers();
    const applications = await this.getApplications();
    const activities = await this.getActivityLogs(50);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayLeads = applications.filter(a => (a.submittedAt || '').startsWith(todayStr)).length;

    const personal = applications.filter(a => {
      const c = (a.loanCategory || '').toLowerCase();
      return c.includes('personal');
    }).length;

    const business = applications.filter(a => {
      const c = (a.loanCategory || '').toLowerCase();
      return c.includes('business');
    }).length;

    const instant = applications.filter(a => {
      const c = (a.loanCategory || '').toLowerCase();
      return c.includes('instant');
    }).length;

    const allType = applications.filter(a => {
      const c = (a.loanCategory || '').toLowerCase();
      return c.includes('all') || c.includes('other');
    }).length;

    // Status metrics
    const newLeads = applications.filter(a => a.status === 'NEW' || a.status === 'FORM SUBMITTED' || a.status === 'Request Submitted').length;
    const startedLeads = applications.filter(a => a.status === 'APPLICATION STARTED' || a.status === 'OPTION SELECTED').length;
    const completedLeads = applications.filter(a => a.status === 'APPLICATION COMPLETED').length;
    const underReviewLeads = applications.filter(a => a.status === 'UNDER REVIEW' || a.status === 'Under External Review').length;
    const approvedLeads = applications.filter(a => a.status === 'APPROVED').length;
    const rejectedLeads = applications.filter(a => a.status === 'REJECTED').length;
    const duplicateLeads = applications.filter(a => a.isDuplicate === true).length;

    // Calculate device breakdown
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;

    customers.forEach(c => {
      if (c.deviceType === 'Mobile') mobileCount++;
      else if (c.deviceType === 'Tablet') tabletCount++;
      else if (c.deviceType === 'Desktop') desktopCount++;
      else if (c.source === 'mobile_app') mobileCount++;
      else desktopCount++;
    });

    // Locations frequency
    const locMap = new Map<string, number>();
    customers.forEach(c => {
      const loc = c.location || c.city || 'India';
      locMap.set(loc, (locMap.get(loc) || 0) + 1);
    });
    const locationsList = Array.from(locMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCustomers: customers.length,
      totalApplications: applications.length,
      todayLeads,
      personalLoanRequests: personal,
      businessLoanRequests: business,
      instantLoanRequests: instant,
      allTypeLoanRequests: allType,
      newLeads,
      startedLeads,
      completedLeads,
      underReviewLeads,
      approvedLeads,
      rejectedLeads,
      duplicateLeads,
      recentCustomers: customers.slice(0, 8),
      recentApplications: applications.slice(0, 8),
      totalActivities: activities.length,
      deviceBreakdown: {
        mobile: mobileCount,
        desktop: desktopCount,
        tablet: tabletCount
      },
      locationsList
    };
  }

  // -------------------------------------------------------------
  // CIBIL SCORE IMPROVEMENT ORDERS (₹299 Payment & Branch Link Delivery)
  // -------------------------------------------------------------
  async createCibilOrder(data: {
    customerId?: string;
    fullName: string;
    mobileNumber: string;
    email?: string;
    panNumber?: string;
    currentScoreEstimate?: string;
    utrNumber: string;
    amount?: number;
  }): Promise<CibilOrder> {
    const orderId = `cib-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const referenceNumber = `CIBIL-2026-${randomHex}`;

    const order: CibilOrder = {
      id: orderId,
      orderId,
      referenceNumber,
      customerId: data.customerId || '',
      fullName: data.fullName.trim(),
      mobileNumber: data.mobileNumber.trim(),
      email: data.email?.trim() || '',
      panNumber: data.panNumber?.trim() || '',
      currentScoreEstimate: data.currentScoreEstimate || '',
      utrNumber: data.utrNumber.trim(),
      amount: data.amount || 299,
      status: 'pending_verification',
      loanLink: '',
      submittedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(serverDb, 'cibil_orders', orderId), cleanForFirestore(order));
    } catch (e) {
      console.error('Failed to save cibil order to Firestore:', e);
    }

    // Auto-create initial confirmation pending notification
    try {
      const notifId = `notif-cib-${Date.now()}`;
      await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
        id: notifId,
        customerId: data.customerId || data.mobileNumber.trim(),
        target: data.customerId || data.mobileNumber.trim(),
        title: 'CIBIL Improvement Order Submitted (₹299)',
        message: `Your payment with UTR ${data.utrNumber.trim()} (Ref: ${referenceNumber}) has been submitted. Our team is verifying your payment.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        isRead: false
      }));
    } catch {}

    return order;
  }

  async getAllCibilOrders(): Promise<CibilOrder[]> {
    const orders: CibilOrder[] = [];
    try {
      const snap = await getDocs(collection(serverDb, 'cibil_orders'));
      snap.forEach(d => {
        orders.push({ id: d.id, ...d.data() } as CibilOrder);
      });
      orders.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch (e) {
      console.error('Error fetching cibil orders:', e);
    }
    return orders;
  }

  async getCibilOrderByIdOrRef(queryStr: string): Promise<CibilOrder | null> {
    try {
      const clean = queryStr.trim().toLowerCase();
      const all = await this.getAllCibilOrders();
      const found = all.find(o => 
        o.orderId.toLowerCase() === clean || 
        o.referenceNumber.toLowerCase() === clean ||
        o.mobileNumber.includes(clean) ||
        (o.customerId && o.customerId.toLowerCase() === clean) ||
        o.utrNumber.toLowerCase() === clean
      );
      return found || null;
    } catch {
      return null;
    }
  }

  async confirmCibilOrder(orderId: string, adminNotes?: string): Promise<CibilOrder | null> {
    try {
      const docRef = doc(serverDb, 'cibil_orders', orderId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;

      const current = snap.data() as CibilOrder;
      const loanLink = 'https://branch.co/download/shubh12360';
      const updated: CibilOrder = {
        ...current,
        status: 'confirmed',
        loanLink,
        adminNotes: adminNotes || 'Payment verified. Branch Instant Loan access granted.',
        confirmedAt: new Date().toISOString()
      };

      await setDoc(docRef, cleanForFirestore(updated), { merge: true });

      // Create notification for customer on app & web
      const notifId = `notif-cib-conf-${Date.now()}`;
      await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
        id: notifId,
        customerId: current.customerId || current.mobileNumber,
        target: current.customerId || current.mobileNumber,
        title: '🎉 CIBIL Improvement Payment Verified!',
        message: 'Your ₹299 payment has been verified by FinCred Admin. Click Continue to download Branch & unlock your instant pre-approved loan.',
        type: 'success',
        link: loanLink,
        actionUrl: loanLink,
        timestamp: new Date().toISOString(),
        isRead: false
      }));

      return updated;
    } catch (e) {
      console.error('Failed to confirm cibil order:', e);
      return null;
    }
  }

  async rejectCibilOrder(orderId: string, reason?: string): Promise<CibilOrder | null> {
    try {
      const docRef = doc(serverDb, 'cibil_orders', orderId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;

      const current = snap.data() as CibilOrder;
      const updated: CibilOrder = {
        ...current,
        status: 'rejected',
        adminNotes: reason || 'Invalid UTR Number / Payment not received.',
        confirmedAt: new Date().toISOString()
      };

      await setDoc(docRef, cleanForFirestore(updated), { merge: true });
      return updated;
    } catch (e) {
      console.error('Failed to reject cibil order:', e);
      return null;
    }
  }

  // =============================================================
  // EARN & REFER: SETTINGS
  // =============================================================
  async getEarnSettings(): Promise<EarnSettings> {
    try {
      const snap = await getDoc(doc(serverDb, 'earn_settings', 'config'));
      if (snap.exists()) {
        return snap.data() as EarnSettings;
      }
    } catch (e) {
      console.warn('Using default earn settings fallback:', e);
    }
    const def: EarnSettings = {
      appRewardAmount: 100,
      userInitialPayment: 1,
      totalReturnedAfterQualification: 101,
      primaryLoanReferralReward: 200,
      secondaryReferralReward: 150,
      payoutWindowHours: 24,
      isFirstTimeRewardEnabled: true,
      isLoanReferralEnabled: true,
      isFraudReviewEnabled: true,
      isAdminPayoutApprovalRequired: true,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(serverDb, 'earn_settings', 'config'), cleanForFirestore(def));
    } catch {}
    return def;
  }

  async updateEarnSettings(settings: Partial<EarnSettings>): Promise<EarnSettings> {
    const current = await this.getEarnSettings();
    const updated: EarnSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(serverDb, 'earn_settings', 'config'), cleanForFirestore(updated), { merge: true });
    return updated;
  }

  // =============================================================
  // EARN & REFER: REFERRAL PROFILES & BANK REGISTRATION
  // =============================================================
  async getReferralProfile(userId: string): Promise<ReferralProfile | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'referral_profiles', userId));
      if (!snap.exists()) return null;
      const data = snap.data() as ReferralProfile;
      return {
        ...data,
        accountNumber: undefined // Hide raw account number for security
      };
    } catch {
      return null;
    }
  }

  async activateReferralProfile(data: {
    userId: string;
    fullName: string;
    mobileNumber: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    parentReferrerCode?: string;
  }): Promise<ReferralProfile> {
    const cleanAcc = data.accountNumber.trim();
    const masked = cleanAcc.length > 4 ? `XXXXXX${cleanAcc.slice(-4)}` : cleanAcc;

    // Generate unique referral code: FIN + 6 alphanumeric chars
    let code = '';
    let isUnique = false;
    for (let attempts = 0; attempts < 10; attempts++) {
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const candidate = `FIN${rand}`;
      const existing = await getDocs(query(collection(serverDb, 'referral_profiles'), where('referralCode', '==', candidate)));
      if (existing.empty) {
        code = candidate;
        isUnique = true;
        break;
      }
    }
    if (!isUnique) {
      code = `FIN${Date.now().toString().slice(-6)}`;
    }

    const referralLink = `https://fincred.ai.studio/?ref=${code}`;

    const profile: ReferralProfile = {
      userId: data.userId,
      fullName: data.fullName.trim(),
      mobileNumber: data.mobileNumber.trim(),
      referralCode: code,
      referralLink,
      bankName: data.bankName.trim(),
      accountNumberMasked: masked,
      accountNumber: cleanAcc,
      ifscCode: data.ifscCode.trim().toUpperCase(),
      isActivated: true,
      totalEarned: 0,
      pendingRewards: 0,
      paidRewards: 0,
      parentReferrerCode: data.parentReferrerCode || undefined,
      activatedAt: new Date().toISOString()
    };

    await setDoc(doc(serverDb, 'referral_profiles', data.userId), cleanForFirestore(profile), { merge: true });

    // Send in-app notification
    const notifId = `notif-ref-act-${Date.now()}`;
    await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
      id: notifId,
      customerId: data.userId,
      target: data.userId,
      title: '🎉 Referral Account Activated!',
      message: `Your referral code is ${code}. Share your link to earn ₹200 on every qualifying loan disbursal!`,
      type: 'success',
      timestamp: new Date().toISOString(),
      isRead: false
    }));

    return {
      ...profile,
      accountNumber: undefined
    };
  }

  // =============================================================
  // EARN & REFER: APP DOWNLOAD REWARDS (₹1 Send -> ₹101 Return)
  // =============================================================
  async getAppReward(userId: string): Promise<AppReward | null> {
    try {
      const snap = await getDoc(doc(serverDb, 'app_rewards', userId));
      if (!snap.exists()) return null;
      return snap.data() as AppReward;
    } catch {
      return null;
    }
  }

  async checkAppRewardEligibility(userId: string, mobileNumber: string): Promise<{ eligible: boolean; message?: string; reward?: AppReward }> {
    const existing = await this.getAppReward(userId);
    if (existing) {
      if (['COMPLETED', '₹100 REWARD SENT', 'PAID'].includes(existing.status)) {
        return {
          eligible: false,
          message: 'Your ₹100 first-time reward has already been claimed.',
          reward: existing
        };
      }
      return { eligible: true, reward: existing };
    }

    try {
      const qSnap = await getDocs(query(collection(serverDb, 'app_rewards'), where('mobileNumber', '==', mobileNumber.trim())));
      for (const d of qSnap.docs) {
        const rew = d.data() as AppReward;
        if (['COMPLETED', '₹100 REWARD SENT', 'PAID'].includes(rew.status)) {
          return {
            eligible: false,
            message: 'Your ₹100 first-time reward has already been claimed on this mobile number.'
          };
        }
      }
    } catch {}

    return { eligible: true };
  }

  async recordNaviLinkClicked(userId: string, userName: string, mobileNumber: string): Promise<AppReward> {
    const existing = await this.getAppReward(userId);
    if (existing && existing.status !== 'NOT STARTED') {
      const updated = { ...existing, naviLinkClicked: true };
      await setDoc(doc(serverDb, 'app_rewards', userId), cleanForFirestore(updated), { merge: true });
      return updated;
    }

    const reward: AppReward = {
      id: userId,
      userId,
      userName: userName.trim(),
      mobileNumber: mobileNumber.trim(),
      status: 'DOWNLOAD LINK OPENED',
      naviLinkClicked: true,
      rewardAmount: 100,
      totalReturn: 101,
      claimedAt: new Date().toISOString()
    };

    await setDoc(doc(serverDb, 'app_rewards', userId), cleanForFirestore(reward));
    return reward;
  }

  async submitAppRewardPayment(userId: string, paymentReference: string): Promise<AppReward> {
    const cleanRef = paymentReference.trim();
    const existing = await this.getAppReward(userId);
    if (!existing) {
      throw new Error('Reward process not initialized. Please click Download Navi App first.');
    }

    // Check for duplicate payment reference across all claims
    try {
      const dupSnap = await getDocs(query(collection(serverDb, 'app_rewards'), where('paymentReference', '==', cleanRef)));
      const duplicates = dupSnap.docs.filter(d => d.id !== userId);
      if (duplicates.length > 0) {
        throw new Error('This payment transaction reference has already been submitted.');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('already been submitted')) throw e;
    }

    const updated: AppReward = {
      ...existing,
      paymentReference: cleanRef,
      status: '₹1 PAYMENT RECEIVED',
      claimedAt: new Date().toISOString()
    };

    await setDoc(doc(serverDb, 'app_rewards', userId), cleanForFirestore(updated), { merge: true });

    // Send notification
    const notifId = `notif-app-rew-${Date.now()}`;
    await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
      id: notifId,
      customerId: userId,
      target: userId,
      title: '₹1 Payment Submitted for Verification',
      message: `Your payment reference ${cleanRef} has been received. Admin is verifying your ₹100 reward.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      isRead: false
    }));

    return updated;
  }

  async getAllAppRewards(): Promise<AppReward[]> {
    const list: AppReward[] = [];
    try {
      const snap = await getDocs(collection(serverDb, 'app_rewards'));
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as AppReward));
      list.sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
    } catch {}
    return list;
  }

  async adminVerifyAppReward(
    userId: string,
    action: 'VERIFY_1' | 'APPROVE_REWARD' | 'MARK_PAID' | 'REJECT' | 'HOLD',
    notes?: string,
    adminId?: string
  ): Promise<AppReward> {
    const docRef = doc(serverDb, 'app_rewards', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('App reward record not found.');

    const current = snap.data() as AppReward;
    let newStatus: AppRewardStatus = current.status;
    let verifiedAt = current.verifiedAt;
    let paidAt = current.paidAt;

    if (action === 'VERIFY_1') {
      newStatus = 'PAYMENT VERIFIED';
      verifiedAt = new Date().toISOString();
    } else if (action === 'APPROVE_REWARD') {
      newStatus = '₹100 REWARD PENDING';
    } else if (action === 'MARK_PAID') {
      newStatus = 'COMPLETED';
      paidAt = new Date().toISOString();
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (action === 'HOLD') {
      newStatus = 'ON HOLD';
    }

    const updated: AppReward = {
      ...current,
      status: newStatus,
      verifiedAt,
      paidAt,
      adminNotes: notes || current.adminNotes
    };

    await setDoc(docRef, cleanForFirestore(updated), { merge: true });

    if (action === 'MARK_PAID') {
      const profile = await this.getReferralProfile(userId);
      if (profile) {
        await setDoc(doc(serverDb, 'referral_profiles', userId), {
          totalEarned: (profile.totalEarned || 0) + 101,
          paidRewards: (profile.paidRewards || 0) + 101
        }, { merge: true });
      }

      const notifId = `notif-app-paid-${Date.now()}`;
      await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
        id: notifId,
        customerId: userId,
        target: userId,
        title: '🎉 ₹101 App Reward Transferred!',
        message: 'Your ₹100 App Download Reward (+ ₹1 return) has been successfully paid to your bank account.',
        type: 'success',
        timestamp: new Date().toISOString(),
        isRead: false
      }));
    }

    return updated;
  }

  // =============================================================
  // EARN & REFER: LOAN REFERRALS & 24-HOUR DISBURSAL PAYOUT
  // =============================================================
  async recordLoanReferral(payload: {
    referrerCode: string;
    referredCustomer: Customer;
    applicationId: string;
    loanType: string;
    provider: string;
  }): Promise<LoanReferral | null> {
    const cleanCode = payload.referrerCode.trim().toUpperCase();

    const refSnap = await getDocs(query(collection(serverDb, 'referral_profiles'), where('referralCode', '==', cleanCode)));
    if (refSnap.empty) return null;

    const referrer = refSnap.docs[0].data() as ReferralProfile;

    if (
      referrer.userId === payload.referredCustomer.customerId ||
      referrer.mobileNumber === payload.referredCustomer.mobileNumber
    ) {
      console.warn('Blocked self-referral attempt for user:', referrer.userId);
      return null;
    }

    const referralId = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const loanReferral: LoanReferral = {
      id: referralId,
      referrerUserId: referrer.userId,
      referrerName: referrer.fullName,
      referralCode: cleanCode,
      referredCustomerId: payload.referredCustomer.customerId,
      referredCustomerName: payload.referredCustomer.fullName,
      referredCustomerMobile: payload.referredCustomer.mobileNumber,
      applicationId: payload.applicationId,
      loanType: payload.loanType,
      provider: payload.provider,
      applicationDate: new Date().toISOString(),
      applicationStatus: 'APPLICATION RECEIVED',
      disbursalStatus: 'PENDING',
      rewardAmount: 200,
      rewardTier: 'PRIMARY',
      rewardEligibility: false,
      payoutStatus: 'APPLICATION RECEIVED',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(serverDb, 'loan_referrals', referralId), cleanForFirestore(loanReferral));

    const notifId = `notif-ref-lead-${Date.now()}`;
    await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
      id: notifId,
      customerId: referrer.userId,
      target: referrer.userId,
      title: 'New Referred Loan Application Received',
      message: `${payload.referredCustomer.fullName} has applied for a ${payload.loanType} using your referral code. Reward: ₹200 on successful disbursal.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      isRead: false
    }));

    return loanReferral;
  }

  async getCustomerReferrals(userId: string): Promise<LoanReferral[]> {
    const list: LoanReferral[] = [];
    try {
      const snap = await getDocs(query(collection(serverDb, 'loan_referrals'), where('referrerUserId', '==', userId)));
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as LoanReferral));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {}
    return list;
  }

  async getAllLoanReferrals(): Promise<LoanReferral[]> {
    const list: LoanReferral[] = [];
    try {
      const snap = await getDocs(collection(serverDb, 'loan_referrals'));
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as LoanReferral));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {}
    return list;
  }

  async triggerDisbursalReward(applicationId: string, disbursalAmount?: number): Promise<void> {
    try {
      const snap = await getDocs(query(collection(serverDb, 'loan_referrals'), where('applicationId', '==', applicationId)));
      if (snap.empty) return;

      const now = new Date();
      const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      for (const d of snap.docs) {
        const item = d.data() as LoanReferral;
        const updatedItem: LoanReferral = {
          ...item,
          disbursalStatus: 'DISBURSED',
          disbursalDate: now.toISOString(),
          disbursalAmount: disbursalAmount || item.disbursalAmount,
          rewardEligibility: true,
          payoutDeadline: deadline,
          payoutStatus: 'PAYOUT PENDING'
        };

        await setDoc(doc(serverDb, 'loan_referrals', d.id), cleanForFirestore(updatedItem), { merge: true });

        const prof = await this.getReferralProfile(item.referrerUserId);
        if (prof) {
          await setDoc(doc(serverDb, 'referral_profiles', item.referrerUserId), {
            pendingRewards: (prof.pendingRewards || 0) + item.rewardAmount
          }, { merge: true });
        }

        const payoutId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const payoutRecord: Payout = {
          id: payoutId,
          payoutId,
          userId: item.referrerUserId,
          userName: item.referrerName,
          mobileNumber: prof?.mobileNumber || '',
          rewardType: 'LOAN_REFERRAL',
          rewardAmount: item.rewardAmount,
          bankName: prof?.bankName || 'Verified Bank',
          accountNumberMasked: prof?.accountNumberMasked || 'XXXXXX',
          ifscCode: prof?.ifscCode || '',
          reason: `Referral Reward (App: ${applicationId})`,
          eligibilityDate: now.toISOString(),
          deadline,
          status: 'PAYOUT PENDING',
          createdAt: now.toISOString()
        };
        await setDoc(doc(serverDb, 'payouts', payoutId), cleanForFirestore(payoutRecord));

        const notifId = `notif-ref-disb-${Date.now()}`;
        await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
          id: notifId,
          customerId: item.referrerUserId,
          target: item.referrerUserId,
          title: '🎉 Loan Disbursed! ₹200 Reward Eligible',
          message: `Your referred applicant (${item.referredCustomerName}) loan has been disbursed. Your ₹200 reward will be transferred within 24 hours.`,
          type: 'success',
          timestamp: now.toISOString(),
          isRead: false
        }));
      }
    } catch (e) {
      console.error('Error triggering disbursal reward:', e);
    }
  }

  // =============================================================
  // EARN & REFER: PAYOUTS & BANK AUDIT LOGS
  // =============================================================
  async getAllPayouts(): Promise<Payout[]> {
    const list: Payout[] = [];
    try {
      const snap = await getDocs(collection(serverDb, 'payouts'));
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Payout));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {}
    return list;
  }

  async updatePayoutStatus(
    payoutId: string,
    action: 'APPROVE' | 'MARK_PAID' | 'HOLD' | 'REJECT',
    transactionId?: string,
    notes?: string
  ): Promise<Payout> {
    const docRef = doc(serverDb, 'payouts', payoutId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Payout record not found.');

    const current = snap.data() as Payout;
    let newStatus: Payout['status'] = current.status;
    let paidAt = current.paidAt;

    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'MARK_PAID') {
      newStatus = 'PAID';
      paidAt = new Date().toISOString();
    } else if (action === 'HOLD') newStatus = 'ON HOLD';
    else if (action === 'REJECT') newStatus = 'REJECTED';

    const updated: Payout = {
      ...current,
      status: newStatus,
      transactionId: transactionId || current.transactionId,
      adminNotes: notes || current.adminNotes,
      paidAt
    };

    await setDoc(docRef, cleanForFirestore(updated), { merge: true });

    if (action === 'MARK_PAID') {
      const prof = await this.getReferralProfile(current.userId);
      if (prof) {
        await setDoc(doc(serverDb, 'referral_profiles', current.userId), {
          totalEarned: (prof.totalEarned || 0) + current.rewardAmount,
          pendingRewards: Math.max(0, (prof.pendingRewards || 0) - current.rewardAmount),
          paidRewards: (prof.paidRewards || 0) + current.rewardAmount
        }, { merge: true });
      }

      const notifId = `notif-payout-paid-${Date.now()}`;
      await setDoc(doc(serverDb, 'notifications', notifId), cleanForFirestore({
        id: notifId,
        customerId: current.userId,
        target: current.userId,
        title: '🎉 Payout Transferred!',
        message: `Your ₹${current.rewardAmount} referral payout has been processed (Txn ID: ${transactionId || 'IMPS'}).`,
        type: 'success',
        timestamp: new Date().toISOString(),
        isRead: false
      }));
    }

    return updated;
  }

  async getAdminBankDetails(adminId: string, userId: string): Promise<{ bankName: string; accountNumber: string; ifscCode: string }> {
    const docRef = doc(serverDb, 'referral_profiles', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('User bank details not found.');
    const data = snap.data() as ReferralProfile;

    const auditId = `audit-${Date.now()}`;
    await setDoc(doc(serverDb, 'payout_audit_logs', auditId), cleanForFirestore({
      id: auditId,
      adminId,
      action: 'VIEW_BANK_DETAILS',
      targetUserId: userId,
      targetUserName: data.fullName,
      timestamp: new Date().toISOString()
    }));

    return {
      bankName: data.bankName,
      accountNumber: data.accountNumber || data.accountNumberMasked,
      ifscCode: data.ifscCode
    };
  }
}

export const firestoreDb = new FirestoreCentralDatabase();
