// Dynamic domain utilities for custom domain adaptation
export const getDynamicDomain = (): string => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return 'https://noorain.me';
};

export const getDynamicCanonicalUrl = (path: string = ''): string => {
  const domain = getDynamicDomain();
  return `${domain}${path}`;
};

export const adaptUrlsForDomain = (urls: Record<string, string>): Record<string, string> => {
  const currentDomain = getDynamicDomain();
  const adaptedUrls: Record<string, string> = {};
  
  Object.entries(urls).forEach(([key, url]) => {
    // Replace any hardcoded domain with current domain
    adaptedUrls[key] = url.replace(/https:\/\/[^\/]+/, currentDomain);
  });
  
  return adaptedUrls;
};

export const getAdaptedSocialUrls = () => {
  const domain = getDynamicDomain();
  return {
    og: `${domain}/assets/demo.png`,
    twitter: `${domain}/assets/demo.png`,
    profile: `${domain}/profile/profile-photo.jpg`,
    logo: `${domain}/images/logo.svg`
  };
};

// Domain-aware meta tag generator
export const generateDomainAwareMeta = () => {
  const domain = getDynamicDomain();
  
  return {
    canonical: domain,
    ogUrl: domain,
    twitterUrl: domain,
    sameAs: [
      "https://github.com/NoorainRaza23",
      "https://linkedin.com/in/noorainraza"
    ],
    mainEntityOfPage: `${domain}/#person`,
    websiteId: `${domain}/#website`,
    profilePageId: `${domain}/#profilepage`,
    organizationId: `${domain}/#organization`
  };
};