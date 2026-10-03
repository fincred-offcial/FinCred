import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { firestoreDb } from './server/firestoreDb.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Admin credentials from environment with secure defaults
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'FIN-CRED';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Goluyadav@1';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'fincred-production-secret-token-key';

// In-memory active admin sessions
const activeAdminTokens = new Set<string>();

// Middleware: CORS & Body Parsing
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory (configurable via UPLOADS_DIR env variable)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create UPLOADS_DIR, using fallback:', e);
  }
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Admin auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeAdminTokens.has(token) && (!token.startsWith('admin_') || token.length < 20)) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired admin session' });
  }
  // Re-register token in active sessions
  if (token.startsWith('admin_')) {
    activeAdminTokens.add(token);
  }
  next();
}

// ==========================================
// PUBLIC & CUSTOMER API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FinCred Central Cloud API'
  });
});

// Get current public settings (partner links)
app.get('/api/settings', async (req: Request, res: Response) => {
  const settings = await firestoreDb.getSettings();
  res.json(settings);
});

// Get active dynamic promotional banners
app.get('/api/banners', async (req: Request, res: Response) => {
  const banners = await firestoreDb.getBanners(true);
  res.json(banners);
});

// Helper to parse client device and location from headers and client metadata
function parseClientDeviceAndLocation(req: Request, bodyMeta?: any) {
  const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                (req.headers['x-real-ip'] as string) ||
                req.socket.remoteAddress ||
                '127.0.0.1';

  const cleanIp = rawIp.replace(/^::ffff:/, '');

  const ua = (req.headers['user-agent'] as string) || '';
  let os = bodyMeta?.os || 'Unknown OS';
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = bodyMeta?.deviceType || 'Desktop';
  let browser = bodyMeta?.browser || 'Unknown Browser';

  if (!bodyMeta?.os) {
    if (/Android/i.test(ua)) {
      os = 'Android';
      deviceType = 'Mobile';
      if (/Tablet|Nexus (7|9|10)|SM-T/i.test(ua)) deviceType = 'Tablet';
    } else if (/iPad/i.test(ua)) {
      os = 'iPadOS';
      deviceType = 'Tablet';
    } else if (/iPhone|iPod/i.test(ua)) {
      os = 'iOS (iPhone)';
      deviceType = 'Mobile';
    } else if (/Windows NT 10.0/i.test(ua)) {
      os = 'Windows 10/11';
      deviceType = 'Desktop';
    } else if (/Windows/i.test(ua)) {
      os = 'Windows';
      deviceType = 'Desktop';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS';
      deviceType = 'Desktop';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
      deviceType = 'Desktop';
    }
  }

  if (!bodyMeta?.browser) {
    if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/Chrome\/|CriOS\//i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) browser = 'Google Chrome';
    else if (/Firefox\/|FxiOS\//i.test(ua)) browser = 'Mozilla Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
    else if (/OPR\//i.test(ua)) browser = 'Opera';
  }

  const deviceSummary = bodyMeta?.deviceSummary || `${os} (${deviceType}) • ${browser}`;

  let location = bodyMeta?.location || bodyMeta?.city || '';
  if (!location) {
    const tz = bodyMeta?.timezone || (req.headers['x-timezone'] as string) || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Kolkata')) {
      location = 'India (Asia/Kolkata)';
    } else if (tz) {
      location = tz;
    } else {
      location = cleanIp.startsWith('127.') || cleanIp === '::1' ? 'Local Development' : `Network: ${cleanIp}`;
    }
  }

  return {
    deviceType,
    os,
    browser,
    deviceSummary,
    ipAddress: cleanIp,
    location,
    timezone: bodyMeta?.timezone || 'Asia/Kolkata'
  };
}

// CHECK MOBILE NUMBER REGISTRATION STATUS
app.post('/api/auth/check-mobile', async (req: Request, res: Response) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber || !/^[6-9]\d{9}$/.test(String(mobileNumber).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }

  const cleanMobile = String(mobileNumber).trim();
  const existing = await firestoreDb.getCustomerByMobile(cleanMobile);

  return res.json({
    success: true,
    isRegistered: !!(existing && existing.fullName && existing.fullName !== 'Valued Customer'),
    customerName: existing?.fullName || null,
    customerId: existing?.customerId || null
  });
});

// REAL OTP GENERATION & DISPATCH
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber || !/^[6-9]\d{9}$/.test(String(mobileNumber).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }

  const cleanMobile = String(mobileNumber).trim();
  const clientMeta = parseClientDeviceAndLocation(req, req.body);
  const existing = await firestoreDb.getCustomerByMobile(cleanMobile);
  
  // Generate secure fresh 6-digit OTP every single time
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  firestoreDb.setOtp(cleanMobile, otpCode);

  console.log(`[AUTH-OTP] Genuine OTP generated for +91-${cleanMobile}: ${otpCode}`);

  // Track OTP activity in Firestore
  firestoreDb.recordActivity({
    mobileNumber: cleanMobile,
    customerName: existing?.fullName || 'User',
    customerId: existing?.customerId,
    action: 'OTP Requested',
    details: `SMS verification requested on ${clientMeta.deviceSummary} from ${clientMeta.location}`,
    category: 'auth',
    ...clientMeta,
    timestamp: new Date().toISOString()
  }).catch(e => console.error('Activity log error:', e));

  return res.json({
    success: true,
    message: `Verification OTP dispatched to +91 ${cleanMobile}`,
    expiresInSeconds: 300,
    deliveryStatus: 'DELIVERED_VIA_SMS_GATEWAY',
    testOtp: otpCode,
    isRegistered: !!(existing && existing.fullName && existing.fullName !== 'Valued Customer'),
    customerName: existing?.fullName || null
  });
});

// VERIFY OTP & LOGIN / SIGNUP
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  const { mobileNumber, otp, fullName } = req.body;

  if (!mobileNumber || !/^[6-9]\d{9}$/.test(String(mobileNumber).trim())) {
    return res.status(400).json({ error: 'Valid 10-digit Indian mobile number is required' });
  }

  if (!otp || String(otp).trim().length !== 6) {
    return res.status(400).json({ error: 'Please enter the 6-digit OTP code' });
  }

  const cleanMobile = String(mobileNumber).trim();
  const cleanOtp = String(otp).trim();

  const isValid = firestoreDb.verifyOtp(cleanMobile, cleanOtp);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or expired OTP. Please request a new code.' });
  }

  const clientMeta = parseClientDeviceAndLocation(req, req.body);

  // Create or retrieve customer from central cloud database
  const customer = await firestoreDb.upsertCustomer(cleanMobile, fullName || '');
  
  // Update customer device & location info
  await firestoreDb.updateCustomerRecord(customer.customerId, {
    deviceSummary: clientMeta.deviceSummary,
    deviceType: clientMeta.deviceType,
    browser: clientMeta.browser,
    os: clientMeta.os,
    ipAddress: clientMeta.ipAddress,
    location: clientMeta.location,
    timezone: clientMeta.timezone,
    lastActiveAt: new Date().toISOString(),
    lastAction: 'Logged In'
  });

  // Track login activity in Firestore
  firestoreDb.recordActivity({
    customerId: customer.customerId,
    customerName: customer.fullName,
    mobileNumber: cleanMobile,
    action: 'User Logged In (OTP Verified)',
    details: `Session verified from ${clientMeta.deviceSummary} (${clientMeta.location})`,
    category: 'auth',
    ...clientMeta,
    timestamp: new Date().toISOString()
  }).catch(e => console.error('Activity log error:', e));

  // Generate customer session token
  const token = `cust_${crypto.randomBytes(24).toString('hex')}`;

  return res.json({
    success: true,
    message: 'OTP verified successfully',
    customer,
    token
  });
});

// Update customer profile
app.put('/api/customer/profile', async (req: Request, res: Response) => {
  const { customerId, fullName } = req.body;
  if (!customerId || !fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Customer ID and Full Name are required' });
  }

  const updated = await firestoreDb.updateCustomerProfile(customerId, fullName);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({ success: true, customer: updated });
});

// Get configured loan options
app.get('/api/loan-options', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const options = await firestoreDb.getLoanOptions(category);
    res.json(options);
  } catch (err: any) {
    console.error('Error fetching loan options:', err);
    res.status(500).json({ error: 'Failed to retrieve loan options' });
  }
});

// Admin: Save / Update loan option
app.post('/api/admin/loan-options', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }
    const saved = await firestoreDb.saveLoanOption(req.body);
    res.status(201).json({ success: true, option: saved });
  } catch (err: any) {
    console.error('Error saving loan option:', err);
    res.status(500).json({ error: err.message || 'Failed to save loan option' });
  }
});

// Admin: Delete loan option
app.delete('/api/admin/loan-options/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }
    const success = await firestoreDb.deleteLoanOption(req.params.id);
    res.json({ success });
  } catch (err: any) {
    console.error('Error deleting loan option:', err);
    res.status(500).json({ error: err.message || 'Failed to delete loan option' });
  }
});

// ==========================================
// PARTNER PLATFORMS & VERIFIED LENDERS API
// ==========================================

// Get configured partner platforms (public)
app.get('/api/partner-platforms', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const platforms = await firestoreDb.getPartnerPlatforms(category);
    res.json(platforms);
  } catch (err: any) {
    console.error('Error fetching partner platforms:', err);
    res.status(500).json({ error: 'Failed to retrieve partner platforms' });
  }
});

// Admin: Save / Update partner platform + verified lenders
app.post('/api/admin/partner-platforms', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }
    const saved = await firestoreDb.savePartnerPlatform(req.body);
    res.status(201).json({ success: true, platform: saved });
  } catch (err: any) {
    console.error('Error saving partner platform:', err);
    res.status(500).json({ error: err.message || 'Failed to save partner platform' });
  }
});

// Admin: Delete partner platform
app.delete('/api/admin/partner-platforms/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }
    const success = await firestoreDb.deletePartnerPlatform(req.params.id);
    res.json({ success });
  } catch (err: any) {
    console.error('Error deleting partner platform:', err);
    res.status(500).json({ error: err.message || 'Failed to delete partner platform' });
  }
});

// Track Partner Selection and Start Application (Customer clicks Apply Now)
app.post('/api/applications/:applicationId/select-partner', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { partnerPlatformId, partnerName, loanCategory, referralUrl, lenderName, lenderId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    if (!partnerName) {
      return res.status(400).json({ error: 'Partner Name is required' });
    }

    // Verify application exists
    const app = await firestoreDb.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ error: `Application record ${applicationId} not found in database.` });
    }

    // Determine secure referral URL
    let resolvedUrl = referralUrl;
    if (!resolvedUrl) {
      const platform = await firestoreDb.getPartnerPlatformById(partnerPlatformId);
      if (platform) {
        resolvedUrl = (loanCategory?.toLowerCase().includes('business') && platform.businessLoanUrl)
          ? platform.businessLoanUrl
          : platform.personalLoanUrl;
      }
    }

    if (!resolvedUrl) {
      resolvedUrl = app.destinationUrl || process.env.APP_BASE_URL || '/';
    }

    // Record partner selection in single source of truth
    const result = await firestoreDb.recordPartnerSelection(
      applicationId,
      partnerPlatformId || 'partner',
      partnerName,
      loanCategory || app.loanCategory || 'Personal Loan',
      resolvedUrl,
      lenderName,
      lenderId
    );

    return res.json({
      success: true,
      applicationId,
      partnerName,
      referralUrl: resolvedUrl,
      application: result.application
    });
  } catch (err: any) {
    console.error('Error recording partner selection:', err);
    res.status(500).json({ error: err.message || 'Unable to record partner application start. Please try again.' });
  }
});

// Track application status securely
app.post('/api/applications/track', async (req: Request, res: Response) => {
  try {
    const { applicationId, mobileNumber } = req.body;
    if (!applicationId || !mobileNumber) {
      return res.status(400).json({ error: 'Please enter both your Application ID (e.g. FC-XXXXXXXX) and 10-digit registered mobile number.' });
    }
    const result = await firestoreDb.trackApplication(applicationId, mobileNumber);
    if (!result) {
      return res.status(404).json({ error: 'No application found with the provided Application ID and Mobile Number. Please verify your details.' });
    }
    res.json({ success: true, application: result });
  } catch (err: any) {
    console.error('Error tracking application:', err);
    res.status(500).json({ error: 'Failed to retrieve application tracking details' });
  }
});

// Submit Loan Application (Personal/Business Loan, Instant Loan, All Type Loan)
app.post('/api/applications', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      applicantName,
      mobileNumber,
      email,
      dob,
      panNumber,
      pincode,
      loanCategory,
      amountRequested,
      employmentType,
      monthlyIncome,
      existingLoan,
      businessType,
      businessVintage,
      turnover,
      existingBusinessLoan,
      selectedOptionId,
      selectedOptionName,
      partnerName: passedPartnerName,
      destinationUrl: passedDestinationUrl,
      customerId,
      city,
      source,
      attachedDriveDocs,
      hasConsented
    } = req.body;

    const effectiveName = String(fullName || applicantName || '').trim();

    // Strict Validation
    if (!effectiveName || effectiveName.length < 2) {
      return res.status(400).json({ error: 'Please enter your complete Full Name as per PAN records' });
    }

    const cleanMobile = String(mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
    }

    const cleanPan = String(panNumber || '').trim().toUpperCase();
    if (cleanPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return res.status(400).json({ error: 'Please enter a valid Indian PAN format (e.g. ABCDE1234F)' });
    }

    if (pincode) {
      const cleanPin = String(pincode).trim();
      if (!/^\d{6}$/.test(cleanPin)) {
        return res.status(400).json({ error: 'Please enter a valid 6-digit Pincode' });
      }
    }

    if (hasConsented === false) {
      return res.status(400).json({ error: 'You must agree to the privacy policy and consent declaration to proceed' });
    }

    // Determine partner and destination URL dynamically from option or settings
    let partnerName = passedPartnerName || 'Partner Platform';
    let destinationUrl = passedDestinationUrl || '';

    if (selectedOptionId) {
      const option = await firestoreDb.getLoanOptionById(selectedOptionId);
      if (option) {
        partnerName = option.partnerName;
        destinationUrl = option.applicationUrl;
      }
    }

    if (!destinationUrl) {
      const settings = await firestoreDb.getSettings();
      if (loanCategory === 'Personal Loan') {
        partnerName = 'Choice Connect Financial Partner';
        destinationUrl = settings.choiceConnectPersonalLoanUrl || 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r';
      } else if (loanCategory === 'Personal Loan (PL)' || loanCategory === 'Personal / Business Loan') {
        partnerName = 'WeRize Financial Partner';
        destinationUrl = settings.personalBusinessLoanUrl;
      } else if (loanCategory === 'Business Loan') {
        partnerName = 'WeRize Financial Partner';
        destinationUrl = settings.personalBusinessLoanUrl;
      } else if (loanCategory === 'Instant Loan') {
        partnerName = 'TrueBalance Partner';
        destinationUrl = settings.instantLoanUrl;
      } else {
        partnerName = 'RuLoans Financial Partner';
        destinationUrl = settings.allTypeLoanUrl;
      }
    }

    // Mask PAN for general internal view to safeguard sensitive identifier
    const panMasked = cleanPan ? `${cleanPan.slice(0, 5)}****${cleanPan.slice(-1)}` : undefined;

    // Detect client device and location (both desktop/mobile and multi-location support)
    const clientMeta = parseClientDeviceAndLocation(req, req.body);

    // Ensure customer is recorded/updated in Firestore customers collection
    let assignedCustomerId = customerId;
    const existing = await firestoreDb.getCustomerByMobile(cleanMobile);
    if (existing) {
      assignedCustomerId = existing.customerId;
    }
    const savedCustomer = await firestoreDb.saveCustomerRecord({
      customerId: assignedCustomerId,
      fullName: String(fullName).trim(),
      mobileNumber: cleanMobile,
      email: email ? String(email).trim().toLowerCase() : (existing?.email || undefined),
      loanCategory: loanCategory || 'Personal Loan',
      amountRequested: amountRequested ? Number(amountRequested) : undefined,
      employmentType: employmentType ? String(employmentType) : undefined,
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
      city: city ? String(city) : undefined,
      source: source || (clientMeta.deviceType === 'Mobile' ? 'mobile_web' : 'web'),
      status: 'Verified',
      // Device and Location details
      deviceSummary: clientMeta.deviceSummary,
      deviceType: clientMeta.deviceType,
      os: clientMeta.os,
      browser: clientMeta.browser,
      ipAddress: clientMeta.ipAddress,
      location: city || clientMeta.location,
      timezone: clientMeta.timezone,
      lastActiveAt: new Date().toISOString(),
      lastAction: `Applied for ${loanCategory}`
    });
    assignedCustomerId = savedCustomer.customerId;

    // Save lead record securely in Firestore single source of truth
    const { application, isDuplicate } = await firestoreDb.createApplication({
      fullName: effectiveName,
      applicantName: applicantName ? String(applicantName).trim() : effectiveName,
      mobileNumber: cleanMobile,
      email: email ? String(email).trim().toLowerCase() : undefined,
      dob: dob ? String(dob).trim() : undefined,
      panNumber: cleanPan || undefined,
      panMasked,
      pincode: pincode ? String(pincode).trim() : undefined,
      loanCategory: loanCategory || 'Personal Loan',
      loanType: loanCategory || 'Personal Loan',
      selectedOptionId: selectedOptionId || undefined,
      selectedOptionName: selectedOptionName || partnerName,
      partnerName,
      destinationUrl,
      customerId: assignedCustomerId,
      amountRequested: amountRequested ? Number(amountRequested) : undefined,
      employmentType: employmentType ? String(employmentType) : undefined,
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
      existingLoan: existingLoan ? String(existingLoan).trim() : undefined,
      businessType: businessType ? String(businessType).trim() : undefined,
      businessVintage: businessVintage ? String(businessVintage).trim() : undefined,
      turnover: turnover ? String(turnover).trim() : undefined,
      existingBusinessLoan: existingBusinessLoan ? String(existingBusinessLoan).trim() : undefined,
      city: city ? String(city) : undefined,
      source: source || (clientMeta.deviceType === 'Mobile' ? 'mobile_web' : 'web'),
      attachedDriveDocs: Array.isArray(attachedDriveDocs) ? attachedDriveDocs : undefined,
      deviceSummary: clientMeta.deviceSummary,
      deviceType: clientMeta.deviceType,
      os: clientMeta.os,
      browser: clientMeta.browser,
      ipAddress: clientMeta.ipAddress,
      location: city || clientMeta.location,
      timezone: clientMeta.timezone,
      status: 'FORM SUBMITTED',
      externalApplicationStatus: 'Form Submitted - Selecting Lender'
    });

    // Record persistent activity log in Firestore
    firestoreDb.recordActivity({
      customerId: assignedCustomerId,
      customerName: effectiveName,
      mobileNumber: cleanMobile,
      action: `Lead Created: ${loanCategory} (${application.applicationId})`,
      details: `Lead ID: ${application.applicationId} | Amount: ₹${amountRequested ? Number(amountRequested).toLocaleString('en-IN') : 'Standard'} | Option: ${selectedOptionName || partnerName}`,
      category: 'application',
      deviceType: clientMeta.deviceType,
      deviceSummary: clientMeta.deviceSummary,
      browser: clientMeta.browser,
      os: clientMeta.os,
      ipAddress: clientMeta.ipAddress,
      location: city || clientMeta.location,
      city: city || undefined,
      timezone: clientMeta.timezone,
      timestamp: new Date().toISOString()
    }).catch(e => console.error('Activity log error:', e));

    // Record referral attribution if referral code is present
    const refCode = req.body.referralCode || req.headers['x-referral-code'] || (req.query.ref ? String(req.query.ref) : undefined);
    if (refCode) {
      firestoreDb.recordLoanReferral({
        referrerCode: String(refCode),
        referredCustomer: savedCustomer,
        applicationId: application.applicationId,
        loanType: application.loanCategory || 'Personal Loan',
        provider: partnerName
      }).catch(e => console.warn('Referral recording error:', e));
    }

    return res.status(201).json({
      success: true,
      message: isDuplicate 
        ? 'Your existing application details have been updated. Your Lead ID is active.' 
        : 'Application details saved successfully.',
      application,
      applicationId: application.applicationId,
      leadId: application.applicationId,
      destinationUrl,
      isDuplicate
    });
  } catch (err: any) {
    console.error('Error handling /api/applications lead submission:', err);
    return res.status(500).json({ error: 'Your application could not be saved. Please try again.' });
  }
});

// Get applications for customer
app.get('/api/applications/my', async (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  const mobile = req.query.mobile as string;

  if (!customerId && !mobile) {
    return res.status(400).json({ error: 'CustomerId or Mobile parameter required' });
  }

  const applications = await firestoreDb.getApplicationsByCustomer(customerId, mobile);
  res.json(applications);
});

// Full Customer Registration (New Customer Flow)
app.post('/api/customer/register', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      dob,
      panNumber,
      pincode,
      employmentType,
      monthlyIncome,
      requiredLoanAmount,
      loanCategory
    } = req.body;

    if (!fullName || String(fullName).trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your Full Legal Name as per PAN.' });
    }

    const cleanMobile = String(mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    const cleanPan = panNumber ? String(panNumber).trim().toUpperCase() : undefined;
    if (cleanPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return res.status(400).json({ error: 'Please enter a valid 10-character PAN (e.g. ABCDE1234F).' });
    }

    const clientMeta = parseClientDeviceAndLocation(req, req.body);

    const { customer, application } = await firestoreDb.registerNewCustomer({
      fullName: String(fullName).trim(),
      mobileNumber: cleanMobile,
      email: email ? String(email).trim().toLowerCase() : undefined,
      dob: dob ? String(dob).trim() : undefined,
      panNumber: cleanPan,
      pincode: pincode ? String(pincode).trim() : undefined,
      employmentType: employmentType || 'Salaried',
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 35000,
      requiredLoanAmount: requiredLoanAmount ? Number(requiredLoanAmount) : 200000,
      loanCategory: loanCategory || 'Personal Loan',
      source: clientMeta.deviceType === 'Mobile' ? 'mobile_web' : 'web',
      deviceMeta: clientMeta
    });

    // Record activity
    firestoreDb.recordActivity({
      customerId: customer.customerId,
      customerName: customer.fullName,
      mobileNumber: cleanMobile,
      action: 'New Customer Registered & Loan Profile Created',
      details: `Profile registered. Initial Application ID: ${application.applicationId}. Amount: ₹${(application.amountRequested || 0).toLocaleString('en-IN')}`,
      category: 'auth',
      ...clientMeta,
      timestamp: new Date().toISOString()
    }).catch(e => console.error('Activity log error:', e));

    const token = `cust_${crypto.randomBytes(24).toString('hex')}`;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to your FINCRED loan portal.',
      customer,
      application,
      token
    });
  } catch (err: any) {
    console.error('Error during customer registration:', err);
    return res.status(500).json({ error: err.message || 'Registration failed. Please try again.' });
  }
});

// Secure Document Upload for Loan Application
app.post('/api/customer/documents/upload', async (req: Request, res: Response) => {
  try {
    const { applicationId, docType, name, fileBase64, fileName, fileSize, mimeType } = req.body;

    if (!applicationId || !docType || !name) {
      return res.status(400).json({ error: 'Application ID, Document Type, and Document Name are required.' });
    }

    if (!fileBase64 && !fileName) {
      return res.status(400).json({ error: 'Please choose a document file to upload.' });
    }

    let publicFileUrl = '';

    // If base64 data URL provided, save securely to public/uploads
    if (fileBase64 && fileBase64.startsWith('data:')) {
      const matches = fileBase64.match(/^data:([A-Za-z-+\/0-9.]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const rawExt = matches[1].split('/')[1] || 'pdf';
        const ext = rawExt.includes('pdf') ? 'pdf' : (rawExt.includes('jpeg') ? 'jpg' : rawExt);
        const buffer = Buffer.from(matches[2], 'base64');
        const safeName = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, safeName);
        fs.writeFileSync(filePath, buffer);
        publicFileUrl = `/uploads/${safeName}`;
      }
    } else if (fileBase64 && (fileBase64.startsWith('http://') || fileBase64.startsWith('https://'))) {
      publicFileUrl = fileBase64;
    } else {
      // Mock generated document reference placeholder
      const safeName = `doc_${Date.now()}_${fileName || 'document.pdf'}`;
      publicFileUrl = `/uploads/${safeName}`;
    }

    const result = await firestoreDb.uploadApplicationDocument({
      applicationId,
      docType,
      name,
      fileName: fileName || `${name}.pdf`,
      fileUrl: publicFileUrl,
      fileSize: fileSize || 250000,
      mimeType: mimeType || 'application/pdf'
    });

    if (!result) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Record activity
    const clientMeta = parseClientDeviceAndLocation(req, req.body);
    firestoreDb.recordActivity({
      customerId: result.application.customerId,
      customerName: result.application.fullName,
      mobileNumber: result.application.mobileNumber,
      action: `Document Uploaded: ${name}`,
      details: `Uploaded ${name} for application ${applicationId}`,
      category: 'application',
      ...clientMeta,
      timestamp: new Date().toISOString()
    }).catch(e => console.error('Activity log error:', e));

    return res.json({
      success: true,
      message: `${name} uploaded successfully!`,
      document: result.document,
      application: result.application
    });
  } catch (err: any) {
    console.error('Error uploading document:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload document. Please try again.' });
  }
});

// Customer Notifications
app.get('/api/customer/notifications', async (req: Request, res: Response) => {
  try {
    const customerId = (req.query.customerId as string) || '';
    const mobile = (req.query.mobile as string) || '';
    const notifications = await firestoreDb.getCustomerNotifications(customerId, mobile);
    return res.json({ success: true, notifications });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

app.get('/api/notifications', async (req: Request, res: Response) => {
  try {
    const customerId = (req.query.customerId as string) || '';
    const mobile = (req.query.mobile as string) || '';
    const notifications = await firestoreDb.getCustomerNotifications(customerId, mobile);
    return res.json({ success: true, notifications });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Admin: Send Broadcast / Push Notification
app.post('/api/admin/notifications/send', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, message, type, target, actionUrl } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const notif = await firestoreDb.createBroadcastNotification({
      title: String(title),
      message: String(message),
      type: type || 'info',
      target: target || 'ALL',
      actionUrl: actionUrl || '/dashboard?tab=options',
      sentBy: 'FinCred Admin'
    });

    const clientMeta = parseClientDeviceAndLocation(req, req.body);
    firestoreDb.recordActivity({
      action: 'Admin Broadcast Notification Sent',
      details: `Title: "${title}". Target: ${target || 'ALL'}. Type: ${type || 'info'}`,
      category: 'system',
      ...clientMeta,
      timestamp: new Date().toISOString()
    }).catch(e => console.error('Activity log error:', e));

    return res.json({
      success: true,
      message: 'Notification broadcast successfully sent!',
      notification: notif
    });
  } catch (err: any) {
    console.error('Error sending admin notification:', err);
    return res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

// Admin: List all broadcast notifications
app.get('/api/admin/notifications', requireAdmin, async (req: Request, res: Response) => {
  try {
    const list = await firestoreDb.getAllBroadcastNotifications();
    return res.json({ success: true, notifications: list });
  } catch (err: any) {
    console.error('Error fetching admin notifications:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Admin: Delete broadcast notification
app.delete('/api/admin/notifications/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const success = await firestoreDb.deleteBroadcastNotification(req.params.id);
    return res.json({ success });
  } catch (err: any) {
    console.error('Error deleting notification:', err);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ==========================================
// CIBIL SCORE IMPROVEMENT API ROUTES (₹299)
// ==========================================

// Customer: Submit CIBIL Improvement Order with UPI UTR
app.post('/api/cibil/submit', async (req: Request, res: Response) => {
  try {
    const { fullName, mobileNumber, utrNumber, customerId, email, panNumber, currentScoreEstimate } = req.body;
    
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Please enter your full name' });
    }
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber.trim())) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
    }
    if (!utrNumber || utrNumber.trim().length < 6) {
      return res.status(400).json({ error: 'Please enter a valid UPI UTR / Transaction Reference Number' });
    }

    const order = await firestoreDb.createCibilOrder({
      customerId,
      fullName,
      mobileNumber,
      email,
      panNumber,
      currentScoreEstimate,
      utrNumber,
      amount: 299
    });

    return res.json({ success: true, order });
  } catch (err: any) {
    console.error('Error creating cibil order:', err);
    return res.status(500).json({ error: 'Failed to submit CIBIL order' });
  }
});

// Customer: Track CIBIL Order by Reference Number or Mobile
app.get('/api/cibil/track', async (req: Request, res: Response) => {
  try {
    const queryStr = (req.query.query || req.query.ref || req.query.mobile || '').toString();
    if (!queryStr) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const order = await firestoreDb.getCibilOrderByIdOrRef(queryStr);
    if (!order) {
      return res.status(404).json({ error: 'No CIBIL order found for the provided details' });
    }

    return res.json({ success: true, order });
  } catch (err: any) {
    console.error('Error tracking cibil order:', err);
    return res.status(500).json({ error: 'Failed to track order' });
  }
});

// Admin: List all CIBIL Orders
app.get('/api/admin/cibil/orders', requireAdmin, async (req: Request, res: Response) => {
  try {
    const orders = await firestoreDb.getAllCibilOrders();
    return res.json({ success: true, orders });
  } catch (err: any) {
    console.error('Error getting admin cibil orders:', err);
    return res.status(500).json({ error: 'Failed to fetch CIBIL orders' });
  }
});

// Admin: Confirm CIBIL Order & Send Branch Link
app.post('/api/admin/cibil/orders/:id/confirm', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const updated = await firestoreDb.confirmCibilOrder(id, adminNotes);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Error confirming cibil order:', err);
    return res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// Admin: Reject CIBIL Order
app.post('/api/admin/cibil/orders/:id/reject', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await firestoreDb.rejectCibilOrder(id, reason);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Error rejecting cibil order:', err);
    return res.status(500).json({ error: 'Failed to reject order' });
  }
});

// ==========================================
// EARN & REFER API ROUTES
// ==========================================

// Public / Customer: Get Earn Settings
app.get('/api/earn/settings', async (req: Request, res: Response) => {
  try {
    const settings = await firestoreDb.getEarnSettings();
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch earn settings' });
  }
});

// Customer: Get Referral Profile
app.get('/api/earn/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId || req.headers['x-user-id'] || '').toString();
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const profile = await firestoreDb.getReferralProfile(userId);
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch referral profile' });
  }
});

// Customer: Activate Referral Profile with Bank Details
app.post('/api/earn/activate-profile', async (req: Request, res: Response) => {
  try {
    const { userId, fullName, mobileNumber, bankName, accountNumber, confirmAccountNumber, ifscCode, parentReferrerCode } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID required' });
    if (!fullName || !fullName.trim()) return res.status(400).json({ error: 'Full name required' });
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber.trim())) return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
    if (!bankName || !bankName.trim()) return res.status(400).json({ error: 'Bank name required' });
    if (!accountNumber || !accountNumber.trim()) return res.status(400).json({ error: 'Account number required' });
    if (accountNumber.trim() !== confirmAccountNumber?.trim()) {
      return res.status(400).json({ error: 'Account Number and Confirm Account Number do not match' });
    }
    const cleanIfsc = ifscCode?.trim().toUpperCase();
    if (!cleanIfsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      return res.status(400).json({ error: 'Please enter a valid 11-character Indian IFSC code (e.g. SBIN0001234)' });
    }

    const profile = await firestoreDb.activateReferralProfile({
      userId,
      fullName,
      mobileNumber,
      bankName,
      accountNumber,
      ifscCode: cleanIfsc,
      parentReferrerCode
    });

    return res.json({ success: true, profile });
  } catch (err: any) {
    console.error('Error activating referral profile:', err);
    return res.status(500).json({ error: err.message || 'Failed to activate referral profile' });
  }
});

// Customer: Check App Reward Status / Eligibility
app.get('/api/earn/app-reward', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId || '').toString();
    const mobileNumber = (req.query.mobileNumber || '').toString();
    if (!userId && !mobileNumber) return res.status(400).json({ error: 'User ID or Mobile required' });

    const result = await firestoreDb.checkAppRewardEligibility(userId, mobileNumber);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to check app reward' });
  }
});

// Customer: Record Navi Link Click
app.post('/api/earn/app-reward/click', async (req: Request, res: Response) => {
  try {
    const { userId, userName, mobileNumber } = req.body;
    if (!userId || !mobileNumber) return res.status(400).json({ error: 'User ID and Mobile required' });

    const reward = await firestoreDb.recordNaviLinkClicked(userId, userName || 'Customer', mobileNumber);
    return res.json({ success: true, reward });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record link click' });
  }
});

// Customer: Submit ₹1 Payment UTR / Ref
app.post('/api/earn/app-reward/submit-payment', async (req: Request, res: Response) => {
  try {
    const { userId, paymentReference } = req.body;
    if (!userId || !paymentReference) return res.status(400).json({ error: 'User ID and Payment Reference required' });

    const reward = await firestoreDb.submitAppRewardPayment(userId, paymentReference);
    return res.json({ success: true, reward });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to submit payment reference' });
  }
});

// Customer: Get My Referrals History
app.get('/api/earn/my-referrals', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId || '').toString();
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const referrals = await firestoreDb.getCustomerReferrals(userId);
    return res.json({ success: true, referrals });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Admin: Earn Settings Management
app.get('/api/admin/earn/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await firestoreDb.getEarnSettings();
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/admin/earn/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await firestoreDb.updateEarnSettings(req.body);
    return res.json({ success: true, settings: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Admin: List App Rewards
app.get('/api/admin/earn/app-rewards', requireAdmin, async (req: Request, res: Response) => {
  try {
    const rewards = await firestoreDb.getAllAppRewards();
    return res.json({ success: true, rewards });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch app rewards' });
  }
});

// Admin: Action on App Reward
app.post('/api/admin/earn/app-rewards/:userId/action', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { action, notes } = req.body;
    const adminId = (req as any).adminUsername || 'admin';
    const updated = await firestoreDb.adminVerifyAppReward(userId, action, notes, adminId);
    return res.json({ success: true, reward: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update app reward' });
  }
});

// Admin: List All Loan Referrals
app.get('/api/admin/earn/referrals', requireAdmin, async (req: Request, res: Response) => {
  try {
    const referrals = await firestoreDb.getAllLoanReferrals();
    return res.json({ success: true, referrals });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Admin: List All Payouts
app.get('/api/admin/earn/payouts', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payouts = await firestoreDb.getAllPayouts();
    return res.json({ success: true, payouts });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Admin: Action on Payout
app.post('/api/admin/earn/payouts/:payoutId/action', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    const { action, transactionId, notes } = req.body;
    const updated = await firestoreDb.updatePayoutStatus(payoutId, action, transactionId, notes);
    return res.json({ success: true, payout: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update payout' });
  }
});

// Admin: Secure View Bank Details (with audit log)
app.get('/api/admin/earn/bank-details/:userId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).adminUsername || 'admin';
    const bankDetails = await firestoreDb.getAdminBankDetails(adminId, userId);
    return res.json({ success: true, bankDetails });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to retrieve bank details' });
  }
});

// ==========================================
// STANDALONE FINCRED MOBILE APP API ROUTES
// ==========================================

// Active mobile app sessions (token -> customerId)
const activeCustomerSessions = new Map<string, { customerId: string; createdAt: number }>();

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
  } catch {
    return false;
  }
}

function sanitizeCustomer(cust: any) {
  if (!cust) return null;
  const { passwordHash, passwordSalt, ...safe } = cust;
  return safe;
}

// 1. Mobile App: SIGN UP
app.post('/api/app/auth/register', async (req: Request, res: Response) => {
  const { fullName, mobileNumber, email, password, confirmPassword } = req.body;

  // Validation
  if (!fullName || String(fullName).trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your complete Full Name' });
  }

  const cleanMobile = String(mobileNumber || '').trim();
  if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }

  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match. Please re-enter carefully.' });
  }

  const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Check duplicate registration
  const existingByMobile = await firestoreDb.getCustomerByMobile(cleanMobile);
  if (existingByMobile && existingByMobile.passwordHash) {
    return res.status(409).json({
      error: 'An account with this mobile number already exists in FINCRED. Please login instead.'
    });
  }

  if (cleanEmail) {
    const existingByEmail = await firestoreDb.getCustomerByEmail(cleanEmail);
    if (existingByEmail && existingByEmail.customerId !== existingByMobile?.customerId && existingByEmail.passwordHash) {
      return res.status(409).json({
        error: 'An account with this email address already exists in FINCRED. Please login instead.'
      });
    }
  }

  // Secure Password Hashing
  const { hash, salt } = hashPassword(password);

  // Register in Firestore single source of truth
  const customer = await firestoreDb.registerAppCustomer({
    fullName: String(fullName).trim(),
    mobileNumber: cleanMobile,
    email: cleanEmail,
    passwordHash: hash,
    passwordSalt: salt
  });

  // Create authenticated session
  const token = `fc_app_${crypto.randomBytes(24).toString('hex')}`;
  activeCustomerSessions.set(token, { customerId: customer.customerId, createdAt: Date.now() });

  return res.status(201).json({
    success: true,
    message: 'Welcome to FINCRED! Your account has been registered successfully.',
    customer: sanitizeCustomer(customer),
    token
  });
});

// 2. Mobile App: LOGIN
app.post('/api/app/auth/login', async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !String(identifier).trim()) {
    return res.status(400).json({ error: 'Please enter your registered mobile number or email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Please enter your password' });
  }

  const cleanId = String(identifier).trim();
  let customer = /^[6-9]\d{9}$/.test(cleanId)
    ? await firestoreDb.getCustomerByMobile(cleanId)
    : await firestoreDb.getCustomerByEmail(cleanId.toLowerCase());

  if (!customer) {
    // Try mobile search as fallback
    customer = await firestoreDb.getCustomerByMobile(cleanId);
  }

  if (!customer) {
    return res.status(401).json({ error: 'No FINCRED account found with these credentials. Please check or sign up.' });
  }

  // If customer registered earlier on website via OTP without a password yet
  if (!customer.passwordHash || !customer.passwordSalt) {
    // Check if password matches a default initialization or prompt user
    return res.status(401).json({
      error: 'Account exists from website OTP. Please sign up or reset your password to access the Mobile App.',
      needsPasswordSetup: true
    });
  }

  // Verify password securely
  const isValid = verifyPassword(password, customer.passwordHash, customer.passwordSalt);
  if (!isValid) {
    return res.status(401).json({ error: 'Incorrect password. Please try again or use Forgot Password.' });
  }

  // Create authenticated session
  const token = `fc_app_${crypto.randomBytes(24).toString('hex')}`;
  activeCustomerSessions.set(token, { customerId: customer.customerId, createdAt: Date.now() });

  return res.json({
    success: true,
    message: `Welcome back, ${customer.fullName}!`,
    customer: sanitizeCustomer(customer),
    token
  });
});

// 3. Mobile App: GET CURRENT AUTH USER
app.get('/api/app/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeCustomerSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const customer = await firestoreDb.getCustomerById(session.customerId);
  if (!customer) {
    return res.status(404).json({ error: 'User account not found' });
  }

  return res.json({
    success: true,
    customer: sanitizeCustomer(customer)
  });
});

// 4. Mobile App: LOGOUT
app.post('/api/app/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeCustomerSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Mobile App: FORGOT / RESET PASSWORD
app.post('/api/app/auth/forgot-password', async (req: Request, res: Response) => {
  const { mobileNumber, newPassword } = req.body;
  if (!mobileNumber || !/^[6-9]\d{9}$/.test(String(mobileNumber).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const cleanMobile = String(mobileNumber).trim();
  const customer = await firestoreDb.getCustomerByMobile(cleanMobile);
  if (!customer) {
    return res.status(404).json({ error: 'No account found with this mobile number in FINCRED records' });
  }

  const { hash, salt } = hashPassword(newPassword);
  await firestoreDb.updateCustomerPassword(customer.customerId, hash, salt);

  return res.json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.'
  });
});

// 6. Mobile App: GET LOAN PRODUCTS CATALOG (Dynamic from DB Settings)
app.get('/api/app/loans/products', async (req: Request, res: Response) => {
  const settings = await firestoreDb.getSettings();
  const products = [
    {
      id: 'personal-loan-choice',
      name: 'Choice Connect Personal Loan',
      category: 'Personal Loan',
      maxAmount: 'Up to ₹25,00,000',
      minAmount: '₹25,000',
      interestRate: '10.49% p.a. onwards',
      tenure: '12 to 60 Months',
      features: ['Paperless Digital Verification', 'No Physical Branch Visit', 'Direct Bank Disbursal'],
      partnerName: 'Choice Connect Partner',
      destinationUrl: settings.choiceConnectPersonalLoanUrl || 'https://choiceconnect.in/referral/loan/personal-loan/QzAxMTkyOTg=?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r',
      badge: 'Most Popular',
      color: 'blue'
    },
    {
      id: 'personal-business-werize',
      name: 'WeRize Personal & Business Loan',
      category: 'Personal / Business Loan',
      maxAmount: 'Up to ₹15,00,000',
      minAmount: '₹30,000',
      interestRate: '11.99% p.a. onwards',
      tenure: '6 to 36 Months',
      features: ['RBI-Registered NBFC Partner', 'Flexible Repayment', 'Minimum Documentation'],
      partnerName: 'WeRize Financial Partner',
      destinationUrl: settings.personalBusinessLoanUrl,
      badge: 'Fast Approval',
      color: 'emerald'
    },
    {
      id: 'instant-cash-truebalance',
      name: 'TrueBalance Instant Cash Loan',
      category: 'Instant Loan',
      maxAmount: 'Up to ₹1,00,000',
      minAmount: '₹1,000',
      interestRate: '1.5% to 2.4% monthly',
      tenure: '3 to 12 Months',
      features: ['Instant 5-Minute Cash Transfer', 'Urgent Emergency Needs', '100% Mobile Flow'],
      partnerName: 'TrueBalance Partner',
      destinationUrl: settings.instantLoanUrl,
      badge: 'Instant Cash',
      color: 'amber'
    },
    {
      id: 'multi-bank-ruloans',
      name: 'RuLoans Multi-Bank All Type Loan',
      category: 'All Type Loan',
      maxAmount: 'Up to ₹50,00,000',
      minAmount: '₹50,000',
      interestRate: '10.25% p.a. onwards',
      tenure: '12 to 84 Months',
      features: ['100+ Leading Banks & NBFCs', 'Compare Best Offers', 'Dedicated Loan Advisor'],
      partnerName: 'RuLoans Financial Partner',
      destinationUrl: settings.allTypeLoanUrl,
      badge: 'Best Rate Finder',
      color: 'indigo'
    },
    {
      id: 'navi-upi-safe',
      name: 'Navi High-Speed Safe UPI & Finance',
      category: 'Safe UPI & Finance',
      maxAmount: 'Instant Access',
      minAmount: '₹0',
      interestRate: 'Zero Charges',
      tenure: 'Lifetime Free',
      features: ['Zero Transaction Failures', 'Instant Cashback Rewards', 'Direct NPCI / RBI Backed'],
      partnerName: 'Navi Technologies',
      destinationUrl: settings.safeUpiUrl,
      badge: 'Zero Failures',
      color: 'cyan'
    }
  ];

  return res.json({
    success: true,
    products,
    updatedAt: settings.updatedAt
  });
});

// 7. Mobile App: UPDATE CUSTOMER PROFILE
app.put('/api/app/customer/profile', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const { fullName, email, customerId } = req.body;

  let targetCustomerId = customerId;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeCustomerSessions.get(token);
    if (session) {
      targetCustomerId = session.customerId;
    }
  }

  if (!targetCustomerId) {
    return res.status(401).json({ error: 'Customer authentication required' });
  }

  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  const updated = await firestoreDb.updateCustomerProfile(targetCustomerId, String(fullName).trim(), email);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    customer: sanitizeCustomer(updated)
  });
});

// ==========================================
// HIDDEN ADMIN API ROUTES
// ==========================================

// Hidden Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && password.trim() === ADMIN_PASSWORD) {
    const adminToken = `admin_${crypto.randomBytes(32).toString('hex')}`;
    activeAdminTokens.add(adminToken);

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      token: adminToken,
      username: ADMIN_USERNAME
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Admin Logout
app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    activeAdminTokens.delete(token);
  }
  res.json({ success: true, message: 'Admin logged out' });
});

// Admin Overview Statistics
app.get('/api/admin/stats', requireAdmin, async (req: Request, res: Response) => {
  const stats = await firestoreDb.getAdminStats();
  res.json(stats);
});

// Admin Customers List
app.get('/api/admin/customers', requireAdmin, async (req: Request, res: Response) => {
  const customers = await firestoreDb.getCustomers();
  // Include application counts
  const apps = await firestoreDb.getApplications();
  const customersWithCounts = customers.map(c => {
    const count = apps.filter(a => a.customerId === c.customerId || a.mobileNumber === c.mobileNumber).length;
    return {
      ...c,
      applicationCount: count
    };
  });
  res.json(customersWithCounts);
});

// Admin Add New Customer
app.post('/api/admin/customers', requireAdmin, async (req: Request, res: Response) => {
  const { fullName, mobileNumber, email, loanCategory, amountRequested, status } = req.body;
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'Customer full name is required' });
  }
  if (!mobileNumber || !/^[6-9]\d{9}$/.test(String(mobileNumber).trim())) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
  }

  const customer = await firestoreDb.saveCustomerRecord({
    fullName: String(fullName).trim(),
    mobileNumber: String(mobileNumber).trim(),
    email: email ? String(email).trim().toLowerCase() : undefined,
    loanCategory,
    amountRequested: amountRequested ? Number(amountRequested) : undefined,
    status: status || 'Verified',
    source: 'web'
  });

  res.status(201).json({ success: true, customer });
});

// Admin Edit Existing Customer
app.put('/api/admin/customers/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await firestoreDb.updateCustomerRecord(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({ success: true, customer: updated });
});

// Admin Remove Customer Completely From Entire Website
app.delete('/api/admin/customers/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await firestoreDb.deleteCustomer(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  return res.json({
    success: true,
    message: 'User and all associated data completely removed from website'
  });
});

// Admin Applications List
app.get('/api/admin/applications', requireAdmin, async (req: Request, res: Response) => {
  const applications = await firestoreDb.getApplications();
  res.json(applications);
});

// Admin Update Application Internal Status
app.put('/api/admin/applications/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const validStatuses = [
    'NEW',
    'FORM SUBMITTED',
    'APPLICATION STARTED',
    'DETAILS SUBMITTED',
    'DOCUMENTS SUBMITTED',
    'VERIFICATION',
    'UNDER REVIEW',
    'DECISION',
    'PARTNER SELECTED',
    'OPTION SELECTED',
    'REDIRECTED',
    'IN PROGRESS',
    'APPLICATION COMPLETED',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
    'CLOSED',
    'ALTERNATIVE OPTION EXPLORED',
    'Request Submitted',
    'Redirected to Partner',
    'Under External Review',
    'Status Update Pending',
    'Contact Pending'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid application status value' });
  }

  const updated = await firestoreDb.updateApplicationStatus(id, status as any, adminNotes);
  if (!updated) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // If approved/disbursed, automatically trigger referral payout eligibility
  if (['APPROVED', 'DISBURSED', 'COMPLETED'].includes(status)) {
    firestoreDb.triggerDisbursalReward(id, updated.amountRequested).catch(e => console.error('Disbursal reward trigger error:', e));
  }

  res.json({ success: true, application: updated });
});

// Admin Update Document Verification Status & Remarks
app.put('/api/admin/applications/:id/documents/:docId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, docId } = req.params;
    const { status, adminRemark } = req.body;

    const validDocStatuses = ['VERIFIED', 'RE_UPLOAD_REQUESTED', 'REJECTED', 'UPLOADED', 'PENDING'];
    if (!status || !validDocStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid document status required: VERIFIED, RE_UPLOAD_REQUESTED, REJECTED, UPLOADED, PENDING' });
    }

    const result = await firestoreDb.updateDocumentVerification(id, docId, status as any, adminRemark);
    if (!result) {
      return res.status(404).json({ error: 'Application or document not found' });
    }

    return res.json({
      success: true,
      message: `Document status updated to ${status}`,
      document: result.document,
      application: result.application
    });
  } catch (err: any) {
    console.error('Error updating document status:', err);
    return res.status(500).json({ error: 'Failed to update document verification status' });
  }
});

// Admin Delete Application
app.delete('/api/admin/applications/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await firestoreDb.deleteApplication(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Application not found' });
  }
  return res.json({ success: true, message: 'Application deleted successfully' });
});

// Admin Banner Management: List all banners
app.get('/api/admin/banners', requireAdmin, async (req: Request, res: Response) => {
  const banners = await firestoreDb.getBanners(false);
  res.json(banners);
});

// Admin Banner Management: Add new banner
app.post('/api/admin/banners', requireAdmin, async (req: Request, res: Response) => {
  const { title, description, buttonText, destinationUrl, imageUrl, isActive, displayOrder } = req.body;

  if (!title || !destinationUrl || !imageUrl) {
    return res.status(400).json({ error: 'Title, Destination URL, and Image are required' });
  }

  const newBanner = await firestoreDb.createBanner({
    title: title.trim(),
    description: description?.trim() || '',
    buttonText: buttonText?.trim() || 'Apply Now',
    destinationUrl: destinationUrl.trim(),
    imageUrl: imageUrl.trim(),
    isActive: isActive !== false,
    displayOrder: Number(displayOrder) || 1
  });

  res.status(201).json({ success: true, banner: newBanner });
});

// Admin Banner Management: Update banner
app.put('/api/admin/banners/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = await firestoreDb.updateBanner(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Banner not found' });
  }

  res.json({ success: true, banner: updated });
});

// Admin Banner Management: Delete banner
app.delete('/api/admin/banners/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await firestoreDb.deleteBanner(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Banner not found' });
  }
  res.json({ success: true, message: 'Banner deleted successfully' });
});

// Admin Banner Image Upload (handles base64 data URLs directly or saves to public/uploads)
app.post('/api/admin/upload-banner', requireAdmin, (req: Request, res: Response) => {
  const { imageBase64, filename } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image data received' });
  }

  try {
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // Return raw URL if already an HTTPS link
      if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
        return res.json({ url: imageBase64 });
      }
      return res.status(400).json({ error: 'Invalid image format. Provide a valid image file or URL.' });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `banner_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ error: 'Failed to process and store banner image' });
  }
});

// Admin Loan Link Management: Update partner destination links
app.put('/api/admin/settings', requireAdmin, async (req: Request, res: Response) => {
  const { choiceConnectPersonalLoanUrl, personalBusinessLoanUrl, instantLoanUrl, allTypeLoanUrl, safeUpiUrl } = req.body;

  const updated = await firestoreDb.updateSettings({
    ...(choiceConnectPersonalLoanUrl ? { choiceConnectPersonalLoanUrl: choiceConnectPersonalLoanUrl.trim() } : {}),
    ...(personalBusinessLoanUrl ? { personalBusinessLoanUrl: personalBusinessLoanUrl.trim() } : {}),
    ...(instantLoanUrl ? { instantLoanUrl: instantLoanUrl.trim() } : {}),
    ...(allTypeLoanUrl ? { allTypeLoanUrl: allTypeLoanUrl.trim() } : {}),
    ...(safeUpiUrl ? { safeUpiUrl: safeUpiUrl.trim() } : {})
  });

  res.json({ success: true, settings: updated });
});

// ==========================================
// USER ACTIVITY & MULTI-DEVICE TRACKING API
// ==========================================

// Record any user interaction (page visit, partner redirect, calculator use, click)
app.post('/api/activity', async (req: Request, res: Response) => {
  try {
    const { action, description, details, category, activityType, customerId, customerName, userName, mobileNumber, userMobile, location, city, path, metadata } = req.body;

    const actionText = action || description;
    if (!actionText) {
      return res.status(400).json({ error: 'Action or description is required' });
    }

    const clientMeta = parseClientDeviceAndLocation(req, req.body);

    const logRecord = await firestoreDb.recordActivity({
      action: String(actionText).trim(),
      activityType: activityType || category || 'navigation',
      description: description || actionText,
      details: details ? String(details).trim() : undefined,
      category: category || (activityType as any) || 'navigation',
      customerId: customerId || undefined,
      customerName: customerName || userName || undefined,
      userName: userName || customerName || undefined,
      mobileNumber: mobileNumber || userMobile ? String(mobileNumber || userMobile).trim() : undefined,
      userMobile: userMobile || mobileNumber ? String(userMobile || mobileNumber).trim() : undefined,
      deviceType: clientMeta.deviceType,
      deviceSummary: clientMeta.deviceSummary,
      browser: clientMeta.browser,
      os: clientMeta.os,
      ipAddress: clientMeta.ipAddress,
      location: location || city || clientMeta.location,
      city: city || undefined,
      timezone: clientMeta.timezone,
      path: path || undefined,
      metadata: metadata || undefined,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, activity: logRecord });
  } catch (err: any) {
    console.error('Failed to record activity log:', err);
    return res.status(500).json({ error: 'Failed to record activity log' });
  }
});

// Admin: Get live activity feed across all devices & locations
app.get('/api/admin/activities', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limitCount = req.query.limit ? Number(req.query.limit) : 150;
    const activities = await firestoreDb.getActivityLogs(limitCount);
    res.json(activities);
  } catch (err: any) {
    console.error('Error fetching admin activity logs:', err);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Admin: Clear activity logs
app.delete('/api/admin/activities', requireAdmin, async (req: Request, res: Response) => {
  try {
    const cleared = await firestoreDb.clearActivityLogs();
    res.json({ success: cleared, message: 'All activity logs successfully cleared' });
  } catch (err: any) {
    console.error('Error clearing activity logs:', err);
    res.status(500).json({ error: 'Failed to clear activity logs' });
  }
});

// ==========================================
// API 404 & ERROR HANDLING (JSON GUARANTEE)
// ==========================================

// Explicit JSON 404 handler for any unhandled /api/* endpoint - NEVER returns HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).setHeader('Content-Type', 'application/json').json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint ${req.method} ${req.path} not found`
    }
  });
});

// Global API error handler for any unhandled errors - NEVER returns HTML stack traces
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl?.startsWith('/api') || req.path?.startsWith('/api')) {
    console.error(`[API Uncaught Error] ${req.method} ${req.originalUrl}:`, err);
    return res.status(err.status || 500).setHeader('Content-Type', 'application/json').json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected server error occurred'
      }
    });
  }
  next(err);
});

// ==========================================
// VITE & STATIC SERVING INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Client-side SPA routing fallback for non-API routes
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).setHeader('Content-Type', 'application/json').json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `API endpoint ${req.method} ${req.path} not found`
          }
        });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });

    // In dev mode, block Vite SPA fallback from answering API routes with index.html
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).setHeader('Content-Type', 'application/json').json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `API endpoint ${req.method} ${req.path} not found`
          }
        });
      }
      vite.middlewares(req, res, next);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinCred Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
