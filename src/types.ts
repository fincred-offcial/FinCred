export interface ApplicationDocument {
  id: string;
  name: string; // e.g. "PAN Card", "Aadhaar Card", "Bank Statement (3 Months)", "Salary Slip / ITR"
  docType: 'PAN' | 'AADHAAR' | 'BANK_STATEMENT' | 'SALARY_SLIP' | 'BUSINESS_PROOF' | 'OTHER' | string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'RE_UPLOAD_REQUESTED';
  uploadedAt?: string;
  verifiedAt?: string;
  adminRemark?: string;
}

export interface CustomerNotification {
  id: string;
  customerId?: string;
  target?: 'ALL' | string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'status_change' | 'offer' | 'alert';
  timestamp: string;
  isRead?: boolean;
  link?: string;
  actionUrl?: string;
  sentBy?: string;
}

export interface Customer {
  customerId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  dob?: string;
  dateOfBirth?: string;
  panNumber?: string;
  panMasked?: string;
  pincode?: string;
  passwordHash?: string;
  passwordSalt?: string;
  source?: 'web' | 'mobile_app';
  mobileVerified: boolean;
  loanCategory?: LoanCategory | string;
  amountRequested?: number;
  requiredLoanAmount?: number;
  employmentType?: string;
  monthlyIncome?: number;
  city?: string;
  status?: string;
  submissionDateTime?: string;
  createdAt: string;
  updatedAt: string;
  // Device & Location tracking
  deviceSummary?: string;
  deviceType?: 'Mobile' | 'Tablet' | 'Desktop' | 'mobile' | 'desktop' | 'tablet' | string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
  timezone?: string;
  lastActiveAt?: string;
  lastAction?: string;
  devicesUsed?: string[];
  locationsUsed?: string[];
  applicationCount?: number;
}

export type LoanCategory =
  | 'Personal Loan'
  | 'Personal Loan (PL)'
  | 'Personal / Business Loan'
  | 'Business Loan'
  | 'Instant Loan'
  | 'All Type Loan'
  | 'Other'
  | string;

export type ApplicationStatus =
  | 'NEW'
  | 'FORM SUBMITTED'
  | 'APPLICATION STARTED'
  | 'DETAILS SUBMITTED'
  | 'DOCUMENTS SUBMITTED'
  | 'VERIFICATION'
  | 'UNDER REVIEW'
  | 'DECISION'
  | 'PARTNER SELECTED'
  | 'OPTION SELECTED'
  | 'REDIRECTED'
  | 'IN PROGRESS'
  | 'APPLICATION COMPLETED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CLOSED'
  | 'ALTERNATIVE OPTION EXPLORED'
  // Legacy compatibility
  | 'Request Submitted'
  | 'Redirected to Partner'
  | 'Under External Review'
  | 'Status Update Pending'
  | 'Contact Pending';

export type InstitutionType = 'Bank' | 'NBFC' | 'Financial Institution';

export interface PartnerLender {
  lenderId: string;
  partnerPlatformId: string; // 'werize', 'ruloans', 'choice_connect', 'true_balance'
  lenderName: string;
  lenderType: InstitutionType;
  loanCategory: string; // 'Personal Loan', 'Business Loan', 'All'
  productType?: string; // e.g. 'Instant Personal Loan', 'Working Capital'
  isActive: boolean;
  sourceVerification: string; // Reference/Source, e.g. 'Official RBI NBFC Registry'
  lastVerifiedDate: string; // e.g. '2026-09-20'
  displayOrder?: number;
}

export interface PartnerPlatform {
  platformId: string;
  name: string; // WeRize, Ruloans, Choice Connect, True Balance
  logoUrl?: string;
  description: string;
  partnerNetworkSummary: string; // '275+ Partner Banks & NBFCs*'
  verifiedPartnerCount?: string | number;
  isCompleteLenderListAvailable: boolean;
  lenderNetworkDisclaimer?: string;
  personalLoanUrl: string;
  businessLoanUrl?: string;
  supportedCategories: string[]; // ['Personal Loan', 'Business Loan']
  loanAmountRange?: string;
  tenureRange?: string;
  interestRate?: string;
  badge?: string;
  priority?: number;
  eligibility?: string;
  importantConditions?: string;
  productType?: string;
  displayOrder: number;
  isActive: boolean;
  lenders: PartnerLender[];
  lastVerifiedDate: string;
  sourceReference: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanOption {
  optionId: string;
  name: string;
  category: string; // Personal Loan, Business Loan, Instant Loan, Other
  partnerName: string;
  applicationUrl: string;
  loanAmountRange?: string;
  tenureRange?: string;
  interestRate?: string;
  description: string;
  eligibilityInfo: string[];
  requiredDocuments: string[];
  processingInfo?: string;
  importantTerms?: string;
  badge?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplication {
  applicationId: string; // e.g. FC-20260924-00001
  leadId?: string; // Synonym for applicationId
  customerId?: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  dob?: string;
  dateOfBirth?: string;
  panNumber?: string;
  panMasked?: string;
  pincode?: string;
  loanCategory: LoanCategory | string;
  loanType?: string;
  partnerName: string;
  partnerPlatformId?: string;
  partnerSelected?: boolean;
  selectedOptionId?: string;
  selectedOptionName?: string;
  destinationUrl: string;
  redirectUrl?: string;
  externalApplicationStatus?: string;
  status: ApplicationStatus;
  isDuplicate?: boolean;
  duplicateCount?: number;
  lastActivityAt?: string;
  submittedAt: string;
  updatedAt: string;
  amountRequested?: number;
  employmentType?: string;
  monthlyIncome?: number;
  existingLoan?: string;
  hasExistingLoans?: boolean | string;
  // Business Loan specific fields
  applicantName?: string;
  businessType?: string;
  businessVintage?: string;
  turnover?: string | number;
  existingBusinessLoan?: string;
  // Partner & Lender selection & click tracking
  selectedLenderId?: string;
  selectedLenderName?: string;
  applyNowClicked?: boolean;
  applyNowClickedAt?: string;
  alternativeOptionsViewed?: string[];
  alternativePartnerSelected?: string;
  adminUpdated?: boolean;
  adminNotes?: string;
  city?: string;
  source?: 'web' | 'mobile_app' | 'mobile_web' | string;
  documents?: ApplicationDocument[];
  attachedDriveDocs?: { id: string; name: string; url: string; mimeType?: string }[];
  // Device & Location tracking
  deviceSummary?: string;
  deviceType?: 'Mobile' | 'Tablet' | 'Desktop' | 'mobile' | 'desktop' | 'tablet' | string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
  timezone?: string;
}

export interface ActivityLog {
  id: string;
  customerId?: string;
  customerName?: string;
  userName?: string;
  mobileNumber?: string;
  userMobile?: string;
  action: string;
  activityType?: string;
  description?: string;
  details?: string;
  category?: 'application' | 'auth' | 'navigation' | 'partner_click' | 'profile' | 'system';
  deviceType?: 'Mobile' | 'Tablet' | 'Desktop' | 'mobile' | 'desktop' | 'tablet' | string;
  deviceSummary?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  path?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  category: LoanCategory | string;
  maxAmount: string;
  minAmount: string;
  interestRate: string;
  tenure: string;
  features: string[];
  partnerName: string;
  destinationUrl: string;
  badge: string;
  color: string;
}

export interface Banner {
  bannerId: string;
  imageUrl: string;
  title: string;
  description?: string;
  buttonText: string;
  destinationUrl: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface AdminSettings {
  choiceConnectPersonalLoanUrl?: string;
  personalBusinessLoanUrl: string;
  instantLoanUrl: string;
  allTypeLoanUrl: string;
  safeUpiUrl: string;
  updatedAt: string;
}

export interface AdminStats {
  totalCustomers: number;
  totalApplications: number;
  todayLeads?: number;
  personalLoanRequests: number;
  businessLoanRequests: number;
  instantLoanRequests: number;
  allTypeLoanRequests: number;
  newLeads?: number;
  startedLeads?: number;
  completedLeads?: number;
  underReviewLeads?: number;
  approvedLeads?: number;
  rejectedLeads?: number;
  duplicateLeads?: number;
  recentCustomers: Customer[];
  recentApplications: LoanApplication[];
  totalActivities?: number;
  deviceBreakdown?: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  locationsList?: {
    location: string;
    count: number;
  }[];
  topLocations?: {
    location: string;
    count: number;
  }[];
}

export interface CurrentUserSession {
  customer: Customer | null;
  token: string | null;
}

export interface CibilOrder {
  id: string;
  orderId: string;
  referenceNumber: string;
  customerId?: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  panNumber?: string;
  currentScoreEstimate?: string;
  utrNumber: string;
  amount: number; // 299
  status: 'pending_verification' | 'confirmed' | 'rejected';
  loanLink?: string; // 'https://branch.co/download/shubh12360'
  adminNotes?: string;
  submittedAt: string;
  confirmedAt?: string;
}

// ==========================================
// EARN & REFER TYPES
// ==========================================

export type AppRewardStatus =
  | 'NOT STARTED'
  | 'DOWNLOAD LINK OPENED'
  | '₹1 PAYMENT PENDING'
  | '₹1 PAYMENT RECEIVED'
  | 'PAYMENT VERIFIED'
  | '₹100 REWARD PENDING'
  | '₹100 REWARD SENT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'ON HOLD';

export interface AppReward {
  id: string;
  userId: string;
  userName: string;
  mobileNumber: string;
  status: AppRewardStatus;
  naviLinkClicked: boolean;
  paymentReference?: string; // ₹1 UPI Txn/UTR ID
  rewardAmount: number; // 100
  totalReturn: number; // 101
  claimedAt: string;
  verifiedAt?: string;
  paidAt?: string;
  adminNotes?: string;
  isFraudFlagged?: boolean;
}

export interface ReferralProfile {
  userId: string;
  fullName: string;
  mobileNumber: string;
  referralCode: string;
  referralLink: string;
  bankName: string;
  accountNumberMasked: string; // XXXXXX1234
  accountNumber?: string; // only returned to authorized caller/admin
  ifscCode: string;
  isActivated: boolean;
  totalEarned: number;
  pendingRewards: number;
  paidRewards: number;
  parentReferrerCode?: string;
  activatedAt: string;
}

export type LoanReferralStatus =
  | 'REFERRED'
  | 'APPLICATION RECEIVED'
  | 'UNDER PROCESS'
  | 'APPROVED'
  | 'DISBURSED'
  | 'REWARD ELIGIBLE'
  | 'PAYOUT PENDING'
  | 'PAID'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ON HOLD'
  | 'FRAUD CHECK'
  | 'NOT ELIGIBLE';

export interface LoanReferral {
  id: string;
  referrerUserId: string;
  referrerName: string;
  referralCode: string;
  referredCustomerId: string;
  referredCustomerName: string;
  referredCustomerMobile: string;
  applicationId: string;
  loanType: string;
  provider: string;
  applicationDate: string;
  applicationStatus: string;
  approvalDate?: string;
  disbursalStatus: 'PENDING' | 'DISBURSED' | 'NOT_DISBURSED';
  disbursalDate?: string;
  disbursalAmount?: number;
  rewardAmount: number; // ₹200 for Tier 1, ₹150 for Tier 2
  rewardTier: 'PRIMARY' | 'SECONDARY';
  rewardEligibility: boolean;
  payoutDeadline?: string; // Disbursal Date + 24 hours
  payoutStatus: LoanReferralStatus;
  payoutReference?: string;
  payoutDate?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  payoutId: string;
  userId: string;
  userName: string;
  mobileNumber: string;
  rewardType: 'APP_REWARD' | 'LOAN_REFERRAL';
  rewardAmount: number;
  bankName: string;
  accountNumberMasked: string;
  accountNumber?: string;
  ifscCode: string;
  reason: string;
  eligibilityDate: string;
  deadline: string; // 24-hr deadline
  status: 'PAYOUT PENDING' | 'APPROVED' | 'PAID' | 'ON HOLD' | 'REJECTED';
  transactionId?: string;
  adminNotes?: string;
  paidAt?: string;
  createdAt: string;
}

export interface EarnSettings {
  appRewardAmount: number; // 100
  userInitialPayment: number; // 1
  totalReturnedAfterQualification: number; // 101
  primaryLoanReferralReward: number; // 200
  secondaryReferralReward: number; // 150
  payoutWindowHours: number; // 24
  isFirstTimeRewardEnabled: boolean;
  isLoanReferralEnabled: boolean;
  isFraudReviewEnabled: boolean;
  isAdminPayoutApprovalRequired: boolean;
  updatedAt: string;
}

export interface PayoutAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId: string;
  targetUserName?: string;
  timestamp: string;
  notes?: string;
}


