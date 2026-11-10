// ---------------------------------------------------------------------------
// KyU Connect Session & Token Manager
// Provides session-bound authentication tokens (stored in sessionStorage)
// with automatic sign-out on browser/tab close and a 1-hour inactivity timeout.
// This prevents stale tokens from remaining and causing HTTP 401 errors.
// ---------------------------------------------------------------------------

const AUTH_TOKEN_KEY = 'kyu:auth_token';
const REFRESH_TOKEN_KEY = 'kyu:refresh_token';
const USER_PROFILE_KEY = 'kyu:profile';
const LAST_ACTIVE_KEY = 'kyu:last_active_at';
const SESSION_NOTICE_KEY = 'kyu:session_notice';

// 1 hour of inactivity = 60 minutes * 60 seconds * 1000 milliseconds
export const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;

// Throttle user activity writes so we don't spam storage on every mouse move
let lastRecordedTime = 0;
const ACTIVITY_RECORD_THROTTLE_MS = 15_000; // 15 seconds

// Purge any legacy persistent tokens stored in localStorage on initial script load.
// This guarantees old tokens from past sessions cannot linger and cause 401 errors.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Record user activity timestamp in sessionStorage.
 */
export function recordActivity(force = false): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (!force && now - lastRecordedTime < ACTIVITY_RECORD_THROTTLE_MS) {
    return;
  }
  lastRecordedTime = now;
  try {
    window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(now));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if the current authenticated session has expired due to 1 hour of inactivity.
 */
export function isSessionExpired(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;

    const lastActiveRaw = window.sessionStorage.getItem(LAST_ACTIVE_KEY);
    if (!lastActiveRaw) {
      // Token exists but no timestamp recorded; start tracking now
      recordActivity(true);
      return false;
    }

    const lastActive = Number(lastActiveRaw);
    if (Number.isNaN(lastActive)) return false;

    return Date.now() - lastActive > INACTIVITY_TIMEOUT_MS;
  } catch {
    return false;
  }
}

export type SignOutReason = 'inactivity' | 'unauthorized' | 'manual';

/**
 * Clear session tokens and dispatch a signout event.
 */
export function clearSession(reason: SignOutReason = 'manual'): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.removeItem(USER_PROFILE_KEY);
    window.sessionStorage.removeItem(LAST_ACTIVE_KEY);

    // Also ensure localStorage is clean
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);

    if (reason === 'inactivity') {
      window.sessionStorage.setItem(
        SESSION_NOTICE_KEY,
        'You have been automatically signed out due to 1 hour of inactivity.'
      );
    } else if (reason === 'unauthorized') {
      window.sessionStorage.setItem(
        SESSION_NOTICE_KEY,
        'Your session has expired. Please sign in again.'
      );
    }
  } catch {
    // Ignore
  }

  window.dispatchEvent(new CustomEvent('kyu:auth_signout', { detail: { reason } }));
}

/**
 * Retrieve the active access token.
 * Returns null and clears session if 1 hour of inactivity has passed.
 */
export function getValidAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (isSessionExpired()) {
    clearSession('inactivity');
    return null;
  }
  try {
    return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieve the active refresh token.
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (isSessionExpired()) {
    clearSession('inactivity');
    return null;
  }
  try {
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save authentication tokens to sessionStorage and initialize activity tracking.
 */
export function setSession(
  accessToken: string,
  refreshToken?: string | null,
  profile?: unknown
): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    if (refreshToken) {
      window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (profile) {
      window.sessionStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    }
    window.sessionStorage.removeItem(SESSION_NOTICE_KEY);
    recordActivity(true);
  } catch {
    // Ignore
  }
}

/**
 * Retrieve the notice message (e.g. inactivity logout notice) and clear it.
 */
export function consumeSessionNotice(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const notice = window.sessionStorage.getItem(SESSION_NOTICE_KEY);
    if (notice) {
      window.sessionStorage.removeItem(SESSION_NOTICE_KEY);
      return notice;
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Set up user activity listeners and periodic inactivity checks.
 * Returns a cleanup function.
 */
export function initSessionTracker(onSignOut?: (reason: SignOutReason) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUserActivity = () => {
    // Only track activity if a user is currently logged in
    try {
      if (window.sessionStorage.getItem(AUTH_TOKEN_KEY)) {
        recordActivity(false);
      }
    } catch {
      // Ignore
    }
  };

  const checkExpiration = () => {
    if (isSessionExpired()) {
      clearSession('inactivity');
      if (onSignOut) onSignOut('inactivity');
    }
  };

  // Activity events
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  activityEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserActivity, { passive: true });
  });

  // Check immediately when page becomes visible or focused
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkExpiration();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', checkExpiration);

  // Periodic check every 15 seconds
  const intervalId = window.setInterval(checkExpiration, 15_000);

  // Initial check on load
  checkExpiration();

  return () => {
    activityEvents.forEach((evt) => {
      window.removeEventListener(evt, handleUserActivity);
    });
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', checkExpiration);
    window.clearInterval(intervalId);
  };
}

