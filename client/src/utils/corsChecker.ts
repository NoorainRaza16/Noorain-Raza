// CORS checker utility for ensuring API availability across domains
export const checkCORSConfiguration = async () => {
  const endpoints = [
    '/api/hero',
    '/api/seo/metrics',
    '/api/skills',
    '/api/projects'
  ];

  const corsResults = {
    allWorking: true,
    issues: [] as string[],
    workingEndpoints: [] as string[],
    failedEndpoints: [] as string[]
  };

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        corsResults.workingEndpoints.push(endpoint);
      } else {
        corsResults.failedEndpoints.push(endpoint);
        corsResults.allWorking = false;
        corsResults.issues.push(`${endpoint}: HTTP ${response.status}`);
      }
    } catch (error) {
      corsResults.failedEndpoints.push(endpoint);
      corsResults.allWorking = false;
      corsResults.issues.push(`${endpoint}: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  return corsResults;
};

export const testCrossOriginRequest = async (targetDomain: string) => {
  try {
    // Test preflight request
    const preflightResponse = await fetch(`${targetDomain}/api/hero`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    if (!preflightResponse.ok) {
      throw new Error(`Preflight failed: ${preflightResponse.status}`);
    }

    // Test actual request
    const actualResponse = await fetch(`${targetDomain}/api/hero`, {
      method: 'GET',
      credentials: 'include'
    });

    return {
      success: actualResponse.ok,
      status: actualResponse.status,
      headers: Object.fromEntries(actualResponse.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Real-time CORS monitoring for domain changes
export const initCORSMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  const logCORSStatus = () => {
    checkCORSConfiguration().then(results => {
      if (results.allWorking) {
        console.log('✅ All API endpoints working correctly');
      } else {
        console.warn('⚠️ CORS Issues detected:', results.issues);
      }
    });
  };

  // Check on page load
  logCORSStatus();

  // Monitor for domain changes
  let currentDomain = window.location.origin;
  setInterval(() => {
    if (window.location.origin !== currentDomain) {
      currentDomain = window.location.origin;
      console.log(`🔄 Domain changed to: ${currentDomain}`);
      logCORSStatus();
    }
  }, 5000);
};