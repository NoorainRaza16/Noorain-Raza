import React, { useEffect, useState } from 'react';
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface BrowserInfo {
  name: string;
  version: number;
  isModern: boolean;
}

/**
 * Component that checks browser compatibility and shows a warning for outdated browsers
 */
export function BrowserCompatibilityCheck() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if in browser environment
    if (typeof window !== 'undefined') {
      // Get browser information
      const ua = navigator.userAgent;
      let browserName = "Unknown";
      let browserVersion = 0;
      
      // Check for common browsers
      if (ua.indexOf("Chrome") > -1) {
        browserName = "Chrome";
        browserVersion = parseInt(ua.match(/Chrome\/([0-9]+)/)![1], 10);
      } else if (ua.indexOf("Firefox") > -1) {
        browserName = "Firefox";
        browserVersion = parseInt(ua.match(/Firefox\/([0-9]+)/)![1], 10);
      } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
        browserName = "Safari";
        browserVersion = parseInt(ua.match(/Version\/([0-9]+)/)![1], 10);
      } else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) {
        browserName = "Edge";
        browserVersion = parseInt(ua.match(/Edge\/([0-9]+)/)![1] || ua.match(/Edg\/([0-9]+)/)![1], 10);
      }

      // Determine if the browser is modern enough
      const isModern = (
        (browserName === "Chrome" && browserVersion >= 90) ||
        (browserName === "Firefox" && browserVersion >= 80) ||
        (browserName === "Safari" && browserVersion >= 14) ||
        (browserName === "Edge" && browserVersion >= 90)
      );

      setBrowserInfo({ name: browserName, version: browserVersion, isModern });
      
      // Check if the user previously dismissed this alert
      const dismissed = localStorage.getItem('browser-check-dismissed');
      if (dismissed === 'true') {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('browser-check-dismissed', 'true');
  };

  if (!browserInfo || browserInfo.isModern || dismissed) {
    return null;
  }

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 max-w-md z-50">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Browser Compatibility Warning</AlertTitle>
      <AlertDescription>
        You are using an outdated version of {browserInfo.name} (v{browserInfo.version}).
        For the best experience, please update your browser to the latest version.
      </AlertDescription>
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Dismiss"
      >
        ×
      </button>
    </Alert>
  );
}

export default BrowserCompatibilityCheck;