import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

const SEOHead = ({
  title = "Noorain Raza - Computer Science Engineering Student | Passionate DevOps Engineer | Portfolio",
  description = "Noorain Raza - Computer Science Engineering student at Asansol Engineering College specializing in AI, Cloud technologies, Python, React, and software development. Explore innovative projects, technical skills, and professional experience.",
  keywords = "Noorain Raza, Noorain, Raza, Computer Science Engineering, AI specialist, Cloud technologies, Python developer, React developer, JavaScript, Asansol Engineering College, software development, portfolio, student developer, machine learning, AWS, Docker, Kubernetes, West Bengal developer, Indian software engineer, full stack developer, MERN stack, artificial intelligence, data science, web developer India",
  canonical = "https://noorain.me",
  image = "https://noorain.me/profile/profile-photo.jpg",
  type = "profile",
  publishedTime,
  modifiedTime,
  author = "Noorain Raza",
  section = "Portfolio"
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Update or create meta and link tags
    const updateMeta = (selector: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property')) {
          element.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        } else {
          element.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };
    
    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };
    
    // Core SEO meta tags
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[name="keywords"]', keywords);
    updateMeta('meta[name="author"]', author);
    updateMeta('meta[name="robots"]', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Geographic and language
    updateMeta('meta[name="geo.region"]', 'IN-WB');
    updateMeta('meta[name="geo.placename"]', 'West Bengal, India');
    updateMeta('meta[name="language"]', 'en');
    updateMeta('meta[name="content-language"]', 'en');
    
    // Open Graph
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:image"]', image);
    updateMeta('meta[property="og:image:alt"]', 'Noorain Raza - AI & Cloud Specialist Portfolio');
    updateMeta('meta[property="og:url"]', canonical);
    updateMeta('meta[property="og:type"]', type);
    updateMeta('meta[property="og:site_name"]', 'Noorain Raza Portfolio');
    updateMeta('meta[property="og:locale"]', 'en_US');
    
    if (type === 'article' && publishedTime) {
      updateMeta('meta[property="article:published_time"]', publishedTime);
    }
    if (type === 'article' && modifiedTime) {
      updateMeta('meta[property="article:modified_time"]', modifiedTime);
    }
    if (type === 'article' && author) {
      updateMeta('meta[property="article:author"]', author);
    }
    if (type === 'article' && section) {
      updateMeta('meta[property="article:section"]', section);
    }
    
    // Twitter/X Cards
    updateMeta('meta[name="twitter:card"]', 'summary_large_image');
    updateMeta('meta[name="twitter:site"]', '@NoorainRaza23');
    updateMeta('meta[name="twitter:creator"]', '@NoorainRaza23');
    updateMeta('meta[name="twitter:title"]', title);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta('meta[name="twitter:image"]', image);
    updateMeta('meta[name="twitter:image:alt"]', 'Noorain Raza - AI & Cloud Specialist Portfolio');
    
    // LinkedIn
    updateMeta('meta[property="linkedin:owner"]', 'noorain-raza');
    
    // Canonical URL
    updateLink('canonical', canonical);
    
    // Preconnect and DNS prefetch for performance
    updateLink('preconnect', 'https://fonts.googleapis.com');
    updateLink('preconnect', 'https://fonts.gstatic.com');
    updateLink('dns-prefetch', 'https://github.com');
    updateLink('dns-prefetch', 'https://linkedin.com');
    
    // Structured data injection
    const injectStructuredData = () => {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Noorain Raza",
        "givenName": "Noorain",
        "familyName": "Raza",
        "alternateName": ["Noorain", "Raza", "Noorain Raza"],
        "jobTitle": "Computer Science Engineering Student",
        "description": description,
        "url": canonical,
        "image": image,
        "birthPlace": "West Bengal, India",
        "nationality": "Indian",
        "gender": "Male",
        "knowsLanguage": ["English", "Hindi", "Bengali"],
        "sameAs": [
          "https://github.com/NoorainRaza23",
          "https://linkedin.com/in/noorainraza"
        ],
        "alumniOf": {
          "@type": "CollegeOrUniversity",
          "name": "Asansol Engineering College",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Asansol",
            "addressRegion": "West Bengal",
            "addressCountry": "India"
          }
        },
        "knowsAbout": keywords.split(', '),
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Developer",
          "description": "Full Stack Developer specializing in AI and Cloud technologies"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical
        }
      };
      
      let script = document.querySelector('script[data-schema="person"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema', 'person');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    };
    
    injectStructuredData();
    
  }, [title, description, keywords, canonical, image, type, publishedTime, modifiedTime, author, section]);

  return null;
};

export default SEOHead;