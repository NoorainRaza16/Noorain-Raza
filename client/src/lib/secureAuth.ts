// Secure authentication utilities for client-side security

export interface SecureLoginData {
  username: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Secure fetch wrapper with CSRF protection and secure cookie handling
export const secureApiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  };

  const secureOptions: RequestInit = {
    ...options,
    credentials: 'include', // Include secure cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, secureOptions);

  return response;
};

// Session management for secure authentication
const updateAuthStatus = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    sessionStorage.setItem('auth-status', 'authenticated');
    sessionStorage.setItem('auth-timestamp', Date.now().toString());
  } else {
    clearAuthData();
  }
};

// Secure login function with enhanced security
export const secureLogin = async (credentials: SecureLoginData) => {
  try {
    const response = await secureApiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Authentication failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Authentication failed');
    }

    updateAuthStatus(true);
    return data.user;
  } catch (error) {
    updateAuthStatus(false);
    throw error;
  }
};

// Secure logout function
export const secureLogout = async () => {
  try {
    await secureApiRequest('/api/logout', {
      method: 'POST',
    });
  } finally {
    // Always clear client-side auth data
    clearAuthData();
  }
};

// Check authentication status securely
export const checkAuthStatus = async () => {
  try {
    const response = await secureApiRequest('/api/user');
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        // Update auth status indicators
        sessionStorage.setItem('auth-status', 'authenticated');
        sessionStorage.setItem('auth-timestamp', Date.now().toString());
        console.log('Authentication verified for user:', data.user.username);
        return data.user;
      }
    }
    
    // Only clear auth data if it's a 401 response (unauthorized)
    if (response.status === 401) {
      console.log('Session expired, clearing auth data');
      clearAuthData();
    } else {
      console.log('Auth check failed with status:', response.status);
    }
    return null;
  } catch (error) {
    console.error('Auth check error:', error);
    // Don't clear auth data on network errors - preserve sessions
    return null;
  }
};

// Clear all client-side authentication data
const clearAuthData = () => {
  sessionStorage.removeItem('auth-status');
  sessionStorage.removeItem('auth-timestamp');
  sessionStorage.removeItem('csrf-token');
  
  // Also clear any legacy localStorage tokens
  localStorage.removeItem('admin_auth_token');
};

// Security monitoring utilities
export const isSessionValid = (): boolean => {
  const authStatus = sessionStorage.getItem('auth-status');
  const authTimestamp = sessionStorage.getItem('auth-timestamp');
  
  if (!authStatus || !authTimestamp) {
    return false;
  }
  
  // Check if session is too old (4 hours max for client-side check)
  const sessionAge = Date.now() - parseInt(authTimestamp);
  const maxAge = 4 * 60 * 60 * 1000; // 4 hours
  
  if (sessionAge > maxAge) {
    clearAuthData();
    return false;
  }
  
  return authStatus === 'authenticated';
};

// Security headers validation
export const validateSecurityHeaders = (response: Response): boolean => {
  const requiredHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];
  
  return requiredHeaders.every(header => response.headers.has(header));
};

// Content Security Policy helper
export const reportCSPViolation = (violationEvent: SecurityPolicyViolationEvent) => {
  console.warn('CSP Violation:', violationEvent.violatedDirective);
  
  // In production, you might want to send this to your monitoring service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'csp-report': {
          'document-uri': violationEvent.documentURI,
          'referrer': violationEvent.referrer,
          'violated-directive': violationEvent.violatedDirective,
          'effective-directive': violationEvent.effectiveDirective,
          'original-policy': violationEvent.originalPolicy,
          'blocked-uri': violationEvent.blockedURI,
          'status-code': violationEvent.statusCode,
          'line-number': violationEvent.lineNumber,
          'column-number': violationEvent.columnNumber,
        }
      })
    }).catch(() => {
      // Silently fail CSP reporting
    });
  }
};

// Initialize security monitoring
export const initSecurityMonitoring = () => {
  // Listen for CSP violations
  document.addEventListener('securitypolicyviolation', reportCSPViolation);
  
  // Monitor for suspicious activity
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Check security headers on responses
    if (!validateSecurityHeaders(response)) {
      console.warn('Response missing required security headers');
    }
    
    return response;
  };
  
  // Clear auth data on page unload
  window.addEventListener('beforeunload', () => {
    // Only clear temporary session indicators, not persistent auth
    // The server-side session will handle persistence
  });
  
  console.log('Security monitoring initialized');
};