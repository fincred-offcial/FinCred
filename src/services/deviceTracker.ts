import { ActivityLog } from '../types.js';
import { safeFetch } from './apiClient.js';

export interface DeviceMetadata {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  deviceSummary: string;
  os: string;
  browser: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

export function getClientDeviceMetadata(): DeviceMetadata {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'Desktop',
      deviceSummary: 'Server Environment',
      os: 'Server',
      browser: 'Node',
      screenResolution: '1920x1080',
      timezone: 'Asia/Kolkata',
      language: 'en'
    };
  }

  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';

  // Detect OS
  if (/Android/i.test(ua)) {
    os = 'Android';
    deviceType = 'Mobile';
    if (/Tablet|Nexus (7|9|10)|SM-T/i.test(ua)) {
      deviceType = 'Tablet';
    }
  } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
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
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
    deviceType = 'Desktop';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    deviceType = 'Desktop';
  }

  // Fallback screen-based check
  if (window.innerWidth <= 768 && deviceType === 'Desktop') {
    deviceType = 'Mobile';
  } else if (window.innerWidth <= 1024 && deviceType === 'Desktop' && 'ontouchstart' in window) {
    deviceType = 'Tablet';
  }

  // Detect Browser
  let browser = 'Unknown Browser';
  if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\/|CriOS\//i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Firefox\/|FxiOS\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browser = 'Opera';
  }

  const screenResolution = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;
  let timezone = 'Asia/Kolkata';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    // default
  }

  const deviceSummary = `${os} (${deviceType}) • ${browser}`;

  return {
    deviceType,
    deviceSummary,
    os,
    browser,
    screenResolution,
    timezone,
    language: navigator.language || 'en-IN'
  };
}

/**
 * Log user actions (login, registration, view, loan click, partner redirection, form interaction)
 * to both server and Firestore so admin sees live updates in real-time.
 */
export async function trackUserActivity(params: {
  action: string;
  details?: string;
  category?: 'application' | 'auth' | 'navigation' | 'partner_click' | 'profile' | 'system';
  customerId?: string;
  customerName?: string;
  mobileNumber?: string;
  location?: string;
  city?: string;
}): Promise<void> {
  try {
    const meta = getClientDeviceMetadata();
    await safeFetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        ...meta,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug('Telemetry track notice:', err);
  }
}
