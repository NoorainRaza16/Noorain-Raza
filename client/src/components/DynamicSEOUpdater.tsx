import { useEffect } from 'react';
import { getDynamicDomain } from '../utils/domainUtils';
import { initCORSMonitoring } from '../utils/corsChecker';

const DynamicSEOUpdater = () => {
  useEffect(() => {
    const updateDynamicSEO = () => {
      const currentDomain = getDynamicDomain();
      
      // Update canonical URL
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', currentDomain);
      }
      
      // Update Open Graph URL
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', currentDomain);
      }
      
      // Update Twitter URL
      const twitterUrl = document.querySelector('meta[property="twitter:url"]');
      if (twitterUrl) {
        twitterUrl.setAttribute('content', currentDomain);
      }
      
      // Update hreflang links
      const hreflangLinks = document.querySelectorAll('link[hreflang]');
      hreflangLinks.forEach(link => {
        const hreflang = link.getAttribute('hreflang');
        if (hreflang !== 'x-default') {
          link.setAttribute('href', currentDomain);
        } else {
          link.setAttribute('href', currentDomain);
        }
      });
      
      // Update image URLs to use current domain
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        const currentImage = ogImage.getAttribute('content');
        if (currentImage && currentImage.includes('noorain-raza-portfolio.onrender.com')) {
          const newImage = currentImage.replace(/https:\/\/[^\/]+/, currentDomain);
          ogImage.setAttribute('content', newImage);
        }
      }
      
      const twitterImage = document.querySelector('meta[property="twitter:image"]');
      if (twitterImage) {
        const currentImage = twitterImage.getAttribute('content');
        if (currentImage && currentImage.includes('noorain-raza-portfolio.onrender.com')) {
          const newImage = currentImage.replace(/https:\/\/[^\/]+/, currentDomain);
          twitterImage.setAttribute('content', newImage);
        }
      }
      
      console.log(`🔄 SEO URLs updated for domain: ${currentDomain}`);
    };
    
    // Update on component mount
    updateDynamicSEO();
    
    // Initialize CORS monitoring
    initCORSMonitoring();
    
    // Listen for domain changes (useful for development)
    window.addEventListener('popstate', updateDynamicSEO);
    
    return () => {
      window.removeEventListener('popstate', updateDynamicSEO);
    };
  }, []);
  
  return null;
};

export default DynamicSEOUpdater;