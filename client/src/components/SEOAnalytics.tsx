import { useEffect } from 'react';

interface SEOAnalyticsProps {
  pageName?: string;
  userId?: string;
}

const SEOAnalytics = ({ pageName = 'home', userId }: SEOAnalyticsProps) => {
  
  useEffect(() => {
    // Google Analytics 4 enhanced tracking
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: 'Portfolio',
        content_group2: pageName,
        user_id: userId
      });
      
      // Enhanced ecommerce for portfolio engagement
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: 'Noorain Raza Portfolio',
        custom_parameter_1: 'portfolio_interaction'
      });
    }
    
    // Microsoft Clarity tracking
    const clarity = (window as any).clarity;
    if (clarity) {
      clarity('identify', userId || 'anonymous');
      clarity('set', 'page_name', pageName);
      clarity('set', 'user_type', 'portfolio_visitor');
    }
    
    // Core Web Vitals monitoring
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (gtag && lastEntry) {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: Math.round(lastEntry.startTime),
            custom_parameter_1: 'performance_metric'
          });
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for older browsers
      }
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (gtag) {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'CLS',
            value: Math.round(clsValue * 1000),
            custom_parameter_1: 'performance_metric'
          });
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Fallback for older browsers
      }
    };
    
    // Initialize Web Vitals monitoring
    if (typeof window !== 'undefined') {
      observeWebVitals();
    }
    
    // SEO-specific event tracking
    const trackSEOEvents = () => {
      // Track scroll depth for engagement
      let maxScroll = 0;
      const trackScroll = () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          // Track milestone scroll depths
          if ([25, 50, 75, 90].includes(scrollPercent) && gtag) {
            gtag('event', 'scroll', {
              event_category: 'Engagement',
              event_label: `${scrollPercent}% Scroll`,
              value: scrollPercent,
              custom_parameter_1: 'user_engagement'
            });
          }
        }
      };
      
      window.addEventListener('scroll', trackScroll, { passive: true });
      
      // Track time on page
      const startTime = Date.now();
      const trackTimeOnPage = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        if (gtag && timeSpent > 10) { // Only track if user spent more than 10 seconds
          gtag('event', 'timing_complete', {
            event_category: 'Engagement',
            event_label: 'Time on Page',
            value: timeSpent,
            custom_parameter_1: 'user_engagement'
          });
        }
      };
      
      // Track when user leaves page
      window.addEventListener('beforeunload', trackTimeOnPage);
      
      return () => {
        window.removeEventListener('scroll', trackScroll);
        window.removeEventListener('beforeunload', trackTimeOnPage);
      };
    };
    
    const cleanup = trackSEOEvents();
    
    return cleanup;
  }, [pageName, userId]);
  
  // Schema.org structured data injection for better search visibility
  useEffect(() => {
    const injectBreadcrumbSchema = () => {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://noorain.me/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Noorain Raza",
            "item": "https://noorain.me/"
          }
        ]
      };
      
      let breadcrumbScript = document.querySelector('script[data-schema="breadcrumb"]') as HTMLScriptElement | null;
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        (breadcrumbScript as HTMLScriptElement).type = 'application/ld+json';
        breadcrumbScript.setAttribute('data-schema', 'breadcrumb');
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    };
    
    const injectOrganizationSchema = () => {
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://noorain.me/#person",
        "name": "Noorain Raza",
        "alternateName": ["Noorain", "Raza"],
        "url": "https://noorain.me",
        "image": "https://noorain.me/profile/profile-photo.jpg",
        "sameAs": [
          "https://github.com/NoorainRaza23",
          "https://linkedin.com/in/noorainraza"
        ],
        "jobTitle": "Computer Science Engineering Student",
        "worksFor": {
          "@type": "EducationalOrganization",
          "name": "Asansol Engineering College"
        },
        "alumniOf": {
          "@type": "CollegeOrUniversity",
          "name": "Asansol Engineering College"
        },
        "knowsAbout": [
          "Python Programming",
          "JavaScript",
          "React.js",
          "Artificial Intelligence",
          "Machine Learning",
          "Cloud Computing",
          "Software Development"
        ]
      };
      
      let orgScript = document.querySelector('script[data-schema="organization"]') as HTMLScriptElement | null;
      if (!orgScript) {
        orgScript = document.createElement('script');
        (orgScript as HTMLScriptElement).type = 'application/ld+json';
        orgScript.setAttribute('data-schema', 'organization');
        document.head.appendChild(orgScript);
      }
      orgScript.textContent = JSON.stringify(organizationSchema);
    };
    
    injectBreadcrumbSchema();
    injectOrganizationSchema();
  }, []);

  return null;
};

export default SEOAnalytics;