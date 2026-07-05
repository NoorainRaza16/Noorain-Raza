import { useEffect } from 'react';

interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  alternateUrls?: { [key: string]: string };
}

const SEOMetaTags = ({
  title = "Noorain Raza - Computer Science Engineering Student | Passionate DevOps Engineer | Shillong, Meghalaya",
  description = "Noorain Raza from Shillong, Meghalaya - Computer Science Engineering student specializing in AI, Cloud technologies, Python, React, and software development. Providing innovative tech solutions globally from Northeast India.",
  keywords = "Noorain Raza, Noorain, Raza Noorain, Noorain Raza portfolio, Noorain developer, Noorain AI specialist, Computer Science Engineering, AI specialist India, Cloud technologies expert, Python developer India, React developer Shillong, JavaScript expert, Shillong developer, Meghalaya tech expert, Northeast India developer, Indian AI specialist, best developer Northeast India, Asansol Engineering College, software development expert, portfolio website, student developer, machine learning expert Northeast India, AWS cloud specialist India, Docker Kubernetes expert, India software engineer, global tech services, full stack developer, MERN stack expert, artificial intelligence specialist India, data science expert, web developer India, AI machine learning expert Shillong Meghalaya, Python React developer India Noorain Raza, software engineering portfolio Noorain, tech expert Asia, web developer Asia, technology consultant India",
  image = "https://noorain-raza-portfolio.onrender.com/profile/profile-photo.jpg",
  url = "https://noorain-raza-portfolio.onrender.com",
  canonical,
  alternateUrls = {}
}: SEOMetaTagsProps) => {
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Update or create meta tags
    const updateOrCreateMeta = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateOrCreateMeta('description', description);
    updateOrCreateMeta('keywords', keywords);
    updateOrCreateMeta('author', 'Noorain Raza');
    updateOrCreateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateOrCreateMeta('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateOrCreateMeta('bingbot', 'index, follow');
    updateOrCreateMeta('theme-color', '#3b82f6');
    
    // Geographic and language tags - Shillong, Meghalaya
    updateOrCreateMeta('geo.region', 'IN-ML');
    updateOrCreateMeta('geo.placename', 'Shillong, Meghalaya, India');
    updateOrCreateMeta('geo.position', '25.5788;91.8933');
    updateOrCreateMeta('ICBM', '25.5788, 91.8933');
    updateOrCreateMeta('geo.country', 'India');
    updateOrCreateMeta('geo.locality', 'Shillong');
    updateOrCreateMeta('geo.region-subdivision', 'Meghalaya');
    updateOrCreateMeta('language', 'en');
    updateOrCreateMeta('content-language', 'en');
    
    // Social media optimization
    updateOrCreateMeta('og:type', 'profile', true);
    updateOrCreateMeta('og:title', title, true);
    updateOrCreateMeta('og:description', description, true);
    updateOrCreateMeta('og:image', image, true);
    updateOrCreateMeta('og:image:alt', 'Noorain Raza - Passionate DevOps Engineer Portfolio', true);
    updateOrCreateMeta('og:url', url, true);
    updateOrCreateMeta('og:site_name', 'Noorain Raza Portfolio', true);
    updateOrCreateMeta('og:locale', 'en_US', true);
    updateOrCreateMeta('og:profile:first_name', 'Noorain', true);
    updateOrCreateMeta('og:profile:last_name', 'Raza', true);
    updateOrCreateMeta('og:profile:username', 'noorain-raza', true);
    updateOrCreateMeta('og:profile:gender', 'male', true);
    
    // Twitter/X optimization
    updateOrCreateMeta('twitter:card', 'summary_large_image', true);
    updateOrCreateMeta('twitter:site', '@NoorainRaza23', true);
    updateOrCreateMeta('twitter:creator', '@NoorainRaza23', true);
    updateOrCreateMeta('twitter:title', title, true);
    updateOrCreateMeta('twitter:description', description, true);
    updateOrCreateMeta('twitter:image', image, true);
    updateOrCreateMeta('twitter:image:alt', 'Noorain Raza - AI & Cloud Specialist Portfolio', true);
    
    // LinkedIn optimization
    updateOrCreateMeta('linkedin:owner', 'noorain-raza');
    
    // Update or create link tags
    const updateOrCreateLink = (rel: string, href: string, additional?: { [key: string]: string }) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
      if (additional) {
        Object.entries(additional).forEach(([key, value]) => {
          link!.setAttribute(key, value);
        });
      }
    };

    // Canonical URL
    const canonicalUrl = canonical || url;
    updateOrCreateLink('canonical', canonicalUrl);
    
    // Alternate language versions
    updateOrCreateLink('alternate', url, { hreflang: 'en' });
    updateOrCreateLink('alternate', url, { hreflang: 'x-default' });
    
    // Additional alternate URLs
    Object.entries(alternateUrls).forEach(([lang, langUrl]) => {
      updateOrCreateLink('alternate', langUrl, { hreflang: lang });
    });
    
    // Preconnect to external domains for performance
    updateOrCreateLink('preconnect', 'https://fonts.googleapis.com');
    updateOrCreateLink('preconnect', 'https://fonts.gstatic.com', { crossorigin: 'anonymous' });
    updateOrCreateLink('dns-prefetch', 'https://github.com');
    updateOrCreateLink('dns-prefetch', 'https://linkedin.com');
    
    // Favicon and app icons
    updateOrCreateLink('icon', '/favicon.ico', { type: 'image/x-icon', sizes: '16x16 32x32' });
    updateOrCreateLink('apple-touch-icon', '/apple-touch-icon.png', { sizes: '180x180' });
    updateOrCreateLink('manifest', '/site.webmanifest');
    
  }, [title, description, keywords, image, url, canonical, alternateUrls]);

  return null;
};

export default SEOMetaTags;