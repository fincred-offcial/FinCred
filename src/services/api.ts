import { Banner, Customer, LoanApplication, AdminSettings, AdminStats, LoanCategory, ApplicationStatus, LoanProduct, ActivityLog, LoanOption, PartnerPlatform, PartnerLender, ApplicationDocument, CustomerNotification, CibilOrder, ReferralProfile, AppReward, LoanReferral, Payout, EarnSettings } from '../types.js';
import { safeFetch, apiRequest, api, ApiError } from './apiClient.js';

// Central API safety wrapper: ensures all calls resolve base URL and never crash on non-JSON HTML responses
const fetch = safeFetch;
export { safeFetch, apiRequest, api, ApiError };

export const DEFAULT_BANNERS: Banner[] = [
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

export const DEFAULT_SETTINGS: AdminSettings = {
  choiceConnectPersonalLoanUrl: 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
  personalBusinessLoanUrl: 'https://www.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
  instantLoanUrl: 'https://truebalance.onelink.me/bMoN/dlfim5uk',
  allTypeLoanUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
  safeUpiUrl: 'https://r.navi.com/t3HqoB',
  updatedAt: new Date().toISOString()
};

export async function fetchSettings(): Promise<AdminSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    console.warn('Network issue fetching settings, using default settings fallback:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function fetchActiveBanners(): Promise<Banner[]> {
  try {
    const res = await fetch('/api/banners');
    if (!res.ok) throw new Error('Failed to fetch banners');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return DEFAULT_BANNERS;
  } catch (err) {
    console.warn('Network issue loading dynamic banners, using default banners fallback:', err);
    return DEFAULT_BANNERS;
  }
}

export async function checkMobileRegistration(mobileNumber: string): Promise<{
  success: boolean;
  isRegistered: boolean;
  customerName: string | null;
  customerId: string | null;
}> {
  const res = await fetch('/api/auth/check-mobile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to check mobile number');
  return data;
}

export async function customerContinue(mobileNumber: string): Promise<{
  success: boolean;
  data: {
    mobile: string;
    isRegistered?: boolean;
    customerName?: string | null;
    customerId?: string;
    testOtp?: string;
    otpToken?: string;
    message?: string;
    expiresInSeconds?: number;
  };
  mobile: string;
  isRegistered?: boolean;
  customerName?: string | null;
  customerId?: string;
  testOtp?: string;
  otpToken?: string;
  message?: string;
}> {
  const clean = mobileNumber.trim().replace(/\D/g, '').slice(-10);
  const res = await fetch('/api/customer/continue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: clean, mobileNumber: clean })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    const errorMsg = data.error?.message || data.error || 'Unable to continue';
    throw new Error(errorMsg);
  }
  const token = data.otpToken || data.data?.otpToken;
  if (token) {
    try {
      sessionStorage.setItem('fc_latest_otp_token', token);
    } catch {}
  }
  return data;
}

export async function sendOtp(mobileNumber: string): Promise<{
  success: boolean;
  message: string;
  testOtp?: string;
  otpToken?: string;
  expiresInSeconds?: number;
  isRegistered?: boolean;
  customerName?: string | null;
}> {
  const clean = mobileNumber.trim().replace(/\D/g, '').slice(-10);
  const res = await fetch('/api/customer/continue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: clean, mobileNumber: clean })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    const msg = data.error?.message || data.error || 'Failed to send OTP';
    throw new Error(msg);
  }
  const payload = data.data || data;
  const token = payload.otpToken || data.otpToken;
  if (token) {
    try {
      sessionStorage.setItem('fc_latest_otp_token', token);
    } catch {}
  }
  return {
    success: true,
    message: payload.message || data.message || `Verification code sent to +91 ${clean}`,
    testOtp: payload.testOtp || data.testOtp || '123456',
    otpToken: token,
    expiresInSeconds: payload.expiresInSeconds || data.expiresInSeconds || 300,
    isRegistered: payload.isRegistered !== undefined ? payload.isRegistered : data.isRegistered,
    customerName: payload.customerName !== undefined ? payload.customerName : data.customerName
  };
}

export async function fetchCustomerProfile(customerIdOrMobile?: string, token?: string): Promise<Customer> {
  let url = '/api/customer/profile';
  if (customerIdOrMobile) {
    url += customerIdOrMobile.length === 10 && /^[6-9]\d{9}$/.test(customerIdOrMobile)
      ? `?mobile=${customerIdOrMobile}`
      : `?customerId=${customerIdOrMobile}`;
  }
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || data.error || 'Failed to fetch customer profile');
  }
  return data.data || data.customer || data;
}

export async function verifyOtp(mobileNumber: string, otp: string, fullName?: string, otpToken?: string): Promise<{ success: boolean; customer: Customer; token: string; data?: any }> {
  const controller = new AbortController();
  // Resilient 25s timeout for serverless cold starts
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const activeOtpToken = otpToken || (() => {
    try {
      return sessionStorage.getItem('fc_latest_otp_token') || undefined;
    } catch {
      return undefined;
    }
  })();

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeOtpToken ? { 'x-otp-token': activeOtpToken } : {})
      },
      body: JSON.stringify({ mobileNumber, otp, fullName, otpToken: activeOtpToken }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.success === false) {
      let errorMsg = 'Invalid or expired OTP code. Please request a new code.';
      if (data && typeof data === 'object') {
        if (typeof data.error === 'string' && data.error.trim()) {
          errorMsg = data.error;
        } else if (data.error && typeof data.error === 'object' && typeof data.error.message === 'string') {
          errorMsg = data.error.message;
        } else if (typeof data.message === 'string' && data.message.trim()) {
          errorMsg = data.message;
        }
      }
      throw new Error(errorMsg);
    }

    const token = data.token || data.data?.token;
    const customer = data.customer || data.data?.customer;

    if (!token || !customer) {
      throw new Error('Authentication succeeded but session token is missing. Please retry.');
    }

    return {
      success: true,
      token,
      customer,
      data: data.data || data
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Verification request timed out. Please check your internet connection and try again.');
    }
    throw err;
  }
}

export async function updateCustomerProfile(
  customerId: string,
  profile: string | Partial<Customer>
): Promise<{ success: boolean; customer: Customer }> {
  const payload = typeof profile === 'string' ? { customerId, fullName: profile } : { customerId, ...profile };
  const res = await fetch('/api/customer/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

export async function submitLoanApplication(params: {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  applicantName?: string;
  mobileNumber: string;
  email?: string;
  dob?: string;
  panNumber?: string;
  panOrVoterId?: string;
  pincode?: string;
  loanCategory: LoanCategory | string;
  amountRequested?: number;
  employmentType?: string;
  monthlyIncome?: number;
  existingLoan?: string;
  businessType?: string;
  businessVintage?: string;
  turnover?: string | number;
  existingBusinessLoan?: string;
  selectedOptionId?: string;
  selectedOptionName?: string;
  partnerName?: string;
  destinationUrl?: string;
  hasConsented?: boolean;
  customerId?: string;
  city?: string;
  source?: 'web' | 'mobile_app' | string;
  referralCode?: string;
  attachedDriveDocs?: { id: string; name: string; url: string; mimeType?: string }[];
}): Promise<{
  success: boolean;
  application: LoanApplication;
  applicationId: string;
  leadId: string;
  destinationUrl: string;
  isDuplicate?: boolean;
  message?: string;
}> {
  const activeReferralCode =
    params.referralCode ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('fc_referrer_code') || sessionStorage.getItem('fc_referrer_code') || undefined
      : undefined);

  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      referralCode: activeReferralCode
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Your application could not be saved. Please try again.');
  return data;
}

export async function trackApplicationStatus(applicationId: string, mobileNumber: string): Promise<any> {
  const res = await fetch('/api/applications/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, mobileNumber })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to track application');
  return data.application;
}

export async function fetchLoanOptions(category?: string): Promise<LoanOption[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  const res = await fetch(`/api/loan-options?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch loan options');
  return res.json();
}

export async function saveLoanOptionAdmin(token: string, option: Partial<LoanOption>): Promise<LoanOption> {
  const res = await fetch('/api/admin/loan-options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(option)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save loan option');
  return data.option;
}

export async function deleteLoanOptionAdmin(token: string, optionId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/loan-options/${optionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete loan option');
  return data.success;
}

// Partner Platforms & Verified Lenders
export async function fetchPartnerPlatforms(category?: string): Promise<PartnerPlatform[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  const res = await fetch(`/api/partner-platforms?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch partner platforms');
  return res.json();
}

export async function savePartnerPlatformAdmin(token: string, platform: Partial<PartnerPlatform>): Promise<PartnerPlatform> {
  const res = await fetch('/api/admin/partner-platforms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(platform)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save partner platform');
  return data.platform;
}

export async function deletePartnerPlatformAdmin(token: string, platformId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/partner-platforms/${platformId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete partner platform');
  return data.success;
}

export async function selectPartnerAndStartApplication(
  applicationId: string,
  params: {
    partnerPlatformId: string;
    partnerName: string;
    loanCategory: string;
    referralUrl?: string;
    lenderName?: string;
    lenderId?: string;
  }
): Promise<{
  success: boolean;
  applicationId: string;
  partnerName: string;
  referralUrl: string;
  application: LoanApplication;
}> {
  const res = await fetch(`/api/applications/${applicationId}/select-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to record partner application start. Please try again.');
  return data;
}

export async function fetchCustomerApplications(customerId?: string, mobile?: string): Promise<LoanApplication[]> {
  const params = new URLSearchParams();
  if (customerId) params.append('customerId', customerId);
  if (mobile) params.append('mobile', mobile);

  const res = await fetch(`/api/applications/my?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

// Admin API
export async function adminLogin(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    const errorMsg = data.error?.message || data.error || 'Invalid administrator credentials';
    throw new Error(errorMsg);
  }
  return {
    token: data.token || data.data?.token,
    username: data.username || data.data?.username
  };
}

export async function fetchAdminSession(token: string): Promise<{ authenticated: boolean; username: string }> {
  const res = await fetch('/api/admin/session', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error('Invalid or expired admin session');
  return data.data || data;
}

export async function fetchAdminData(token: string): Promise<any> {
  const res = await fetch('/api/admin/data', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error('Failed to load admin data');
  return data.data || data;
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load admin stats');
  return res.json();
}

export async function fetchAdminCustomers(token: string): Promise<(Customer & { applicationCount: number })[]> {
  const res = await fetch('/api/admin/customers', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load customers');
  return res.json();
}

export async function createCustomerAdmin(
  token: string,
  customerData: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    loanCategory?: string;
    amountRequested?: number;
    status?: string;
  }
): Promise<Customer> {
  const res = await fetch('/api/admin/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(customerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create customer');
  return data.customer;
}

export async function updateCustomerAdmin(
  token: string,
  customerId: string,
  updates: Partial<Customer>
): Promise<Customer> {
  const res = await fetch(`/api/admin/customers/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update customer');
  return data.customer;
}

export async function deleteCustomerAdmin(token: string, customerId: string): Promise<void> {
  const res = await fetch(`/api/admin/customers/${customerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to remove user');
  }
}

export async function fetchAdminApplications(token: string): Promise<LoanApplication[]> {
  const res = await fetch('/api/admin/applications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load loan applications');
  return res.json();
}

export async function deleteApplicationAdmin(token: string, applicationId: string): Promise<void> {
  const res = await fetch(`/api/admin/applications/${applicationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete application');
  }
}

export async function updateAdminApplicationStatus(
  token: string,
  applicationId: string,
  status: ApplicationStatus
): Promise<LoanApplication> {
  const res = await fetch(`/api/admin/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update status');
  return data.application;
}

export async function fetchAllBannersAdmin(token: string): Promise<Banner[]> {
  const res = await fetch('/api/admin/banners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
}

export async function createBannerAdmin(token: string, banner: Omit<Banner, 'bannerId' | 'createdAt'>): Promise<Banner> {
  const res = await fetch('/api/admin/banners', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(banner)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create banner');
  return data.banner;
}

export async function updateBannerAdmin(token: string, bannerId: string, updates: Partial<Banner>): Promise<Banner> {
  const res = await fetch(`/api/admin/banners/${bannerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update banner');
  return data.banner;
}

export async function deleteBannerAdmin(token: string, bannerId: string): Promise<void> {
  const res = await fetch(`/api/admin/banners/${bannerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete banner');
}

export async function uploadBannerImageAdmin(token: string, imageBase64: string): Promise<string> {
  const res = await fetch('/api/admin/upload-banner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ imageBase64 })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload image');
  return data.url;
}

export async function updateSettingsAdmin(token: string, settings: Partial<AdminSettings>): Promise<AdminSettings> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data.settings;
}

// ====================================================
// STANDALONE FINCRED MOBILE APP API SERVICES
// ====================================================

export async function appRegister(params: {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password: string;
  confirmPassword?: string;
}): Promise<{ success: boolean; message: string; customer: Customer; token: string }> {
  const res = await fetch('/api/app/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function appLogin(params: {
  identifier: string;
  password: string;
}): Promise<{ success: boolean; message: string; customer: Customer; token: string }> {
  const res = await fetch('/api/app/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function appGetMe(token: string): Promise<{ success: boolean; customer: Customer }> {
  const res = await fetch('/api/app/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.error || 'Failed to authenticate session');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function appLogout(token: string): Promise<void> {
  try {
    await fetch('/api/app/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    // Ignore network error on logout
  }
}

export async function appForgotPassword(params: {
  mobileNumber: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/app/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data;
}

export async function appUpdateProfile(token: string, params: {
  fullName: string;
  email?: string;
}): Promise<{ success: boolean; message: string; customer: Customer }> {
  const res = await fetch('/api/app/customer/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

export async function appFetchLoanProducts(): Promise<{
  success: boolean;
  products: LoanProduct[];
  updatedAt: string;
}> {
  const res = await fetch('/api/app/loans/products');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load loan products');
  return data;
}

export async function appSubmitLoan(params: {
  fullName: string;
  mobileNumber: string;
  email?: string;
  panNumber?: string;
  loanCategory: LoanCategory;
  amountRequested?: number;
  employmentType?: string;
  monthlyIncome?: number;
  city?: string;
  customerId?: string;
  attachedDriveDocs?: { id: string; name: string; url: string; mimeType?: string }[];
}): Promise<{ success: boolean; message: string; application: LoanApplication; destinationUrl: string }> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, source: 'mobile_app' })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Loan application submission failed');
  return data;
}

export async function appFetchMyApplications(customerId?: string, mobile?: string): Promise<LoanApplication[]> {
  try {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (mobile) params.append('mobile', mobile);

    const res = await fetch(`/api/applications/my?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : (data.applications || []);
  } catch (err) {
    console.warn('Notice loading applications, using empty list fallback:', err);
    return [];
  }
}

// ==========================================
// ADMIN ACTIVITY LOGS API
// ==========================================
export async function fetchAdminActivities(token: string, limit = 150): Promise<ActivityLog[]> {
  const res = await fetch(`/api/admin/activities?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return res.json();
}

export async function clearAdminActivities(token: string): Promise<boolean> {
  const res = await fetch('/api/admin/activities', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to clear activity logs');
  const data = await res.json();
  return !!data.success;
}

export function logUserActivity(data: {
  activityType: string;
  description: string;
  customerId?: string;
  userMobile?: string;
  userName?: string;
  metadata?: Record<string, any>;
}): void {
  try {
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {
      // Fire and forget
    });
  } catch {
    // Ignore error in non-critical logging
  }
}

// Full Customer Registration (New Customer Flow)
export async function registerCustomer(params: {
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
}): Promise<{
  success: boolean;
  message: string;
  customer: Customer;
  application: LoanApplication;
  token: string;
}> {
  const res = await fetch('/api/customer/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to complete registration');
  return data;
}

// Secure Document Upload
export async function uploadApplicationDocument(params: {
  applicationId: string;
  docType: string;
  name: string;
  fileBase64?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}): Promise<{
  success: boolean;
  message: string;
  document: ApplicationDocument;
  application: LoanApplication;
}> {
  const res = await fetch('/api/customer/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload document');
  return data;
}

// Admin Update Document Verification
export async function updateAdminDocumentStatus(
  token: string,
  applicationId: string,
  docId: string,
  status: 'VERIFIED' | 'RE_UPLOAD_REQUESTED' | 'REJECTED' | 'UPLOADED' | 'PENDING',
  adminRemark?: string
): Promise<{
  success: boolean;
  message: string;
  document: ApplicationDocument;
  application: LoanApplication;
}> {
  const res = await fetch(`/api/admin/applications/${applicationId}/documents/${docId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status, adminRemark })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update document verification status');
  return data;
}

// Fetch Customer Notifications
export async function fetchCustomerNotifications(customerId: string, mobile?: string): Promise<CustomerNotification[]> {
  const params = new URLSearchParams();
  if (customerId) params.append('customerId', customerId);
  if (mobile) params.append('mobile', mobile);
  const res = await fetch(`/api/customer/notifications?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications || [];
}

// Admin: Send Broadcast / Push Notification
export async function sendAdminNotification(
  token: string,
  payload: {
    title: string;
    message: string;
    type?: string;
    target?: string;
    actionUrl?: string;
  }
): Promise<{ success: boolean; notification: CustomerNotification; message: string }> {
  const res = await fetch('/api/admin/notifications/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send broadcast notification');
  return data;
}

// Admin: Fetch all broadcast notifications
export async function fetchAdminNotifications(token: string): Promise<CustomerNotification[]> {
  const res = await fetch('/api/admin/notifications', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications || [];
}

// Admin: Delete a broadcast notification
export async function deleteAdminNotification(token: string, id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/notifications/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.ok;
}

// ==============================================================
// CIBIL SCORE IMPROVEMENT API CLIENT (₹299 + Branch Link)
// ==============================================================

export async function submitCibilOrder(payload: {
  fullName: string;
  mobileNumber: string;
  utrNumber: string;
  customerId?: string;
  email?: string;
  panNumber?: string;
  currentScoreEstimate?: string;
}): Promise<{ success: boolean; order: CibilOrder }> {
  const res = await fetch('/api/cibil/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit CIBIL order');
  return data;
}

export async function trackCibilOrder(queryStr: string): Promise<CibilOrder> {
  const res = await fetch(`/api/cibil/track?query=${encodeURIComponent(queryStr.trim())}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order not found');
  return data.order;
}

export async function fetchAdminCibilOrders(token: string): Promise<CibilOrder[]> {
  const res = await fetch('/api/admin/cibil/orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}

export async function confirmAdminCibilOrder(
  token: string,
  orderId: string,
  adminNotes?: string
): Promise<{ success: boolean; order: CibilOrder }> {
  const res = await fetch(`/api/admin/cibil/orders/${orderId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ adminNotes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to confirm order');
  return data;
}

export async function rejectAdminCibilOrder(
  token: string,
  orderId: string,
  reason?: string
): Promise<{ success: boolean; order: CibilOrder }> {
  const res = await fetch(`/api/admin/cibil/orders/${orderId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reject order');
  return data;
}

// ==============================================================
// EARN & REFER CLIENT API
// ==============================================================

export async function fetchEarnSettings(): Promise<EarnSettings> {
  const res = await fetch('/api/earn/settings');
  const data = await res.json();
  return data.settings;
}

export async function fetchReferralProfile(userId: string): Promise<ReferralProfile | null> {
  const res = await fetch(`/api/earn/profile?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  return data.profile || null;
}

export async function activateReferralProfile(payload: {
  userId: string;
  fullName: string;
  mobileNumber: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  parentReferrerCode?: string;
}): Promise<ReferralProfile> {
  const res = await fetch('/api/earn/activate-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to activate referral profile');
  return data.profile;
}

export async function checkAppReward(userId: string, mobileNumber: string): Promise<{ eligible: boolean; message?: string; reward?: AppReward }> {
  const res = await fetch(`/api/earn/app-reward?userId=${encodeURIComponent(userId)}&mobileNumber=${encodeURIComponent(mobileNumber)}`);
  const data = await res.json();
  return data;
}

export async function recordNaviClick(payload: { userId: string; userName: string; mobileNumber: string }): Promise<AppReward> {
  const res = await fetch('/api/earn/app-reward/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data.reward;
}

export async function submitAppRewardPayment(userId: string, paymentReference: string): Promise<AppReward> {
  const res = await fetch('/api/earn/app-reward/submit-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, paymentReference })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit payment reference');
  return data.reward;
}

export async function fetchMyReferrals(userId: string): Promise<LoanReferral[]> {
  const res = await fetch(`/api/earn/my-referrals?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  return data.referrals || [];
}

// Admin: Earn & Refer APIs
export async function fetchAdminEarnSettings(token: string): Promise<EarnSettings> {
  const res = await fetch('/api/admin/earn/settings', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.settings;
}

export async function updateAdminEarnSettings(token: string, settings: Partial<EarnSettings>): Promise<EarnSettings> {
  const res = await fetch('/api/admin/earn/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  return data.settings;
}

export async function fetchAdminAppRewards(token: string): Promise<AppReward[]> {
  const res = await fetch('/api/admin/earn/app-rewards', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.rewards || [];
}

export async function actionAdminAppReward(
  token: string,
  userId: string,
  action: 'VERIFY_1' | 'APPROVE_REWARD' | 'MARK_PAID' | 'REJECT' | 'HOLD',
  notes?: string
): Promise<AppReward> {
  const res = await fetch(`/api/admin/earn/app-rewards/${userId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update app reward');
  return data.reward;
}

export async function fetchAdminLoanReferrals(token: string): Promise<LoanReferral[]> {
  const res = await fetch('/api/admin/earn/referrals', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.referrals || [];
}

export async function fetchAdminPayouts(token: string): Promise<Payout[]> {
  const res = await fetch('/api/admin/earn/payouts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.payouts || [];
}

export async function actionAdminPayout(
  token: string,
  payoutId: string,
  action: 'APPROVE' | 'MARK_PAID' | 'HOLD' | 'REJECT',
  transactionId?: string,
  notes?: string
): Promise<Payout> {
  const res = await fetch(`/api/admin/earn/payouts/${payoutId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action, transactionId, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update payout');
  return data.payout;
}

export async function fetchAdminUserBankDetails(
  token: string,
  userId: string
): Promise<{ bankName: string; accountNumber: string; ifscCode: string }> {
  const res = await fetch(`/api/admin/earn/bank-details/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to retrieve bank details');
  return data.bankDetails;
}


