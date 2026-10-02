import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Customer, LoanApplication, Banner, AdminSettings, AdminStats } from '../src/types.js';

interface DatabaseSchema {
  customers: Customer[];
  applications: LoanApplication[];
  banners: Banner[];
  settings: AdminSettings;
  otps: Record<string, { otp: string; expiresAt: number; attempts: number }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'central_db.json');

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
    title: 'Instant Personal Loan – Apply Online',
    description: 'Check your eligibility and explore personal loan options through FinCred’s lending partner.',
    buttonText: 'Check Eligibility',
    destinationUrl: 'https://dukaan.werize.com/loan-saving-agent-unnao-FinCred-personal-loan-3LIBPj40asdAPudzvFhPdU',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    bannerId: 'banner-02',
    title: 'All Loan Types – Explore Your Options',
    description: 'Explore Personal Loan, Business Loan, Home Loan, LAP and Education Loan options through FinCred.',
    buttonText: 'Explore Loans',
    destinationUrl: 'https://sdk.ruloans.com/?client_type=b2b_app&loan_type=personal_loan&auth_token=586994%7Cl5C67vJQndNESetPp7pcWqcejaZd4iN3VtJZLPKze6dedf38',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    bannerId: 'banner-03',
    title: 'Instant Personal Loan – Quick & Easy',
    description: 'Explore personal loan options through FinCred and its lending partner.',
    buttonText: 'Check Eligibility',
    destinationUrl: 'https://truebalance.onelink.me/bMoN/dlfim5uk',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    customerId: 'cust-101',
    fullName: 'Rahul Sharma',
    mobileNumber: '9876543210',
    mobileVerified: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    customerId: 'cust-102',
    fullName: 'Priya Verma',
    mobileNumber: '9812345678',
    mobileVerified: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    applicationId: 'FC-APP-88421',
    customerId: 'cust-101',
    fullName: 'Rahul Sharma',
    mobileNumber: '9876543210',
    loanCategory: 'Personal / Business Loan',
    partnerName: 'WeRize Financial Partner',
    destinationUrl: DEFAULT_SETTINGS.personalBusinessLoanUrl,
    status: 'Redirected to Partner',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    panMasked: 'ABCDE****F'
  },
  {
    applicationId: 'FC-APP-92140',
    customerId: 'cust-102',
    fullName: 'Priya Verma',
    mobileNumber: '9812345678',
    loanCategory: 'Instant Loan',
    partnerName: 'TrueBalance Partner',
    destinationUrl: DEFAULT_SETTINGS.instantLoanUrl,
    status: 'Request Submitted',
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    panMasked: 'XYZPQ****K'
  }
];

class CentralDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          customers: parsed.customers || INITIAL_CUSTOMERS,
          applications: parsed.applications || INITIAL_APPLICATIONS,
          banners: parsed.banners || INITIAL_BANNERS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          otps: parsed.otps || {}
        };
      }
    } catch (e) {
      console.error('Failed to parse database file, initializing defaults:', e);
    }

    const initialData: DatabaseSchema = {
      customers: INITIAL_CUSTOMERS,
      applications: INITIAL_APPLICATIONS,
      banners: INITIAL_BANNERS,
      settings: DEFAULT_SETTINGS,
      otps: {}
    };
    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave = this.data) {
    try {
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed writing to central database:', err);
    }
  }

  // OTP Operations
  setOtp(mobile: string, otp: string, durationMs = 5 * 60 * 1000) {
    this.data.otps[mobile] = {
      otp,
      expiresAt: Date.now() + durationMs,
      attempts: 0
    };
    this.saveData();
  }

  verifyOtp(mobile: string, userOtp: string): boolean {
    const record = this.data.otps[mobile];
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      delete this.data.otps[mobile];
      this.saveData();
      return false;
    }
    record.attempts += 1;
    if (record.attempts > 5) {
      delete this.data.otps[mobile];
      this.saveData();
      return false;
    }
    if (record.otp === userOtp.trim()) {
      delete this.data.otps[mobile];
      this.saveData();
      return true;
    }
    this.saveData();
    return false;
  }

  // Customer Operations
  getCustomers(): Customer[] {
    return this.data.customers;
  }

  getCustomerByMobile(mobile: string): Customer | undefined {
    return this.data.customers.find(c => c.mobileNumber === mobile);
  }

  getCustomerByEmail(email: string): Customer | undefined {
    if (!email) return undefined;
    const lower = email.trim().toLowerCase();
    return this.data.customers.find(c => c.email && c.email.trim().toLowerCase() === lower);
  }

  getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find(c => c.customerId === id);
  }

  registerAppCustomer(params: {
    fullName: string;
    mobileNumber: string;
    email?: string;
    passwordHash: string;
    passwordSalt: string;
  }): Customer {
    const cleanMobile = params.mobileNumber.trim();
    const cleanEmail = params.email ? params.email.trim().toLowerCase() : undefined;
    const now = new Date().toISOString();

    const existing = this.getCustomerByMobile(cleanMobile);
    if (existing) {
      existing.fullName = params.fullName.trim();
      if (cleanEmail) existing.email = cleanEmail;
      existing.passwordHash = params.passwordHash;
      existing.passwordSalt = params.passwordSalt;
      existing.mobileVerified = true;
      existing.source = 'mobile_app';
      existing.updatedAt = now;
      this.saveData();
      return existing;
    }

    const newCustomer: Customer = {
      customerId: `cust-${crypto.randomBytes(4).toString('hex')}`,
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

    this.data.customers.unshift(newCustomer);
    this.saveData();
    return newCustomer;
  }

  upsertCustomer(mobile: string, fullName: string, email?: string): Customer {
    const existing = this.getCustomerByMobile(mobile);
    const now = new Date().toISOString();
    if (existing) {
      if (fullName && fullName.trim()) {
        existing.fullName = fullName.trim();
      }
      if (email && email.trim()) {
        existing.email = email.trim().toLowerCase();
      }
      existing.mobileVerified = true;
      existing.updatedAt = now;
      this.saveData();
      return existing;
    }

    const newCustomer: Customer = {
      customerId: `cust-${crypto.randomBytes(4).toString('hex')}`,
      fullName: fullName?.trim() || 'Valued Customer',
      mobileNumber: mobile,
      email: email ? email.trim().toLowerCase() : undefined,
      mobileVerified: true,
      createdAt: now,
      updatedAt: now
    };

    this.data.customers.unshift(newCustomer);
    this.saveData();
    return newCustomer;
  }

  updateCustomerProfile(customerId: string, fullName: string, email?: string): Customer | null {
    const customer = this.getCustomerById(customerId);
    if (!customer) return null;
    customer.fullName = fullName.trim();
    if (email !== undefined) {
      customer.email = email.trim().toLowerCase();
    }
    customer.updatedAt = new Date().toISOString();
    this.saveData();
    return customer;
  }

  deleteCustomer(customerId: string): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer) return false;

    const customerMobile = customer.mobileNumber;

    // Remove customer record completely
    this.data.customers = this.data.customers.filter(c => c.customerId !== customerId);

    // Remove all associated applications submitted by this user
    this.data.applications = this.data.applications.filter(
      app => app.customerId !== customerId && app.mobileNumber !== customerMobile
    );

    // Remove active OTP records for this mobile if any
    if (this.data.otps && this.data.otps[customerMobile]) {
      delete this.data.otps[customerMobile];
    }

    this.saveData();
    return true;
  }

  deleteApplication(applicationId: string): boolean {
    const initialLen = this.data.applications.length;
    this.data.applications = this.data.applications.filter(a => a.applicationId !== applicationId);
    if (this.data.applications.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Application Operations
  getApplications(): LoanApplication[] {
    return this.data.applications;
  }

  getApplicationsByCustomer(customerId?: string, mobileNumber?: string): LoanApplication[] {
    return this.data.applications.filter(app => {
      if (customerId && app.customerId === customerId) return true;
      if (mobileNumber && app.mobileNumber === mobileNumber) return true;
      return false;
    });
  }

  createApplication(params: {
    fullName: string;
    mobileNumber: string;
    loanCategory: LoanApplication['loanCategory'];
    partnerName: string;
    destinationUrl: string;
    customerId?: string;
    email?: string;
    panMasked?: string;
    amountRequested?: number;
    employmentType?: string;
    monthlyIncome?: number;
    city?: string;
    source?: 'web' | 'mobile_app';
    attachedDriveDocs?: { id: string; name: string; url: string; mimeType?: string }[];
  }): LoanApplication {
    const now = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newApp: LoanApplication = {
      applicationId: `FC-APP-${randomSuffix}`,
      customerId: params.customerId,
      fullName: params.fullName.trim(),
      mobileNumber: params.mobileNumber.trim(),
      email: params.email ? params.email.trim().toLowerCase() : undefined,
      loanCategory: params.loanCategory,
      partnerName: params.partnerName,
      destinationUrl: params.destinationUrl,
      status: 'Request Submitted',
      submittedAt: now,
      updatedAt: now,
      panMasked: params.panMasked,
      amountRequested: params.amountRequested,
      employmentType: params.employmentType,
      monthlyIncome: params.monthlyIncome,
      city: params.city,
      source: params.source || 'web',
      attachedDriveDocs: params.attachedDriveDocs
    };

    this.data.applications.unshift(newApp);
    this.saveData();
    return newApp;
  }

  updateApplicationStatus(applicationId: string, status: LoanApplication['status']): LoanApplication | null {
    const app = this.data.applications.find(a => a.applicationId === applicationId);
    if (!app) return null;
    app.status = status;
    app.updatedAt = new Date().toISOString();
    this.saveData();
    return app;
  }

  // Banners Operations
  getBanners(activeOnly = false): Banner[] {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.banners && Array.isArray(parsed.banners)) {
          this.data.banners = parsed.banners;
        }
      }
    } catch {}

    if (!this.data.banners || this.data.banners.length === 0) {
      this.data.banners = [...INITIAL_BANNERS];
      this.saveData();
    }

    let list = [...this.data.banners];
    if (activeOnly) {
      list = list.filter(b => b.isActive);
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  createBanner(bannerData: Omit<Banner, 'bannerId' | 'createdAt'>): Banner {
    const newBanner: Banner = {
      ...bannerData,
      bannerId: `banner-${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    this.data.banners.push(newBanner);
    this.saveData();
    return newBanner;
  }

  updateBanner(bannerId: string, updates: Partial<Banner>): Banner | null {
    const index = this.data.banners.findIndex(b => b.bannerId === bannerId);
    if (index === -1) return null;
    this.data.banners[index] = {
      ...this.data.banners[index],
      ...updates
    };
    this.saveData();
    return this.data.banners[index];
  }

  deleteBanner(bannerId: string): boolean {
    const prevLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter(b => b.bannerId !== bannerId);
    if (this.data.banners.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Settings Operations
  getSettings(): AdminSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<AdminSettings>): AdminSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.settings;
  }

  // Stats
  getAdminStats(): AdminStats {
    const apps = this.data.applications;
    const personal = apps.filter(a => a.loanCategory === 'Personal Loan' || a.loanCategory === 'Personal Loan (PL)' || a.loanCategory === 'Personal / Business Loan').length;
    const instant = apps.filter(a => a.loanCategory === 'Instant Loan').length;
    const allType = apps.filter(a => a.loanCategory === 'All Type Loan').length;

    return {
      totalCustomers: this.data.customers.length,
      totalApplications: apps.length,
      personalLoanRequests: personal,
      businessLoanRequests: Math.floor(personal * 0.4), // proportional breakdown
      instantLoanRequests: instant,
      allTypeLoanRequests: allType,
      recentCustomers: this.data.customers.slice(0, 10),
      recentApplications: apps.slice(0, 15)
    };
  }
}

export const db = new CentralDatabase();
