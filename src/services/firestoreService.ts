import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { Customer, LoanApplication, Banner, AdminSettings, ApplicationStatus, ActivityLog, LoanOption, PartnerPlatform } from '../types.js';

// ==========================================
// REAL-TIME FIRESTORE SUBSCRIPTIONS
// ==========================================

function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

/**
 * Real-time listener for all Customers in Firestore.
 * Automatically receives newly submitted customers without page refresh.
 */
export function subscribeToCustomers(
  onSuccess: (customers: (Customer & { applicationCount?: number })[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const customersCol = collection(db, 'customers');

    return onSnapshot(
      customersCol,
      (snapshot) => {
        const list: Customer[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Customer;
          list.push({
            ...data,
            customerId: data.customerId || docSnap.id
          });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onSuccess(list);
      },
      (error) => {
        console.error('Firestore real-time customers subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to initiate customer snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for all Applications in Firestore.
 * Updates immediately when customer submits a new loan request.
 */
export function subscribeToApplications(
  onSuccess: (applications: LoanApplication[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const appsCol = collection(db, 'applications');

    return onSnapshot(
      appsCol,
      (snapshot) => {
        const list: LoanApplication[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LoanApplication;
          list.push({
            ...data,
            applicationId: data.applicationId || docSnap.id
          });
        });
        list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
        onSuccess(list);
      },
      (error) => {
        console.error('Firestore real-time applications subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to initiate application snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for Homepage Banners in Firestore.
 */
export function subscribeToBanners(
  onSuccess: (banners: Banner[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const bannersCol = collection(db, 'banners');
    return onSnapshot(
      bannersCol,
      (snapshot) => {
        const list: Banner[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Banner;
          list.push({
            ...data,
            bannerId: data.bannerId || docSnap.id
          });
        });
        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        onSuccess(list);
      },
      (error) => {
        console.error('Firestore real-time banners subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to initiate banner snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for Loan Options in Firestore.
 * Automatically receives live option and referral URL updates without page refresh.
 */
export function subscribeToLoanOptions(
  onSuccess: (options: LoanOption[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const optionsCol = collection(db, 'loan_options');
    return onSnapshot(
      optionsCol,
      (snapshot) => {
        const list: LoanOption[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LoanOption;
          list.push({
            ...data,
            optionId: data.optionId || docSnap.id
          });
        });
        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        onSuccess(list);
      },
      (error) => {
        console.error('Firestore real-time loan options subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to initiate loan options snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for Partner Platforms in Firestore.
 * Updates partner platforms and verified lenders live.
 */
export function subscribeToPartnerPlatforms(
  onSuccess: (platforms: PartnerPlatform[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const col = collection(db, 'partner_platforms');
    return onSnapshot(
      col,
      (snapshot) => {
        const list: PartnerPlatform[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as PartnerPlatform;
          list.push({
            ...data,
            platformId: data.platformId || docSnap.id
          });
        });
        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        onSuccess(list);
      },
      (error) => {
        console.warn('Firestore real-time partner platforms subscription notice:', error?.message || error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Failed to initiate partner platforms snapshot listener:', err?.message || err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for Partner Settings in Firestore.
 */
export function subscribeToSettings(
  onSuccess: (settings: AdminSettings) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const settingsDoc = doc(db, 'settings', 'global');
    return onSnapshot(
      settingsDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          onSuccess(snapshot.data() as AdminSettings);
        }
      },
      (error) => {
        console.error('Firestore real-time settings subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to initiate settings snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time listener for Activity Logs in Firestore.
 * Automatically receives live user interactions, logins, applications from any device/location.
 */
export function subscribeToActivities(
  onSuccess: (activities: ActivityLog[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const activitiesCol = collection(db, 'activity_logs');
    return onSnapshot(
      activitiesCol,
      (snapshot) => {
        const list: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ActivityLog;
          list.push({
            ...data,
            id: data.id || docSnap.id
          });
        });
        list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        onSuccess(list);
      },
      (error) => {
        console.error('Firestore real-time activities subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to initiate activities snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

export async function saveActivityToFirestore(activity: Omit<ActivityLog, 'id'>): Promise<ActivityLog> {
  const logId = `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const record: ActivityLog = {
    ...activity,
    id: logId,
    timestamp: activity.timestamp || new Date().toISOString()
  };

  try {
    const logRef = doc(db, 'activity_logs', logId);
    await setDoc(logRef, cleanForFirestore(record));
    return record;
  } catch (error: any) {
    console.error('Failed to save activity to Firestore:', error);
    return record;
  }
}

// ==========================================
// FIRESTORE CRUD OPERATIONS (DIRECT WRITES)
// ==========================================

/**
 * Save or register a new customer in Firestore.
 */
export async function saveCustomerToFirestore(customer: Customer): Promise<Customer> {
  const customerId = customer.customerId || `cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const record: Customer = {
    ...customer,
    customerId,
    fullName: String(customer.fullName || '').trim(),
    mobileNumber: String(customer.mobileNumber || '').trim(),
    createdAt: customer.createdAt || now,
    updatedAt: now
  };

  try {
    const customerRef = doc(db, 'customers', customerId);
    await setDoc(customerRef, cleanForFirestore(record), { merge: true });
    return record;
  } catch (error: any) {
    console.error('Failed to save customer to Firestore:', error);
    throw new Error(`Database write failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Update an existing customer record in Firestore.
 */
export async function updateCustomerInFirestore(
  customerId: string,
  updates: Partial<Customer>
): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const now = new Date().toISOString();
    await updateDoc(customerRef, cleanForFirestore({
      ...updates,
      updatedAt: now
    }));
  } catch (error: any) {
    console.error(`Failed to update customer ${customerId} in Firestore:`, error);
    throw new Error(`Database update failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Delete a customer and their loan applications permanently from Firestore.
 */
export async function deleteCustomerFromFirestore(customerId: string): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await deleteDoc(customerRef);

    // Also remove any applications associated with this customer
    const appsCol = collection(db, 'applications');
    const appsSnap = await getDocs(appsCol);
    const deletePromises: Promise<void>[] = [];

    appsSnap.forEach((docSnap) => {
      const appData = docSnap.data() as LoanApplication;
      if (appData.customerId === customerId) {
        deletePromises.push(deleteDoc(doc(db, 'applications', docSnap.id)));
      }
    });

    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error(`Failed to delete customer ${customerId} from Firestore:`, error);
    throw new Error(`Database delete failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Save a new loan application in Firestore.
 */
export async function saveApplicationToFirestore(app: LoanApplication): Promise<LoanApplication> {
  const applicationId = app.applicationId || `FC-APP-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  const record: LoanApplication = {
    ...app,
    applicationId,
    submittedAt: app.submittedAt || now,
    updatedAt: now
  };

  try {
    const appRef = doc(db, 'applications', applicationId);
    await setDoc(appRef, cleanForFirestore(record), { merge: true });
    return record;
  } catch (error: any) {
    console.error('Failed to save application to Firestore:', error);
    throw new Error(`Database write failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Update internal application tracking status in Firestore.
 */
export async function updateApplicationStatusInFirestore(
  applicationId: string,
  status: ApplicationStatus
): Promise<void> {
  try {
    const appRef = doc(db, 'applications', applicationId);
    const now = new Date().toISOString();
    await updateDoc(appRef, cleanForFirestore({
      status,
      updatedAt: now
    }));
  } catch (error: any) {
    console.error(`Failed to update application status for ${applicationId}:`, error);
    throw new Error(`Status update failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Delete an application record from Firestore.
 */
export async function deleteApplicationFromFirestore(applicationId: string): Promise<void> {
  try {
    const appRef = doc(db, 'applications', applicationId);
    await deleteDoc(appRef);
  } catch (error: any) {
    console.error(`Failed to delete application ${applicationId} from Firestore:`, error);
    throw new Error(`Delete failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Save a promotional banner to Firestore.
 */
export async function saveBannerToFirestore(banner: Banner): Promise<Banner> {
  const bannerId = banner.bannerId || `banner-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const record: Banner = {
    ...banner,
    bannerId,
    createdAt: banner.createdAt || now
  };

  try {
    const bannerRef = doc(db, 'banners', bannerId);
    await setDoc(bannerRef, cleanForFirestore(record), { merge: true });
    return record;
  } catch (error: any) {
    console.error('Failed to save banner to Firestore:', error);
    throw new Error(`Banner save failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Delete a banner from Firestore.
 */
export async function deleteBannerFromFirestore(bannerId: string): Promise<void> {
  try {
    const bannerRef = doc(db, 'banners', bannerId);
    await deleteDoc(bannerRef);
  } catch (error: any) {
    console.error(`Failed to delete banner ${bannerId} from Firestore:`, error);
    throw new Error(`Banner delete failed: ${error.message || 'Unknown Firestore error'}`);
  }
}

/**
 * Save partner settings to Firestore.
 */
export async function saveSettingsToFirestore(settings: AdminSettings): Promise<AdminSettings> {
  const now = new Date().toISOString();
  const record: AdminSettings = {
    ...settings,
    updatedAt: now
  };

  try {
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, cleanForFirestore(record), { merge: true });
    return record;
  } catch (error: any) {
    console.error('Failed to save settings to Firestore:', error);
    throw new Error(`Settings save failed: ${error.message || 'Unknown Firestore error'}`);
  }
}
