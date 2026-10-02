import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { CustomerNotification } from '../types.js';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('fincred_push_permission', 'granted');
      return true;
    }
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
  }
  return false;
}

export function showBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    actionUrl?: string;
    data?: any;
  }
): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const defaultIcon = '/icon.svg';
  const defaultBadge = '/icon.svg';

  try {
    // Try service worker showNotification first (for PWA / mobile Chrome background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body: options?.body || '',
          icon: options?.icon || defaultIcon,
          badge: options?.badge || defaultBadge,
          tag: options?.tag || `fincred-${Date.now()}`,
          data: {
            url: options?.actionUrl || '/dashboard'
          }
        });
      }).catch(() => {
        // Fallback to new Notification
        const notif = new Notification(title, {
          body: options?.body || '',
          icon: options?.icon || defaultIcon,
          badge: options?.badge || defaultBadge,
          tag: options?.tag
        });
        notif.onclick = () => {
          window.focus();
          if (options?.actionUrl) {
            window.location.href = options.actionUrl;
          }
        };
      });
      return;
    }

    // Standard Window Notification
    const notif = new Notification(title, {
      body: options?.body || '',
      icon: options?.icon || defaultIcon,
      badge: options?.badge || defaultBadge,
      tag: options?.tag
    });

    notif.onclick = () => {
      window.focus();
      if (options?.actionUrl) {
        window.location.href = options.actionUrl;
      }
    };
  } catch (err) {
    console.warn('Could not display browser notification:', err);
  }
}

/**
 * Real-time listener for incoming broadcast & admin notifications from Firestore.
 * Triggers native Chrome notification when received if permission is granted.
 */
export function listenForLiveNotifications(
  customerId?: string,
  mobileNumber?: string,
  onNotificationReceived?: (notif: CustomerNotification) => void
): () => void {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, orderBy('timestamp', 'desc'), limit(10));

    let isInitialLoad = true;

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (isInitialLoad) {
          isInitialLoad = false;
          return;
        }

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data() as CustomerNotification;
            const notif: CustomerNotification = {
              id: change.doc.id,
              customerId: data.customerId || 'ALL',
              target: data.target || 'ALL',
              title: data.title || 'FINCRED Alert',
              message: data.message || '',
              type: data.type || 'info',
              timestamp: data.timestamp || new Date().toISOString(),
              actionUrl: data.actionUrl || data.link || '/dashboard',
              sentBy: data.sentBy || 'Admin'
            };

            // Check if matches target
            const matches =
              notif.target === 'ALL' ||
              (customerId && notif.target === customerId) ||
              (mobileNumber && notif.target === mobileNumber);

            if (matches) {
              if (onNotificationReceived) {
                onNotificationReceived(notif);
              }
              // Trigger native browser notification
              showBrowserNotification(notif.title, {
                body: notif.message,
                actionUrl: notif.actionUrl
              });
            }
          }
        });
      },
      err => {
        console.warn('Firestore live notification listener error:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not set up notification listener:', err);
    return () => {};
  }
}
