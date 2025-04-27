// src/components/AnalyticsTracker.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// IMPORTANT: Replace with your actual Measurement ID
const GA_MEASUREMENT_ID = 'G-N0N1ZVSC95';

// Extend the Window interface to include gtag
declare global {
    interface Window {
        gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    }
}

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if gtag function is available (loaded from index.html)
    if (typeof window.gtag === 'function') {
      // Send a pageview event to Google Analytics
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search, // Send full path including query params
        page_title: document.title // Optional: Send the current document title
      });
      console.log(`GA Pageview sent for: ${location.pathname + location.search}`); // For debugging
    } else {
       console.warn("gtag function not found. Ensure Google Analytics script is loaded correctly in index.html.");
    }
  }, [location]); // Re-run this effect whenever the location changes

  return null; // This component doesn't render anything visible
};

export default AnalyticsTracker;